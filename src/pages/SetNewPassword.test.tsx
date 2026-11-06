import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { authApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { SetNewPassword } from './SetNewPassword';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  authApi: { confirmPasswordReset: vi.fn() },
}));

const setup = (address = '/reset-password?token=reset-token') =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <SetNewPassword />
    </MemoryRouter>,
  );

const fill = async (password = 'new-secret-1', repeat = password) => {
  await userEvent.type(screen.getByLabelText('New password'), password);
  await userEvent.type(screen.getByLabelText('Repeat new password'), repeat);
  await userEvent.click(screen.getByRole('button', { name: 'Set new password' }));
};

beforeEach(() => {
  vi.mocked(authApi.confirmPasswordReset).mockResolvedValue({ status: 'accepted' });
});

describe('SetNewPassword', () => {
  it('sets the new password with the token from the link', async () => {
    setup();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Choose a new password' }),
    ).toBeInTheDocument();
    await fill();

    expect(authApi.confirmPasswordReset).toHaveBeenCalledWith('reset-token', 'new-secret-1');
    expect(
      await screen.findByText('Your password was changed. Sign in with your new password.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/sign-in');
  });

  it('checks the password before sending it', async () => {
    setup();

    await fill('short', 'other');

    expect(await screen.findByText('Use at least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('The passwords do not match')).toBeInTheDocument();
    expect(authApi.confirmPasswordReset).not.toHaveBeenCalled();
  });

  it('says when the link is old or used and offers a new one', async () => {
    vi.mocked(authApi.confirmPasswordReset).mockRejectedValue(
      new ApiError({ status: 410, code: 'expired', message: 'Expired.' }),
    );
    setup();

    await fill();

    expect(
      await screen.findByText('This reset link has expired or was already used.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ask for a new link' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });

  it('says the link is incomplete when it has no token', () => {
    setup('/reset-password');

    expect(screen.getByText('This reset link is incomplete.')).toBeInTheDocument();
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
  });

  it('says what went wrong otherwise', async () => {
    vi.mocked(authApi.confirmPasswordReset).mockRejectedValue(
      new ApiError({ status: 0, message: 'No connection.' }),
    );
    setup();

    await fill();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
  });
});
