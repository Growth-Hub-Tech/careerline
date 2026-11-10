import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { readSession, SessionProvider } from '../../lib/session';
import { signInAs } from '../../test/session';
import { AppLayout } from './AppLayout';

vi.mock('../../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/api')>()),
  authApi: { logout: vi.fn() },
}));

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
