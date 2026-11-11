import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { accountsApi, authApi } from '../../lib/api';
import { readSession, SessionProvider, writeRole } from '../../lib/session';
import { account } from '../../test/fixtures/account';
import { signInAs } from '../../test/session';
import { AppLayout } from './AppLayout';

vi.mock('../../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/api')>()),
  authApi: { logout: vi.fn() },
  accountsApi: { me: vi.fn() },
}));

beforeEach(() => {
  vi.mocked(accountsApi.me).mockResolvedValue(account());
});

const setup = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <SessionProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<h1>Dashboard</h1>} />
          </Route>
          <Route path="/sign-in" element={<h1>Sign in page</h1>} />
        </Routes>
      </SessionProvider>
    </MemoryRouter>,
  );

describe('AppLayout sign out', () => {
  it('ends the session on the server and in the browser', async () => {
    vi.mocked(authApi.logout).mockResolvedValue({ status: 'accepted' });
    signInAs('self-test');
    setup();

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(authApi.logout).toHaveBeenCalledWith();
    expect(await screen.findByRole('heading', { name: 'Sign in page' })).toBeInTheDocument();
    expect(readSession()).toBeNull();
  });

  it('still signs out in the browser when the server cannot be reached', async () => {
    vi.mocked(authApi.logout).mockRejectedValue(new Error('offline'));
    signInAs('self-test');
    setup();

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(await screen.findByRole('heading', { name: 'Sign in page' })).toBeInTheDocument();
    expect(readSession()).toBeNull();
  });
});

describe('AppLayout user type', () => {
  it('takes the type from the organisation role on load, as on a new device', async () => {
    vi.mocked(accountsApi.me).mockResolvedValue(
      account({ organisation_id: 41, organisation_role: 'owner' }),
    );
    signInAs('beginner');
    setup();

    await waitFor(() => expect(readSession()?.user.userType).toBe('organization'));
    expect(screen.getByText('Organization')).toBeInTheDocument();
  });

  it('keeps the type chosen here for an account outside any organisation', async () => {
    writeRole('skye@example.com', 'self-test');
    signInAs('self-test');
    setup();

    await waitFor(() => expect(accountsApi.me).toHaveBeenCalledTimes(1));
    expect(readSession()?.user.userType).toBe('self-test');
  });

  it('keeps the type when the account cannot be read', async () => {
    vi.mocked(accountsApi.me).mockRejectedValue(new Error('offline'));
    signInAs('self-test');
    setup();

    await waitFor(() => expect(accountsApi.me).toHaveBeenCalled());
    expect(readSession()?.user.userType).toBe('self-test');
  });

  it('does not sign anyone back in when the reply comes after signing out', async () => {
    let reply: (value: ReturnType<typeof account>) => void = () => undefined;
    vi.mocked(accountsApi.me).mockReturnValue(
      new Promise((resolve) => {
        reply = resolve;
      }),
    );
    vi.mocked(authApi.logout).mockResolvedValue({ status: 'accepted' });
    signInAs('beginner');
    setup();

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    await act(async () => reply(account({ organisation_id: 41, organisation_role: 'owner' })));

    expect(readSession()).toBeNull();
    expect(screen.getByRole('heading', { name: 'Sign in page' })).toBeInTheDocument();
  });
});
