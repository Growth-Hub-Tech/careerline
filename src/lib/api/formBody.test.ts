import { createApiClient } from './client';

describe('api client form bodies', () => {
  it('sends URL-encoded form data untouched and without a JSON content type', async () => {
    const fetcher = vi.fn<typeof fetch>(() =>
      Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 })),
    );
    const client = createApiClient({
      baseUrl: 'https://api.example.test',
      getToken: () => null,
      fetcher,
    });
    const form = new URLSearchParams({ username: 'skye@example.com', password: 'secret123' });

    await client.post('/auth/login', { body: form });

    const [, init] = fetcher.mock.calls[0];
    expect(init?.body).toBe(form);
    expect(new Headers(init?.headers).has('content-type')).toBe(false);
  });
});
