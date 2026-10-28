import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { ApiError } from '../../lib/api/ApiError';
import { rememberPendingEmail, SessionProvider } from '../../lib/session';
import { signInAs } from '../../test/session';
import { VerifyEmail } from './VerifyEmail';

vi.mock('../../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/api')>()),
  authApi: { resendVerification: vi.fn(), verifyEmail: vi.fn() },
}));

const setup = (email?: string) =>
  render(
    <MemoryRouter>
      <SessionProvider>
        <VerifyEmail email={email} />
      </SessionProvider>
    </MemoryRouter>,
  );

describe('VerifyEmail', () => {
  it('says where the email was sent, using the address typed at sign-up', () => {
    rememberPendingEmail('skye@example.com');

    setup();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Verify your email' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/we sent a verification link to skye@example\.com/i),
    ).toBeInTheDocument();
  });

  it('prefers an email given directly', () => {
    rememberPendingEmail('skye@example.com');

    setup('other@example.com');

    expect(
      screen.getByText(/we sent a verification link to other@example\.com/i),
    ).toBeInTheDocument();
  });

  it('falls back to the email of the signed-in person', () => {
    signInAs();

    setup();

    expect(
      screen.getByText(/we sent a verification link to skye@example\.com/i),
    ).toBeInTheDocument();
  });

  it('does not invent an address when none is known', () => {
    setup();

    expect(
      screen.getByText(/we sent a verification link to your email address/i),
    ).toBeInTheDocument();
  });

  it('has no stand-in link for skipping verification', () => {
    setup();

    expect(screen.queryByText("I've verified my email")).not.toBeInTheDocument();
  });

  it('sends the email again when asked', async () => {
    signInAs();
    vi.mocked(authApi.resendVerification).mockResolvedValue({ status: 'accepted' });
    setup();

    await userEvent.click(screen.getByRole('button', { name: 'Resend email' }));

    expect(await screen.findByRole('status')).toHaveTextContent('We have sent the email again.');
    expect(authApi.resendVerification).toHaveBeenCalledTimes(1);
  });

  it('says why it could not send again', async () => {
    signInAs();
    vi.mocked(authApi.resendVerification).mockRejectedValue(
      new ApiError({ status: 429, message: 'x', retryAfter: 30 }),
    );
    setup();

    await userEvent.click(screen.getByRole('button', { name: 'Resend email' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many tries. Try again in 30 seconds.',
    );
  });

  it('asks signed-out people to sign in before sending again', () => {
    setup();

    expect(screen.queryByRole('button', { name: 'Resend email' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/sign-in');
  });
});
