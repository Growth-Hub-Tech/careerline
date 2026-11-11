import { apiGet, apiPost, API_ROUTES } from '../api';
import { ApiError } from '../api/ApiError';
import { SESSION_COOKIE_BLOCKED } from '../api/describeError';
import type { Account, RegisterRequest, TokenResponse } from '../api/types';

interface Credentials {
  readonly email: string;
  readonly password: string;
}

export interface Registration extends Credentials {
  readonly fullName: string;
  readonly phone: string;
}

// The account says who this is on any device (its organisation role). It is read right after
// signing in, with the session cookie the sign-in has just set: a 401 here means the browser
// refused the cookie.
const accountAfterSignIn = async () => {
  try {
    return await apiGet<Account>(API_ROUTES.accounts.me);
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

export const signInWithPassword = async ({ email, password }: Credentials): Promise<Account> => {
  await apiPost<TokenResponse>(
    API_ROUTES.auth.login,
    new URLSearchParams({ username: email, password }),
    { auth: false },
  );
  return accountAfterSignIn();
};

// A new account is signed in straight away when it can be; if that fails the person signs in
// after confirming their email
export const registerAccount = async ({
  email,
  fullName,
  phone,
  password,
}: Registration): Promise<Account | undefined> => {
  const details: RegisterRequest = { full_name: fullName, email, phone, password };
  await apiPost<unknown>(API_ROUTES.auth.register, details, { auth: false });

  try {
    return await signInWithPassword({ email, password });
  } catch {
    return undefined;
  }
};

export const signOutOfApi = (everywhere = false) =>
  apiPost<unknown>(API_ROUTES.auth.logout, undefined, { query: { everywhere } });
