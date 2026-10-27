import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { rememberPendingEmail } from '../../lib/session';
import { VerifyEmail } from './VerifyEmail';

const setup = (email?: string) =>
  render(
    <MemoryRouter>
      <VerifyEmail email={email} />
    </MemoryRouter>,
  );

describe('VerifyEmail', () => {
  it('shows the email that was typed at sign-up', () => {
    rememberPendingEmail('skye@example.com');

    setup();

    expect(screen.getByText(/we sent to skye@example\.com/)).toBeInTheDocument();
  });

  it('prefers an email given directly', () => {
    rememberPendingEmail('skye@example.com');

    setup('other@example.com');

    expect(screen.getByText(/we sent to other@example\.com/)).toBeInTheDocument();
  });

  it('does not invent an address when none is known', () => {
    setup();

    expect(screen.getByText(/we sent to your email address/)).toBeInTheDocument();
  });
});
