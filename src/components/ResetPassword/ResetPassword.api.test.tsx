import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { ResetPassword } from './ResetPassword';

vi.mock('../../lib/api', () => ({
  authApi: { requestPasswordReset: vi.fn() },
}));

describe('ResetPassword with the API', () => {
  it('asks the API to send the reset link', async () => {
    vi.mocked(authApi.requestPasswordReset).mockResolvedValue({ status: 'accepted' });
    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>,
    );

    await userEvent.type(screen.getByLabelText('Email'), 'skye@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(await screen.findByRole('status')).toHaveTextContent('skye@example.com');
    expect(authApi.requestPasswordReset).toHaveBeenCalledWith('skye@example.com');
  });
});
