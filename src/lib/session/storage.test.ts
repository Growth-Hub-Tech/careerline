import {
  clearSession,
  expireSession,
  readSession,
  SESSION_EXPIRED_EVENT,
  SESSION_KEY,
  writeSession,
} from './storage';
import type { Session } from './types';

const SESSION: Session = {
  token: 'abc123',
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

  it('ignores a session without a token', () => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ user: SESSION.user }));

    expect(readSession()).toBeNull();
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
});
