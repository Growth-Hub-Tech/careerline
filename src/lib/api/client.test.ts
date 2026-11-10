import { ApiError } from './ApiError';
import { createApiClient, REQUEST_TIMEOUT_MS } from './client';

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });

const setup = (respond: () => Response, token: string | null = 'token-123') => {
  const fetcher = vi.fn<typeof fetch>(() => Promise.resolve(respond()));
  const onUnauthorized = vi.fn();
  const client = createApiClient({
    baseUrl: 'https://api.example.test/',
    getToken: () => token,
    onUnauthorized,
    fetcher,
  });

  return { client, fetcher, onUnauthorized };
};

const sent = (fetcher: ReturnType<typeof vi.fn<typeof fetch>>) => {
  const [input, init] = fetcher.mock.calls[0];
  return { url: String(input), init: init ?? {}, headers: new Headers(init?.headers) };
};

const failureOf = async (request: Promise<unknown>) => {
  const failure = await request.catch((error: unknown) => error);
  expect(failure).toBeInstanceOf(ApiError);
  return failure as ApiError;
};

describe('api client', () => {
  it('calls the address under the base URL', async () => {
    const { client, fetcher } = setup(() => json({}));

    await client.get('/users/me');

    expect(sent(fetcher).url).toBe('https://api.example.test/users/me');
  });

  it('adds query values and leaves out empty ones', async () => {
    const { client, fetcher } = setup(() => json({}));

    await client.get('/tests', { query: { category: 'tech', page: 2, search: undefined } });

    expect(sent(fetcher).url).toBe('https://api.example.test/tests?category=tech&page=2');
  });

  it('asks for JSON', async () => {
    const { client, fetcher } = setup(() => json({}));

    await client.get('/tests');

    expect(sent(fetcher).headers.get('accept')).toBe('application/json');
  });

  it('adds the sign-in token', async () => {
    const { client, fetcher } = setup(() => json({}));

    await client.get('/tests');

    expect(sent(fetcher).headers.get('authorization')).toBe('Bearer token-123');
  });

  it('sends no token when signed out', async () => {
    const { client, fetcher } = setup(() => json({}), null);

    await client.get('/tests');

    expect(sent(fetcher).headers.has('authorization')).toBe(false);
  });

  it('can skip the token for one request', async () => {
    const { client, fetcher } = setup(() => json({}));

    await client.get('/prices', { auth: false });

    expect(sent(fetcher).headers.has('authorization')).toBe(false);
  });

  it('sends a body as JSON', async () => {
    const { client, fetcher } = setup(() => json({}));

    await client.post('/sign-in', { body: { email: 'skye@example.com' } });

    const { init, headers } = sent(fetcher);
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"email":"skye@example.com"}');
    expect(headers.get('content-type')).toBe('application/json');
  });

  it('sends form data untouched', async () => {
    const { client, fetcher } = setup(() => json({}));
    const form = new FormData();
    form.append('file', 'rows');

    await client.post('/staff/import', { body: form });

    const { init, headers } = sent(fetcher);
    expect(init.body).toBe(form);
    expect(headers.has('content-type')).toBe(false);
  });

  it.each([
    ['put', 'PUT'],
    ['patch', 'PATCH'],
    ['delete', 'DELETE'],
  ] as const)('has a %s shortcut', async (name, method) => {
    const { client, fetcher } = setup(() => json({}));

    await client[name]('/things/1');

    expect(sent(fetcher).init.method).toBe(method);
  });

  it('returns the parsed body', async () => {
    const { client } = setup(() => json({ name: 'Skye' }));

    await expect(client.get('/users/me')).resolves.toEqual({ name: 'Skye' });
  });

  it('returns nothing for an empty response', async () => {
    const { client } = setup(() => new Response(null, { status: 204 }));

    await expect(client.delete('/things/1')).resolves.toBeUndefined();
  });

  it('turns a failed response into an ApiError with the server details', async () => {
    const { client } = setup(() =>
      json(
        {
          message: 'Email already taken',
          code: 'email_taken',
          errors: { email: 'Already in use' },
        },
        { status: 409, headers: { 'content-type': 'application/json', 'x-request-id': 'req-42' } },
      ),
    );

    const error = await failureOf(client.post('/sign-up'));

    expect(error).toMatchObject({
      status: 409,
      message: 'Email already taken',
      code: 'email_taken',
      reference: 'req-42',
      fieldErrors: { email: 'Already in use' },
    });
  });

  it('reads field errors given as a list', async () => {
    const { client } = setup(() =>
      json({ errors: [{ field: 'email', message: 'Not a valid email' }] }, { status: 422 }),
    );

    const error = await failureOf(client.post('/sign-up'));

    expect(error.fieldErrors).toEqual({ email: 'Not a valid email' });
  });

  it('falls back to a plain message when the error is not JSON', async () => {
    const { client } = setup(() => new Response('<html>Bad gateway</html>', { status: 502 }));

    const error = await failureOf(client.get('/tests'));

    expect(error.status).toBe(502);
    expect(error.message).toMatch(/something went wrong/i);
  });

  it('reports a network failure the same way', async () => {
    const fetcher = vi.fn<typeof fetch>(() => Promise.reject(new TypeError('Failed to fetch')));
    const client = createApiClient({
      baseUrl: 'https://api.example.test',
      getToken: () => null,
      fetcher,
    });

    const error = await failureOf(client.get('/tests'));

    expect(error.status).toBe(0);
    expect(error.isNetwork).toBe(true);
  });

  it('reports a success body that is not JSON', async () => {
    const { client } = setup(() => new Response('nope', { status: 200 }));

    const error = await failureOf(client.get('/tests'));

    expect(error.code).toBe('invalid_response');
  });

  it('tells the app when a signed-in request is refused', async () => {
    const { client, onUnauthorized } = setup(() => json({}, { status: 401 }));

    await failureOf(client.get('/users/me'));

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('does not treat a refused sign-in as an expired session', async () => {
    const { client, onUnauthorized } = setup(
      () => json({ message: 'Wrong password' }, { status: 401 }),
      null,
    );

    const error = await failureOf(client.post('/sign-in'));

    expect(error.message).toBe('Wrong password');
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('lets a cancelled request through untouched', async () => {
    const fetcher = vi.fn<typeof fetch>(() =>
      Promise.reject(new DOMException('Aborted', 'AbortError')),
    );
    const client = createApiClient({
      baseUrl: 'https://api.example.test',
      getToken: () => null,
      fetcher,
    });

    await expect(client.get('/tests')).rejects.toMatchObject({ name: 'AbortError' });
  });

  it("reads field errors from the API's validation details", async () => {
    const { client } = setup(() =>
      json(
        {
          success: false,
          error: {
            code: 'validation_error',
            message: 'Request validation failed',
            details: [
              { loc: ['body', 'answers', 1, 'values'], msg: 'List should have at least 1 item' },
              { loc: ['body', 'email'], msg: 'value is not a valid email address' },
            ],
          },
        },
        { status: 422 },
      ),
    );

    const error = await failureOf(client.post('/beginner-path/intake'));

    expect(error.fieldErrors).toEqual({
      'answers.1.values': 'List should have at least 1 item',
      email: 'value is not a valid email address',
    });
  });
});

describe('api client timeout', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const aborted = () => new DOMException('Aborted', 'AbortError');

  // Never answers; rejects as fetch does when its signal is aborted
  const hangingFetch = vi.fn<typeof fetch>(
    (_input, init) =>
      new Promise((_resolve, reject) => {
        if (init?.signal?.aborted) reject(aborted());
        init?.signal?.addEventListener('abort', () => reject(aborted()));
      }),
  );

  const clientWith = (fetcher: typeof fetch) =>
    createApiClient({ baseUrl: 'https://api.example.test', getToken: () => null, fetcher });

  it('gives up on a stalled request after 20 seconds with the network error', async () => {
    const request = clientWith(hangingFetch).get('/tests');
    const failure = request.catch((error: unknown) => error);

    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS - 1);
    expect(vi.getTimerCount()).toBe(1);
    await vi.advanceTimersByTimeAsync(1);

    const error = await failure;
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).isNetwork).toBe(true);
  });

  it('gives up on a reply whose body stalls', async () => {
    const fetcher = vi.fn<typeof fetch>((_input, init) =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () =>
          new Promise<string>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(aborted()));
          }),
      } as Response),
    );
    const failure = clientWith(fetcher)
      .get('/tests')
      .catch((error: unknown) => error);

    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);

    expect(((await failure) as ApiError).isNetwork).toBe(true);
  });

  it('passes the caller cancelling straight through, not as a network error', async () => {
    const controller = new AbortController();
    const failure = clientWith(hangingFetch)
      .get('/tests', { signal: controller.signal })
      .catch((error: unknown) => error);

    controller.abort();

    expect(await failure).toMatchObject({ name: 'AbortError' });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does not start a request the caller already cancelled', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      clientWith(hangingFetch).get('/tests', { signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('leaves no timer behind once the reply is read', async () => {
    const fetcher = vi.fn<typeof fetch>(() => Promise.resolve(json({ ok: true })));

    await expect(clientWith(fetcher).get('/tests')).resolves.toEqual({ ok: true });
    expect(vi.getTimerCount()).toBe(0);
  });
});
