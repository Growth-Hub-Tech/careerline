import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { contactApi } from '../lib/api';
import { Contact } from './Contact';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  contactApi: { send: vi.fn() },
}));

const send = async (address: string) => {
  vi.mocked(contactApi.send).mockResolvedValue({
    ticket_id: 'T-1',
    status: 'received',
    received_at: '2026-11-02T08:00:00Z',
  });
  render(
    <MemoryRouter initialEntries={[address]}>
      <Contact />
    </MemoryRouter>,
  );
  await userEvent.type(screen.getByLabelText('First name'), 'Skye');
  await userEvent.type(screen.getByLabelText('Last name'), 'Favour');
  await userEvent.type(screen.getByLabelText('Email'), 'skye@example.com');
  await userEvent.type(screen.getByLabelText('Message'), 'We would like a quote for our team.');
  await userEvent.click(screen.getByLabelText('You agree to our privacy policy.'));
  await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
};

describe('Contact', () => {
  it('sends a quote request when opened from enterprise pricing', async () => {
    await send('/contact?topic=organisation_audit');

    expect(contactApi.send).toHaveBeenCalledWith(
      expect.objectContaining({ topic: 'organisation_audit' }),
    );
  });

  it('falls back to a general message for an unknown topic', async () => {
    await send('/contact?topic=nonsense');

    expect(contactApi.send).toHaveBeenCalledWith(expect.objectContaining({ topic: 'general' }));
  });
});
