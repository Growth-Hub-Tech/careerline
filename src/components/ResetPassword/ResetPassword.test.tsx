import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ApiError } from '../../lib/api/ApiError';
import { ResetPassword } from './ResetPassword';

const setup = (onSubmit?: Parameters<typeof ResetPassword>[0]['onSubmit']) =>
  render(
    <MemoryRouter>
      <ResetPassword onSubmit={onSubmit} />
    </MemoryRouter>,
  );

const submit = async (email: string) => {
  if (email) await userEvent.type(screen.getByLabelText('Email'), email);
  await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
};

describe('ResetPassword', () => {
  it('asks for an email', async () => {
    setup();

    await submit('');

    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('rejects an email that is not an address', async () => {
    setup();

    await submit('nope');

    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
  });

  it('sends the email and says the link is on its way', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    setup(onSubmit);

    await submit('skye@example.com');

    expect(onSubmit).toHaveBeenCalledWith({ email: 'skye@example.com' });
    expect(await screen.findByRole('status')).toHaveTextContent(
      'If an account exists for skye@example.com, we have sent a link to reset the password.',
    );
  });

  it('shows a clear message when it fails', async () => {
    setup(vi.fn().mockRejectedValue(new ApiError({ status: 429, message: 'x' })));

    await submit('skye@example.com');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many tries. Wait a few minutes and try again.',
    );
  });
});
