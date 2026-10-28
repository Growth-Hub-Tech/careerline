import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { authActions } from '../../lib/auth/actions';
import {
  createDevSession,
  readPendingEmail,
  readSession,
  rememberPendingEmail,
  SessionProvider,
} from '../../lib/session';
import { CompleteProfile } from './CompleteProfile';

vi.mock('../../lib/auth/actions', () => ({
  authActions: { signIn: vi.fn(), register: vi.fn() },
}));

describe('CompleteProfile with the API', () => {
  it('registers with the email from sign-up and signs in', async () => {
    rememberPendingEmail('skye@example.com');
    vi.mocked(authActions.register).mockResolvedValue(createDevSession('beginner'));
    render(
      <MemoryRouter initialEntries={['/complete-profile']}>
        <SessionProvider>
          <Routes>
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/verify-email" element={<p>Verify page</p>} />
          </Routes>
        </SessionProvider>
      </MemoryRouter>,
    );

    await userEvent.type(screen.getByLabelText('Full name'), 'Skye Favour');
    await userEvent.type(screen.getByLabelText('Phone number'), '08012345678');
    await userEvent.type(screen.getByLabelText('Password'), 'longenough1');
    await userEvent.type(screen.getByLabelText('Confirm Password'), 'longenough1');
    await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByText('Verify page')).toBeInTheDocument();
    expect(authActions.register).toHaveBeenCalledWith({
      email: 'skye@example.com',
      fullName: 'Skye Favour',
      phone: '08012345678',
      password: 'longenough1',
    });
    expect(readSession()).not.toBeNull();
    expect(readPendingEmail()).toBe('skye@example.com');
  });
});
