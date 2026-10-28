import { StrictMode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { ApiError } from '../../lib/api/ApiError';
import { SessionProvider } from '../../lib/session';
import { signInAs } from '../../test/session';
import { ConfirmEmail } from './ConfirmEmail';

vi.mock('../../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/api')>()),
  authApi: { resendVerification: vi.fn(), verifyEmail: vi.fn() },
}));

const setup = (token: string) =>
  render(
    <StrictMode>
      <MemoryRouter>
        <SessionProvider>
          <ConfirmEmail token={token} />
        </SessionProvider>
      </MemoryRouter>
    </StrictMode>,
  );

describe('ConfirmEmail', () => {
  it('shows that it is checking the link', () => {
    vi.mocked(authApi.verifyEmail).mockReturnValue(new Promise(() => undefined));

    setup('token-loading');

    expect(screen.getByRole('status')).toHaveTextContent('Confirming your email');
  });

  it('confirms the email once, even in strict mode', async () => {
    vi.mocked(authApi.verifyEmail).mockResolvedValue({ status: 'accepted' });

    setup('token-once');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Email confirmed' }),
    ).toBeInTheDocument();
    expect(authApi.verifyEmail).toHaveBeenCalledTimes(1);
    expect(authApi.verifyEmail).toHaveBeenCalledWith('token-once');
  });

  it('sends a signed-in person on to choose a role', async () => {
    signInAs();
    vi.mocked(authApi.verifyEmail).mockResolvedValue({ status: 'accepted' });

    setup('token-signed-in');

    expect(await screen.findByRole('link', { name: 'Continue' })).toHaveAttribute(
      'href',
      '/get-started',
    );
  });

  it('sends a signed-out person to sign in', async () => {
    vi.mocked(authApi.verifyEmail).mockResolvedValue({ status: 'accepted' });

    setup('token-signed-out');

    expect(await screen.findByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/sign-in',
    );
  });

  it('explains an expired or used link', async () => {
    vi.mocked(authApi.verifyEmail).mockRejectedValue(
      new ApiError({ status: 410, code: 'expired', message: 'Gone.' }),
    );

    setup('token-expired');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'This link has expired' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/sign-in');
  });

  it('offers a new email to a signed-in person whose link expired', async () => {
    signInAs();
    vi.mocked(authApi.verifyEmail).mockRejectedValue(
      new ApiError({ status: 410, message: 'Gone.' }),
    );
    vi.mocked(authApi.resendVerification).mockResolvedValue({ status: 'accepted' });

    setup('token-expired-signed-in');

    await userEvent.click(await screen.findByRole('button', { name: 'Send me a new email' }));

    expect(await screen.findByRole('status')).toHaveTextContent('We have sent a new email.');
  });

  it('shows other problems and lets people try again', async () => {
    vi.mocked(authApi.verifyEmail)
      .mockRejectedValueOnce(
        new ApiError({ status: 0, code: 'network', message: 'No connection.' }),
      )
      .mockResolvedValue({ status: 'accepted' });

    setup('token-retry');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'We could not confirm your email' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Email confirmed' }),
    ).toBeInTheDocument();
  });
});
