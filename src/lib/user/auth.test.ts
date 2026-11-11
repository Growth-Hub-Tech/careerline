import { apiGet, apiPost } from '../api';
import { ApiError } from '../api/ApiError';
import { SESSION_COOKIE_BLOCKED } from '../api/describeError';
import { account } from '../../test/fixtures/account';
import { registerAccount, signInWithPassword, signOutOfApi } from './auth';

vi.mock('../api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api')>()),
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

const CREDENTIALS = { email: 'skye@example.com', password: 'secret123' };

beforeEach(() => {
  vi.mocked(apiPost).mockResolvedValue({ access_token: 'x', token_type: 'bearer' });
  vi.mocked(apiGet).mockResolvedValue(account());
});

afterEach(() => vi.clearAllMocks());

describe('signing in', () => {
  it('sends the login form, then reads the account with the new cookie', async () => {
    await expect(signInWithPassword(CREDENTIALS)).resolves.toEqual(account());

    const [path, body, options] = vi.mocked(apiPost).mock.calls[0];
    expect(path).toBe('/auth/login');
    expect(String(body)).toBe('username=skye%40example.com&password=secret123');
    expect(options).toEqual({ auth: false });
    expect(apiGet).toHaveBeenCalledWith('/accounts/me');
  });

  it('says the browser refused the cookie when the account cannot be read', async () => {
    vi.mocked(apiGet).mockRejectedValue(new ApiError({ status: 401, message: 'x' }));

    await expect(signInWithPassword(CREDENTIALS)).rejects.toMatchObject({
      code: SESSION_COOKIE_BLOCKED,
    });
  });

  it('passes any other failure on', async () => {
    const down = new ApiError({ status: 503, message: 'Down' });
    vi.mocked(apiGet).mockRejectedValue(down);

    await expect(signInWithPassword(CREDENTIALS)).rejects.toBe(down);
  });
});

describe('creating an account', () => {
  const REGISTRATION = { ...CREDENTIALS, fullName: 'Skye Favour', phone: '08012345678' };

  it('registers and signs straight in', async () => {
    await expect(registerAccount(REGISTRATION)).resolves.toEqual(account());

    expect(apiPost).toHaveBeenNthCalledWith(
      1,
      '/auth/register',
      {
        full_name: 'Skye Favour',
        email: 'skye@example.com',
        phone: '08012345678',
        password: 'secret123',
      },
      { auth: false },
    );
  });

  it('still succeeds when signing in afterwards does not work', async () => {
    vi.mocked(apiGet).mockRejectedValue(new ApiError({ status: 403, message: 'Confirm first' }));

    await expect(registerAccount(REGISTRATION)).resolves.toBeUndefined();
  });

  it('fails when the account cannot be created', async () => {
    const taken = new ApiError({ status: 409, message: 'Taken' });
    vi.mocked(apiPost).mockRejectedValueOnce(taken);

    await expect(registerAccount(REGISTRATION)).rejects.toBe(taken);
  });
});

describe('signing out', () => {
  it('can end every session', async () => {
    await signOutOfApi(true);

    expect(apiPost).toHaveBeenCalledWith('/auth/logout', undefined, {
      query: { everywhere: true },
    });
  });
});
