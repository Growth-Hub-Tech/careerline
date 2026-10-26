import { ApiError } from './ApiError';
import { describeAuthError } from './describeError';

const failure = (status: number, code?: string, message = 'Server message') =>
  new ApiError({ status, code, message });

describe('describeAuthError', () => {
  it('explains an email that is already taken', () => {
    expect(describeAuthError(failure(409, 'email_taken'))).toBe(
      'An account with this email already exists. Sign in instead.',
    );
  });

  it('explains a wrong email or password', () => {
    expect(describeAuthError(failure(401, 'invalid_credentials'))).toBe(
      'That email and password do not match. Check them and try again.',
    );
  });

  it('explains an email that is not confirmed yet', () => {
    expect(describeAuthError(failure(403, 'email_not_confirmed'))).toBe(
      'Confirm your email first. Check your inbox for the link we sent you.',
    );
  });

  it('explains too many tries', () => {
    expect(describeAuthError(failure(429))).toBe(
      'Too many tries. Wait a few minutes and try again.',
    );
  });

  it('tells people when the server cannot be reached', () => {
    const offline = new ApiError({
      status: 0,
      code: 'network',
      message: 'We could not reach the server.',
    });

    expect(describeAuthError(offline)).toBe('We could not reach the server.');
  });

  it('uses the server message for anything else it sent', () => {
    expect(describeAuthError(failure(400, 'bad_input', 'Name is too long'))).toBe(
      'Name is too long',
    );
  });

  it('adds the reference number when there is one', () => {
    const error = new ApiError({
      status: 500,
      message: 'Something went wrong.',
      reference: 'req-42',
    });

    expect(describeAuthError(error)).toBe('Something went wrong. Reference: req-42');
  });

  it('never shows raw errors that are not from the API', () => {
    expect(describeAuthError(new Error('TypeError: x is undefined'))).toBe(
      'Something went wrong. Try again.',
    );
  });
});
