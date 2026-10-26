import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ApiError } from '../../lib/api/ApiError';
import { CompleteProfile } from './CompleteProfile';

const setup = (onSubmit?: Parameters<typeof CompleteProfile>[0]['onSubmit']) =>
  render(
    <MemoryRouter initialEntries={['/complete-profile']}>
      <Routes>
        <Route
          path="/complete-profile"
          element={<CompleteProfile email="skye@example.com" onSubmit={onSubmit} />}
        />
        <Route path="/get-started" element={<p>Role picker</p>} />
      </Routes>
    </MemoryRouter>,
  );

const fill = async (name: string, password: string, confirm: string) => {
  if (name) await userEvent.type(screen.getByLabelText('Full name'), name);
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

  it('asks for a name and a password', async () => {
    setup();

    await fill('', '', '');

    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
    expect(screen.getByText('Use at least 8 characters')).toBeInTheDocument();
  });

  it('asks for the passwords to match', async () => {
    setup();

    await fill('Skye Favour', 'longenough1', 'different123');

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  it('sends the details and moves on to choosing a role', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    setup(onSubmit);

    await fill('Skye Favour', 'longenough1', 'longenough1');

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'skye@example.com',
      fullName: 'Skye Favour',
      password: 'longenough1',
      confirmPassword: 'longenough1',
    });
    expect(await screen.findByText('Role picker')).toBeInTheDocument();
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

    await fill('Skye Favour', 'longenough1', 'longenough1');

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong');
  });
});
