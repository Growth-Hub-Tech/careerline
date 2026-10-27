import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ApiError } from '../../lib/api/ApiError';
import { createDevSession, readSession, SessionProvider } from '../../lib/session';
import { CompleteProfile } from './CompleteProfile';

const setup = (
  onSubmit?: Parameters<typeof CompleteProfile>[0]['onSubmit'],
  email: string | undefined = 'skye@example.com',
) =>
  render(
    <MemoryRouter initialEntries={['/complete-profile']}>
      <SessionProvider>
        <Routes>
          <Route
            path="/complete-profile"
            element={<CompleteProfile email={email} onSubmit={onSubmit} />}
          />
          <Route path="/get-started" element={<p>Role picker</p>} />
          <Route path="/sign-up" element={<p>Sign up page</p>} />
        </Routes>
      </SessionProvider>
    </MemoryRouter>,
  );

const fill = async (name: string, phone: string, password: string, confirm: string) => {
  if (name) await userEvent.type(screen.getByLabelText('Full name'), name);
  if (phone) await userEvent.type(screen.getByLabelText('Phone number'), phone);
  if (password) await userEvent.type(screen.getByLabelText('Password'), password);
  if (confirm) await userEvent.type(screen.getByLabelText('Confirm Password'), confirm);
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
};

describe('CompleteProfile', () => {
  it('keeps the email read only', () => {
    setup();

    expect(screen.getByLabelText('Email')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Email')).toHaveValue('skye@example.com');
  });

  it('asks for a name, a phone number and a password', async () => {
    setup();

    await fill('', '', '', '');

    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid phone number')).toBeInTheDocument();
    expect(screen.getByText('Use at least 8 characters')).toBeInTheDocument();
  });

  it('asks for the passwords to match', async () => {
    setup();

    await fill('Skye Favour', '08012345678', 'longenough1', 'different123');

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  it('sends the details and moves on to choosing a role', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    setup(onSubmit);

    await fill('Skye Favour', '08012345678', 'longenough1', 'longenough1');

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'skye@example.com',
      fullName: 'Skye Favour',
      phone: '08012345678',
      password: 'longenough1',
      confirmPassword: 'longenough1',
    });
    expect(await screen.findByText('Role picker')).toBeInTheDocument();
  });

  it('signs the new person in when a session comes back', async () => {
    setup(vi.fn().mockResolvedValue(createDevSession('beginner')));

    await fill('Skye Favour', '08012345678', 'longenough1', 'longenough1');

    expect(await screen.findByText('Role picker')).toBeInTheDocument();
    expect(readSession()?.user.name).toBe('Skye Favour');
  });

  it('says when the email is already taken and stays on the page', async () => {
    setup(
      vi.fn().mockRejectedValue(new ApiError({ status: 409, code: 'email_taken', message: 'x' })),
    );

    await fill('Skye Favour', '08012345678', 'longenough1', 'longenough1');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'An account with this email already exists. Sign in instead.',
    );
    expect(screen.queryByText('Role picker')).not.toBeInTheDocument();
  });

  it('shows a clear message when it fails', async () => {
    setup(
      vi.fn().mockRejectedValue(
        new ApiError({
          status: 500,
          message: 'Something went wrong on our side. Try again in a moment.',
        }),
      ),
    );

    await fill('Skye Favour', '08012345678', 'longenough1', 'longenough1');

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong');
  });

  it('sends people without a known email back to sign up', () => {
    setup(undefined, '');

    expect(screen.getByText('Sign up page')).toBeInTheDocument();
  });
});
