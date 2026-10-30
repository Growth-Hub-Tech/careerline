import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { authActions } from '../../lib/auth/actions';
import { createDevSession, readSession, SessionProvider, writeRole } from '../../lib/session';
import { SignIn } from './SignIn';

vi.mock('../../lib/auth/actions', () => ({
  authActions: { signIn: vi.fn(), register: vi.fn() },
}));

const setup = () =>
  render(
    <MemoryRouter initialEntries={['/sign-in']}>
      <SessionProvider>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/dashboard" element={<p>Dashboard page</p>} />
        </Routes>
      </SessionProvider>
    </MemoryRouter>,
  );

describe('SignIn with the API', () => {
  it('signs in through the API when no handler is given', async () => {
    vi.mocked(authActions.signIn).mockResolvedValue(createDevSession('beginner'));
    writeRole('skye@example.com', 'beginner');
    setup();

    await userEvent.type(screen.getByLabelText('Email'), 'skye@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Dashboard page')).toBeInTheDocument();
    expect(authActions.signIn).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'skye@example.com', password: 'secret123' }),
    );
    expect(readSession()).not.toBeNull();
  });
});
