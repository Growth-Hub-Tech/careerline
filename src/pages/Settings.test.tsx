import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { accountsApi, authApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { readSession, SessionProvider } from '../lib/session';
import { account } from '../test/fixtures/account';
import { signInAs } from '../test/session';
import { Settings } from './Settings';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  accountsApi: { me: vi.fn(), update: vi.fn(), changePassword: vi.fn() },
  authApi: { resendVerification: vi.fn(), logout: vi.fn() },
}));

const setup = () =>
  render(
    <MemoryRouter initialEntries={['/settings']}>
      <SessionProvider>
        <Routes>
          <Route path="/settings" element={<Settings />} />
          <Route path="/sign-in" element={<h1>Sign in page</h1>} />
        </Routes>
      </SessionProvider>
    </MemoryRouter>,
  );

const details = () => screen.findByRole('region', { name: 'Your details' });
const password = () => screen.findByRole('region', { name: 'Change password' });

beforeEach(() => {
  signInAs('self-test');
  vi.mocked(accountsApi.me).mockResolvedValue(account());
  vi.mocked(accountsApi.update).mockImplementation(async (changes) => ({
    ...account(),
    full_name: changes.full_name ?? account().full_name,
    phone: changes.phone ?? account().phone,
  }));
  vi.mocked(accountsApi.changePassword).mockResolvedValue({ status: 'accepted' });
  vi.mocked(authApi.resendVerification).mockResolvedValue({ status: 'accepted' });
});

describe('Settings', () => {
  it('shows a loader while the account arrives', () => {
    vi.mocked(accountsApi.me).mockReturnValue(new Promise(() => undefined));
    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('fills in the account details', async () => {
    setup();

    const section = await details();
    expect(within(section).getByLabelText('Full name')).toHaveValue('Skye Favour');
    expect(within(section).getByLabelText('Phone')).toHaveValue('08012345678');
    expect(section).toHaveTextContent('skye@example.com');
    expect(section).toHaveTextContent('Confirmed');
  });

  it('saves changed details and updates the name everywhere', async () => {
    setup();

    const section = await details();
    const name = within(section).getByLabelText('Full name');
    await userEvent.clear(name);
    await userEvent.type(name, 'Skye Adeyemi');
    await userEvent.click(within(section).getByRole('button', { name: 'Save details' }));

    expect(accountsApi.update).toHaveBeenCalledWith({
      full_name: 'Skye Adeyemi',
      phone: '08012345678',
    });
    expect(await within(section).findByText('Your details are saved.')).toBeInTheDocument();
    expect(readSession()?.user.name).toBe('Skye Adeyemi');
  });

  it('needs a name', async () => {
    setup();

    const section = await details();
    await userEvent.clear(within(section).getByLabelText('Full name'));
    await userEvent.click(within(section).getByRole('button', { name: 'Save details' }));

    expect(await within(section).findByText('Enter your name')).toBeInTheDocument();
    expect(accountsApi.update).not.toHaveBeenCalled();
  });

  it('sends a new confirmation link when the email is not confirmed', async () => {
    vi.mocked(accountsApi.me).mockResolvedValue(account({ email_verified: false }));
    setup();

    const section = await details();
    expect(section).toHaveTextContent('Not confirmed yet');
    await userEvent.click(within(section).getByRole('button', { name: 'Send a new link' }));

    expect(authApi.resendVerification).toHaveBeenCalled();
    expect(
      await within(section).findByText('We sent a new link to skye@example.com.'),
    ).toBeInTheDocument();
  });

  it('changes the password', async () => {
    setup();

    const section = await password();
    await userEvent.type(within(section).getByLabelText('Current password'), 'old-secret');
    await userEvent.type(within(section).getByLabelText('New password'), 'new-secret-1');
    await userEvent.type(within(section).getByLabelText('Repeat new password'), 'new-secret-1');
    await userEvent.click(within(section).getByRole('button', { name: 'Change password' }));

    expect(accountsApi.changePassword).toHaveBeenCalledWith({
      current_password: 'old-secret',
      new_password: 'new-secret-1',
    });
    expect(
      await within(section).findByText(
        'Your password was changed. Your other devices were signed out.',
      ),
    ).toBeInTheDocument();
    expect(within(section).getByLabelText('Current password')).toHaveValue('');
  });

  it('checks the new password before sending it', async () => {
    setup();

    const section = await password();
    await userEvent.type(within(section).getByLabelText('Current password'), 'old-secret');
    await userEvent.type(within(section).getByLabelText('New password'), 'short');
    await userEvent.type(within(section).getByLabelText('Repeat new password'), 'other');
    await userEvent.click(within(section).getByRole('button', { name: 'Change password' }));

    expect(await within(section).findByText('Use at least 8 characters')).toBeInTheDocument();
    expect(within(section).getByText('The passwords do not match')).toBeInTheDocument();
    expect(accountsApi.changePassword).not.toHaveBeenCalled();
  });

  it('says when the current password is wrong', async () => {
    vi.mocked(accountsApi.changePassword).mockRejectedValue(
      new ApiError({ status: 400, code: 'wrong_password', message: 'Wrong password.' }),
    );
    setup();

    const section = await password();
    await userEvent.type(within(section).getByLabelText('Current password'), 'not-it-123');
    await userEvent.type(within(section).getByLabelText('New password'), 'new-secret-1');
    await userEvent.type(within(section).getByLabelText('Repeat new password'), 'new-secret-1');
    await userEvent.click(within(section).getByRole('button', { name: 'Change password' }));

    expect(
      await within(section).findByText('That is not your current password'),
    ).toBeInTheDocument();
  });

  it('links to privacy and billing', async () => {
    setup();

    await details();

    expect(screen.getByRole('link', { name: 'Privacy centre' })).toHaveAttribute(
      'href',
      '/settings/privacy',
    );
    expect(screen.getByRole('link', { name: 'Billing' })).toHaveAttribute('href', '/billing');
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(accountsApi.me)
      .mockRejectedValueOnce(new ApiError({ status: 0, message: 'No connection.' }))
      .mockResolvedValue(account());
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await details()).toBeInTheDocument();
  });

  it('signs out on every device', async () => {
    vi.mocked(authApi.logout).mockResolvedValue({ status: 'accepted' });
    setup();

    await userEvent.click(await screen.findByRole('button', { name: 'Sign out everywhere' }));

    expect(authApi.logout).toHaveBeenCalledWith(true);
    expect(await screen.findByRole('heading', { name: 'Sign in page' })).toBeInTheDocument();
    expect(readSession()).toBeNull();
  });

  it('stays signed in and says why when signing out everywhere fails', async () => {
    vi.mocked(authApi.logout).mockRejectedValue(
      new ApiError({ status: 0, message: 'No connection.' }),
    );
    setup();

    await userEvent.click(await screen.findByRole('button', { name: 'Sign out everywhere' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    expect(readSession()).not.toBeNull();
  });
});
