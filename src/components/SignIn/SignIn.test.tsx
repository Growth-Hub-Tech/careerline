import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ApiError } from '../../lib/api/ApiError';
import { createDevSession, readSession, SessionProvider } from '../../lib/session';
import { SignIn } from './SignIn';

const setup = (onSubmit?: Parameters<typeof SignIn>[0]['onSubmit']) =>
  render(
    <MemoryRouter initialEntries={['/sign-in']}>
      <SessionProvider>
        <Routes>
          <Route path="/sign-in" element={<SignIn onSubmit={onSubmit} />} />
          <Route path="/dashboard" element={<p>Dashboard page</p>} />
        </Routes>
      </SessionProvider>
    </MemoryRouter>,
  );

const fill = async (email = 'skye@example.com', password = 'secret123') => {
  if (email) await userEvent.type(screen.getByLabelText('Email'), email);
  if (password) await userEvent.type(screen.getByLabelText('Password'), password);
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
};

describe('SignIn', () => {
  it('asks for an email and a password when both are empty', async () => {
    setup();

    await fill('', '');

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('rejects an email that is not an address', async () => {
    setup();

    await fill('skye', 'secret123');

    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
  });

  it('sends the typed values', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    setup(onSubmit);

    await fill();

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'skye@example.com',
      password: 'secret123',
      remember: false,
    });
  });

  it('signs in and opens the dashboard when a session comes back', async () => {
    setup(vi.fn().mockResolvedValue(createDevSession('recruiter')));

    await fill();

    expect(await screen.findByText('Dashboard page')).toBeInTheDocument();
    expect(readSession()?.user.userType).toBe('recruiter');
  });

  it.each([
    [401, 'invalid_credentials', 'That email and password do not match. Check them and try again.'],
    [
      403,
      'email_not_confirmed',
      'Confirm your email first. Check your inbox for the link we sent you.',
    ],
    [429, undefined, 'Too many tries. Wait a few minutes and try again.'],
  ] as const)('shows a clear message for a %s error', async (status, code, message) => {
    setup(vi.fn().mockRejectedValue(new ApiError({ status, code, message: 'raw' })));

    await fill();

    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument();
  });

  it('clears the message when the person tries again', async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(
        new ApiError({ status: 401, code: 'invalid_credentials', message: 'x' }),
      )
      .mockResolvedValue(createDevSession('beginner'));
    setup(onSubmit);

    await fill();
    await screen.findByRole('alert');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Dashboard page')).toBeInTheDocument();
  });
});
