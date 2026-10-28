import { authApi } from '../api';
import { sessionFromToken, type Session } from '../session';

interface AuthApi {
  readonly login: (email: string, password: string) => ReturnType<typeof authApi.login>;
  readonly register: typeof authApi.register;
}

interface Credentials {
  readonly email: string;
  readonly password: string;
}

interface Registration extends Credentials {
  readonly fullName: string;
  readonly phone: string;
}

export const createAuthActions = (api: AuthApi) => {
  const signIn = async ({ email, password }: Credentials): Promise<Session> =>
    sessionFromToken(await api.login(email, password), email);

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

export const authActions = createAuthActions(authApi);
