import { ApiError } from './ApiError';
import { createApiClient } from './client';
import { describeAuthError } from './describeError';

const reply = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });

const clientFor = (response: Response) =>
  createApiClient({
    baseUrl: 'https://api.example.test/api/v1',
    getToken: () => null,
    fetcher: vi.fn<typeof fetch>(() => Promise.resolve(response)),
  });

const failureOf = async (request: Promise<unknown>) => {
  const failure = await request.catch((error: unknown) => error);
  expect(failure).toBeInstanceOf(ApiError);
  return failure as ApiError;
};

describe('API reply envelope', () => {
  it('hands back only the data of a successful reply', async () => {
    const client = clientFor(reply({ success: true, message: 'ok', data: { id: 7 } }));

    await expect(client.get('/profile')).resolves.toEqual({ id: 7 });
  });

  it('reads the code, message, reference and details of a failed reply', async () => {
    const client = clientFor(
      reply(
        {
          success: false,
          error: {
            code: 'email_taken',
            message: 'That email is already registered.',
            request_id: 'req-9',
            details: 'email',
          },
        },
        { status: 409 },
      ),
    );

    const error = await failureOf(client.post('/auth/register'));

    expect(error).toMatchObject({
      status: 409,
      code: 'email_taken',
      message: 'That email is already registered.',
      reference: 'req-9',
      details: 'email',
    });
  });

  it('reads how long to wait from a too-many-requests reply', async () => {
    const client = clientFor(
      reply(
        { success: false, error: { code: 'rate_limited', message: 'Slow down' } },
        { status: 429, headers: { 'content-type': 'application/json', 'retry-after': '45' } },
      ),
    );

    const error = await failureOf(client.post('/auth/login'));

    expect(error.retryAfter).toBe(45);
  });
});

describe('describeAuthError with a wait time', () => {
  it('says how many seconds to wait', () => {
    const error = new ApiError({ status: 429, message: 'x', retryAfter: 45 });

    expect(describeAuthError(error)).toBe('Too many tries. Try again in 45 seconds.');
  });

  it('rounds longer waits up to minutes', () => {
    const error = new ApiError({ status: 429, message: 'x', retryAfter: 150 });

    expect(describeAuthError(error)).toBe('Too many tries. Try again in 3 minutes.');
  });

  it('says one minute in the singular', () => {
    const error = new ApiError({ status: 429, message: 'x', retryAfter: 60 });

    expect(describeAuthError(error)).toBe('Too many tries. Try again in 1 minute.');
  });
});
