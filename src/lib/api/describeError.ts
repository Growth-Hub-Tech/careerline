import { ApiError } from './ApiError';

const EMAIL_TAKEN = ['email_taken', 'email_exists', 'user_exists', 'already_exists'];
const NOT_CONFIRMED = ['email_not_confirmed', 'email_not_verified', 'unverified_email'];
const WRONG_LOGIN = ['invalid_credentials', 'wrong_password'];
const TOO_MANY = ['too_many_requests', 'rate_limited'];

const GENERIC = 'Something went wrong. Try again.';

export const describeAuthError = (error: unknown): string => {
  if (!(error instanceof ApiError)) return GENERIC;

  const code = error.code?.toLowerCase() ?? '';

  if (error.isNetwork) return error.message;
  if (NOT_CONFIRMED.includes(code)) {
    return 'Confirm your email first. Check your inbox for the link we sent you.';
  }
  if (EMAIL_TAKEN.includes(code) || error.status === 409) {
    return 'An account with this email already exists. Sign in instead.';
  }
  if (TOO_MANY.includes(code) || error.status === 429) {
    return 'Too many tries. Wait a few minutes and try again.';
  }
  if (WRONG_LOGIN.includes(code) || error.status === 401) {
    return 'That email and password do not match. Check them and try again.';
  }
  if (error.status >= 500 && error.reference) {
    return `${error.message} Reference: ${error.reference}`;
  }

  return error.message;
};
