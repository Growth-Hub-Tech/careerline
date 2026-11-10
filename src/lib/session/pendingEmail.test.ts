import { readPendingEmail, rememberPendingEmail } from './pendingEmail';

describe('pending email', () => {
  it('has nothing at first', () => {
    expect(readPendingEmail()).toBeUndefined();
  });

  it('remembers the email typed at sign-up', () => {
    rememberPendingEmail('skye@example.com');

    expect(readPendingEmail()).toBe('skye@example.com');
  });
});
