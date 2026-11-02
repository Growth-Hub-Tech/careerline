import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionProvider } from './SessionProvider';
import { expireSession, readSession, SESSION_KEY, writeSession } from './storage';
import type { Session } from './types';
import { useSession } from './useSession';

const SESSION: Session = {
  token: 'abc123',
  user: { name: 'Skye Favour', email: 'skye@example.com', userType: 'beginner' },
};

const Probe = () => {
  const { session, signIn, signOut } = useSession();

  return (
    <div>
      <p>{session ? `Signed in as ${session.user.name}` : 'Signed out'}</p>
      <button type="button" onClick={() => signIn(SESSION)}>
        Sign in
      </button>
      <button type="button" onClick={signOut}>
        Sign out
      </button>
    </div>
  );
};

const setup = () =>
  render(
    <SessionProvider>
      <Probe />
    </SessionProvider>,
  );

describe('SessionProvider', () => {
  it('starts signed out when nothing is stored', () => {
    setup();

    expect(screen.getByText('Signed out')).toBeInTheDocument();
  });

  it('keeps people signed in after a reload', () => {
    writeSession(SESSION);

    setup();

    expect(screen.getByText('Signed in as Skye Favour')).toBeInTheDocument();
  });

  it('signs in and remembers the session', async () => {
    setup();

    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(screen.getByText('Signed in as Skye Favour')).toBeInTheDocument();
    expect(readSession()).toEqual(SESSION);
  });

  it('signs out and forgets the session', async () => {
    writeSession(SESSION);
    setup();

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(screen.getByText('Signed out')).toBeInTheDocument();
    expect(readSession()).toBeNull();
  });

  it('signs out when the server says the session has expired', () => {
    writeSession(SESSION);
    setup();

    act(() => expireSession());

    expect(screen.getByText('Signed out')).toBeInTheDocument();
  });

  it('signs out when another tab signs out', () => {
    writeSession(SESSION);
    setup();

    window.localStorage.removeItem(SESSION_KEY);
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: SESSION_KEY }));
    });

    expect(screen.getByText('Signed out')).toBeInTheDocument();
  });

  it('refuses to be used outside the provider', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => render(<Probe />)).toThrow('useSession must be used inside SessionProvider');

    error.mockRestore();
  });
});
