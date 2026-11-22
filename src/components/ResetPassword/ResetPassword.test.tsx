import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { apiPost } from '../../lib/api';
import { ApiError } from '../../lib/api/ApiError';
import { ResetPassword } from './ResetPassword';

vi.mock('../../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/api')>()),
  apiPost: vi.fn(),
}));

const SignInPage = () => {
  const { state } = useLocation() as { state: { passwordReset?: boolean } | null };
  return <h1>{state?.passwordReset ? 'Signed out after reset' : 'Sign in'}</h1>;
};

const setup = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={['/forgot-password']}>
        <Routes>
          <Route path="/forgot-password" element={<ResetPassword />} />
          <Route path="/sign-in" element={<SignInPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

const fillIn = async (pin = '1234') => {
  await userEvent.type(screen.getByLabelText('Email'), 'skye@example.com');
  await userEvent.type(screen.getByLabelText('Reset PIN'), pin);
  await userEvent.type(screen.getByLabelText('New password'), 'a-new-password');
  await userEvent.type(screen.getByLabelText('Confirm new password'), 'a-new-password');
  await userEvent.click(screen.getByRole('button', { name: 'Reset password' }));
};

describe('ResetPassword', () => {
  it('tells people the reset PIN', () => {
    setup();

    expect(screen.getByText('Your reset PIN is 1234.')).toBeInTheDocument();
  });

  it('resets the password and sends people to sign in', async () => {
    vi.mocked(apiPost).mockResolvedValue({ status: 'accepted' });
    setup();

    await fillIn();

    expect(apiPost).toHaveBeenCalledWith(
      '/accounts/password-reset/confirm',
      { email: 'skye@example.com', pin: '1234', new_password: 'a-new-password' },
      { auth: false },
    );
    expect(
      await screen.findByRole('heading', { name: 'Signed out after reset' }),
    ).toBeInTheDocument();
  });

  it('explains a wrong PIN and keeps the form', async () => {
    vi.mocked(apiPost).mockRejectedValue(
      new ApiError({ status: 400, code: 'invalid_reset_pin', message: 'No match' }),
    );
    setup();

    await fillIn('0000');

    expect(
      await screen.findByText('That email and reset PIN do not match. Check them and try again.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveValue('skye@example.com');
  });

  it('explains when there were too many tries', async () => {
    vi.mocked(apiPost).mockRejectedValue(
      new ApiError({ status: 429, code: 'rate_limited', message: 'Slow down', retryAfter: 120 }),
    );
    setup();

    await fillIn();

    expect(await screen.findByText('Too many tries. Try again in 2 minutes.')).toBeInTheDocument();
  });
});
