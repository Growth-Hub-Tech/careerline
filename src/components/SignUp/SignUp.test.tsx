import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ApiError } from '../../lib/api/ApiError';
import { readPendingEmail } from '../../lib/session';
import { SignUp } from './SignUp';

const setup = (onSubmit?: Parameters<typeof SignUp>[0]['onSubmit']) =>
  render(
    <MemoryRouter initialEntries={['/sign-up']}>
      <Routes>
        <Route path="/sign-up" element={<SignUp onSubmit={onSubmit} />} />
        <Route path="/verify-email" element={<p>Verify page</p>} />
      </Routes>
    </MemoryRouter>,
  );

const submit = async (email: string) => {
  if (email) await userEvent.type(screen.getByLabelText('Email'), email);
  await userEvent.click(screen.getByRole('button', { name: 'Continue with email' }));
};

describe('SignUp', () => {
  it('asks for an email', async () => {
    setup();

    await submit('');

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.queryByText('Verify page')).not.toBeInTheDocument();
  });

  it('rejects an email that is not an address', async () => {
    setup();

    await submit('skye@');

    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
  });

  it('sends the email and moves on to verification', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    setup(onSubmit);

    await submit('skye@example.com');

    expect(onSubmit).toHaveBeenCalledWith({ email: 'skye@example.com' });
    expect(await screen.findByText('Verify page')).toBeInTheDocument();
  });

  it('remembers the email for the next steps', async () => {
    setup();

    await submit('skye@example.com');

    await screen.findByText('Verify page');
    expect(readPendingEmail()).toBe('skye@example.com');
  });

  it('moves on to verification when nothing is connected yet', async () => {
    setup();

    await submit('skye@example.com');

    expect(await screen.findByText('Verify page')).toBeInTheDocument();
  });

  it('says when the email is already taken and stays on the page', async () => {
    setup(
      vi.fn().mockRejectedValue(new ApiError({ status: 409, code: 'email_taken', message: 'x' })),
    );

    await submit('skye@example.com');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'An account with this email already exists. Sign in instead.',
    );
    expect(screen.queryByText('Verify page')).not.toBeInTheDocument();
  });

  it('puts a server email error on the email field', async () => {
    setup(
      vi.fn().mockRejectedValue(
        new ApiError({
          status: 422,
          message: 'x',
          fieldErrors: { email: 'This domain is not allowed' },
        }),
      ),
    );

    await submit('skye@example.com');

    expect(await screen.findByText('This domain is not allowed')).toBeInTheDocument();
  });
});
