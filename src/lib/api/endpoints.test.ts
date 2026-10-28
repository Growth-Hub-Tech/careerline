import { createApiClient } from './client';
import {
  createAuthApi,
  createBeginnerApi,
  createContactApi,
  createProgrammesApi,
} from './endpoints';

const setup = (body: unknown = { success: true, data: {} }) => {
  const fetcher = vi.fn<typeof fetch>(() =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    ),
  );
  const client = createApiClient({
    baseUrl: 'https://api.example.test/api/v1',
    getToken: () => 'token-123',
    fetcher,
  });

  return { fetcher, client };
};

const sent = (fetcher: ReturnType<typeof setup>['fetcher']) => {
  const [input, init] = fetcher.mock.calls[0];
  return { url: String(input), init: init ?? {}, headers: new Headers(init?.headers) };
};

describe('auth endpoints', () => {
  it('logs in with a form body and no token', async () => {
    const reply = { access_token: 'abc', token_type: 'bearer', learner_id: 7, full_name: 'Skye' };
    const { fetcher, client } = setup(reply);

    const token = await createAuthApi(client).login('skye@example.com', 'secret123');

    const { url, init, headers } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/auth/login');
    expect(init.method).toBe('POST');
    expect((init.body as URLSearchParams).get('username')).toBe('skye@example.com');
    expect((init.body as URLSearchParams).get('password')).toBe('secret123');
    expect(headers.has('authorization')).toBe(false);
    expect(token).toEqual(reply);
  });

  it('registers with the four fields the API asks for', async () => {
    const { fetcher, client } = setup();
    const details = {
      full_name: 'Skye Favour',
      email: 'skye@example.com',
      phone: '+2348012345678',
      password: 'longenough1',
    };

    await createAuthApi(client).register(details);

    const { url, init, headers } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/auth/register');
    expect(JSON.parse(String(init.body))).toEqual(details);
    expect(headers.has('authorization')).toBe(false);
  });

  it('asks for a password reset link', async () => {
    const { fetcher, client } = setup();

    await createAuthApi(client).requestPasswordReset('skye@example.com');

    const { url, init } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/accounts/password-reset');
    expect(JSON.parse(String(init.body))).toEqual({ email: 'skye@example.com' });
  });
});

describe('email verification endpoints', () => {
  it('confirms an email with the token from the link and no sign-in', async () => {
    const { fetcher, client } = setup({ success: true, data: { status: 'accepted' } });

    const result = await createAuthApi(client).verifyEmail('abc-123');

    const { url, init, headers } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/accounts/verify-email');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ token: 'abc-123' });
    expect(headers.has('authorization')).toBe(false);
    expect(result).toEqual({ status: 'accepted' });
  });

  it('asks for the email to be sent again with the sign-in token', async () => {
    const { fetcher, client } = setup({ success: true, data: { status: 'accepted' } });

    await createAuthApi(client).resendVerification();

    const { url, init, headers } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/accounts/verify-email/resend');
    expect(init.method).toBe('POST');
    expect(headers.get('authorization')).toBe('Bearer token-123');
  });
});

describe('contact endpoint', () => {
  it('sends the message and returns the receipt', async () => {
    const receipt = { ticket_id: 'T-1', status: 'received', received_at: '2026-10-26T08:00:00Z' };
    const { fetcher, client } = setup({ success: true, message: null, data: receipt });
    const message = {
      full_name: 'Skye Favour',
      email: 'skye@example.com',
      topic: 'general' as const,
      message: 'Hello, I have a question.',
    };

    const result = await createContactApi(client).send(message);

    const { url, init } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/contact');
    expect(JSON.parse(String(init.body))).toEqual(message);
    expect(result).toEqual(receipt);
  });
});

describe('beginner path endpoints', () => {
  it('loads the questionnaire with the token', async () => {
    const { fetcher, client } = setup({ success: true, data: { version: 'v1', questions: [] } });

    const result = await createBeginnerApi(client).getIntake();

    const { url, headers } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/beginner-path/intake');
    expect(headers.get('authorization')).toBe('Bearer token-123');
    expect(result).toEqual({ version: 'v1', questions: [] });
  });

  it('submits the answers', async () => {
    const { fetcher, client } = setup({ success: true, data: { intake_id: 1 } });
    const submission = { version: 'v1', answers: [{ question_id: 'a', values: ['x'] }] };

    await createBeginnerApi(client).submitIntake(submission);

    const { url, init } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/beginner-path/intake');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual(submission);
  });

  it('loads the saved recommendations', async () => {
    const { fetcher, client } = setup();

    await createBeginnerApi(client).getRecommendations();

    expect(sent(fetcher).url).toBe('https://api.example.test/api/v1/beginner-path/recommendations');
  });
});

describe('programme endpoints', () => {
  it('loads one programme', async () => {
    const { fetcher, client } = setup();

    await createProgrammesApi(client).get(5);

    expect(sent(fetcher).url).toBe('https://api.example.test/api/v1/programmes/5');
  });

  it('records a click', async () => {
    const { fetcher, client } = setup({ success: true, data: { redirect_url: 'https://x.test' } });

    const click = await createProgrammesApi(client).recordClick(5, { source: 'beginner_path' });

    const { url, init } = sent(fetcher);
    expect(url).toBe('https://api.example.test/api/v1/programmes/5/clicks');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ source: 'beginner_path' });
    expect(click).toEqual({ redirect_url: 'https://x.test' });
  });
});
