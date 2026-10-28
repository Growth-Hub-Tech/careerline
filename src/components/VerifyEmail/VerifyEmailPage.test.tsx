import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { SessionProvider } from '../../lib/session';
import { VerifyEmailPage } from './VerifyEmailPage';

vi.mock('../../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/api')>()),
  authApi: { resendVerification: vi.fn(), verifyEmail: vi.fn() },
}));

const setup = (address: string) =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <SessionProvider>
        <VerifyEmailPage />
      </SessionProvider>
    </MemoryRouter>,
  );

describe('VerifyEmailPage', () => {
  it('asks people to check their inbox when there is no token', () => {
    setup('/verify-email');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Verify your email' }),
    ).toBeInTheDocument();
  });

  it('confirms the email when the link brings a token', async () => {
    vi.mocked(authApi.verifyEmail).mockResolvedValue({ status: 'accepted' });

    setup('/verify-email?token=page-token');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Email confirmed' }),
    ).toBeInTheDocument();
    expect(authApi.verifyEmail).toHaveBeenCalledWith('page-token');
  });
});
