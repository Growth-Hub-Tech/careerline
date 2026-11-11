import { accountsApi, authApi } from '../api';
import { ApiError } from '../api/ApiError';
import { SESSION_COOKIE_BLOCKED } from '../api/describeError';
import { sessionFromToken, userTypeFor, type Session } from '../session';

interface AuthApi {
  readonly login: (email: string, password: string) => ReturnType<typeof authApi.login>;
  readonly register: typeof authApi.register;
  readonly me: typeof accountsApi.me;
}

interface Credentials {
  readonly email: string;
  readonly password: string;
}

interface Registration extends Credentials {
  readonly fullName: string;
  readonly phone: string;
}

// The account says who this is on any device (its organisation role); it is read right after
// signing in, with the session cookie the sign-in has just set
const accountAfterSignIn = async (api: AuthApi) => {
  try {
    return await api.me();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw new ApiError({
        status: 401,
        code: SESSION_COOKIE_BLOCKED,
        message:
          'Your browser did not keep you signed in. Allow cookies for this site and try again.',
      });
    }
    throw error;
  }
};

export const createAuthActions = (api: AuthApi) => {
  const signIn = async ({ email, password }: Credentials): Promise<Session> => {
    const token = await api.login(email, password);
    const account = await accountAfterSignIn(api);
    return sessionFromToken(token, email, userTypeFor(email, account.organisation_role));
  };

  const register = async ({
    email,
    fullName,
    phone,
    password,
  }: Registration): Promise<Session | undefined> => {
    await api.register({ full_name: fullName, email, phone, password });

    try {
      return await signIn({ email, password });
    } catch {
      return undefined;
    }
  };

  return { signIn, register };
};

export const authActions = createAuthActions({
  login: authApi.login,
  register: authApi.register,
  me: accountsApi.me,
});
