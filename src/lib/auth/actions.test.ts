import { ApiError } from '../api/ApiError';
import { describeAuthError } from '../api/describeError';
import { writeRole } from '../session';
import { account } from '../../test/fixtures/account';
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
    me: vi.fn().mockResolvedValue(account()),
  };
  return { authApi, actions: createAuthActions(authApi) };
};

const signIn = (actions: ReturnType<typeof setup>['actions']) =>
  actions.signIn({ email: 'skye@example.com', password: 'secret123' });

describe('auth actions', () => {
  it('signs in and returns a session', async () => {
    const { authApi, actions } = setup();

    const session = await actions.signIn({ email: 'skye@example.com', password: 'secret123' });

    expect(authApi.login).toHaveBeenCalledWith('skye@example.com', 'secret123');
    expect(session).toEqual({
      user: { name: 'Skye Favour', email: 'skye@example.com', userType: 'beginner' },
    });
  });

  it.each([
    ['owner', 'organization'],
    ['admin', 'organization'],
    ['recruiter', 'recruiter'],
  ] as const)(
    'makes an organisation %s the %s type, on any device',
    async (organisationRole, userType) => {
      const { authApi, actions } = setup();
      authApi.me.mockResolvedValue(
        account({ organisation_id: 41, organisation_role: organisationRole }),
      );
      writeRole('skye@example.com', 'beginner'); // a choice made here before does not win

      expect((await signIn(actions)).user.userType).toBe(userType);
    },
  );

  it('keeps the type chosen here for an account outside any organisation', async () => {
    const { actions } = setup();
    writeRole('skye@example.com', 'self-test');

    expect((await signIn(actions)).user.userType).toBe('self-test');
  });

  it('says so when the browser refused the sign-in cookie', async () => {
    const { authApi, actions } = setup();
    authApi.me.mockRejectedValue(new ApiError({ status: 401, message: 'Not signed in' }));

    const error = await signIn(actions).catch((failure: unknown) => failure);

    expect(describeAuthError(error)).toBe(
      'Your browser did not keep you signed in. Allow cookies for this site and try again.',
    );
  });

  it('fails the sign-in with the reason when the account cannot be read', async () => {
    const { authApi, actions } = setup();
    const offline = new ApiError({
      status: 0,
      code: 'network',
      message: 'We could not reach the server.',
    });
    authApi.me.mockRejectedValue(offline);

    await expect(signIn(actions)).rejects.toBe(offline);
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
    expect(session?.user.email).toBe('skye@example.com');
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
