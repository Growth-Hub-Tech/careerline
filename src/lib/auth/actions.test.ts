import { ApiError } from '../api/ApiError';
import { createAuthActions } from './actions';

const TOKEN = {
  access_token: 'abc123',
  token_type: 'bearer',
  learner_id: 7,
  full_name: 'Skye Favour',
};

const setup = () => {
  const authApi = {
    login: vi.fn().mockResolvedValue(TOKEN),
    register: vi.fn().mockResolvedValue(undefined),
  };
  return { authApi, actions: createAuthActions(authApi) };
};

describe('auth actions', () => {
  it('signs in and returns a session', async () => {
    const { authApi, actions } = setup();

    const session = await actions.signIn({ email: 'skye@example.com', password: 'secret123' });

    expect(authApi.login).toHaveBeenCalledWith('skye@example.com', 'secret123');
    expect(session).toEqual({
      token: 'abc123',
      user: { name: 'Skye Favour', email: 'skye@example.com', userType: 'beginner' },
    });
  });

  it('registers and then signs the new person in', async () => {
    const { authApi, actions } = setup();

    const session = await actions.register({
      email: 'skye@example.com',
      fullName: 'Skye Favour',
      phone: '+2348012345678',
      password: 'longenough1',
    });

    expect(authApi.register).toHaveBeenCalledWith({
      full_name: 'Skye Favour',
      email: 'skye@example.com',
      phone: '+2348012345678',
      password: 'longenough1',
    });
    expect(authApi.login).toHaveBeenCalledWith('skye@example.com', 'longenough1');
    expect(session?.token).toBe('abc123');
  });

  it('does not try to sign in when registering fails', async () => {
    const { authApi, actions } = setup();
    authApi.register.mockRejectedValue(
      new ApiError({ status: 409, code: 'email_taken', message: 'x' }),
    );

    await expect(
      actions.register({
        email: 'a@b.co',
        fullName: 'A B',
        phone: '0801234567',
        password: 'longenough1',
      }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(authApi.login).not.toHaveBeenCalled();
  });

  it('still succeeds when the new account cannot sign in yet', async () => {
    const { authApi, actions } = setup();
    authApi.login.mockRejectedValue(
      new ApiError({ status: 403, code: 'email_not_confirmed', message: 'x' }),
    );

    const session = await actions.register({
      email: 'skye@example.com',
      fullName: 'Skye Favour',
      phone: '08012345678',
      password: 'longenough1',
    });

    expect(authApi.register).toHaveBeenCalledTimes(1);
    expect(session).toBeUndefined();
  });
});
