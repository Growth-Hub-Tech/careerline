import {
  wasSessionExpired,
  clearSession,
  expireSession,
  readSession,
  SESSION_EXPIRED_EVENT,
  SESSION_KEY,
  writeSession,
} from './storage';
import type { Session } from './types';

const SESSION: Session = {
  user: { name: 'Skye Favour', email: 'skye@example.com', userType: 'beginner' },
};

describe('session storage', () => {
  it('has no session at first', () => {
    expect(readSession()).toBeNull();
  });

  it('reads back what was written', () => {
    writeSession(SESSION);

    expect(readSession()).toEqual(SESSION);
  });

  it('forgets a cleared session', () => {
    writeSession(SESSION);

    clearSession();

    expect(readSession()).toBeNull();
  });

  it('ignores text that is not JSON', () => {
    window.localStorage.setItem(SESSION_KEY, '{oops');

    expect(readSession()).toBeNull();
  });

  it('signs out a session saved with a token from before the cookie, and removes the token', () => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ token: 'abc123', ...SESSION }));

    expect(readSession()).toBeNull();
    expect(window.localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('keeps only who is signed in, never a token', () => {
    writeSession(SESSION);

    expect(window.localStorage.getItem(SESSION_KEY)).not.toMatch(/token/i);
  });

  it('ignores a session with an unknown user type', () => {
    const stored = { ...SESSION, user: { ...SESSION.user, userType: 'admin' } };
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(stored));

    expect(readSession()).toBeNull();
  });

  it('clears the session and announces it when it expires', () => {
    writeSession(SESSION);
    const listener = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, listener);

    expireSession();

    expect(readSession()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(SESSION_EXPIRED_EVENT, listener);
  });

  it('remembers that the session ended until the next sign-in', () => {
    writeSession(SESSION);
    expireSession();

    expect(wasSessionExpired()).toBe(true);

    writeSession(SESSION);

    expect(wasSessionExpired()).toBe(false);
  });
});
