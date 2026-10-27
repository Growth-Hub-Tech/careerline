import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '../../lib/api/ApiError';
import { contactApi } from '../../lib/api';
import ContactForm from './ContactForm';

vi.mock('../../lib/api', () => ({
  contactApi: { send: vi.fn() },
}));

const RECEIPT = {
  ticket_id: 'T-1042',
  status: 'received' as const,
  received_at: '2026-10-26T08:00:00Z',
};

const fill = async (message = 'Hello, I have a question about pricing.') => {
  await userEvent.type(screen.getByLabelText('First name'), 'Skye');
  await userEvent.type(screen.getByLabelText('Last name'), 'Favour');
  await userEvent.type(screen.getByLabelText('Email'), 'skye@example.com');
  await userEvent.type(screen.getByLabelText('Message'), message);
  await userEvent.click(screen.getByLabelText('You agree to our privacy policy.'));
  await userEvent.click(screen.getByRole('button', { name: 'Send message' }));
};

describe('ContactForm', () => {
  it('asks for every field', async () => {
    render(<ContactForm />);

    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(screen.getByText('First name is required')).toBeInTheDocument();
    expect(screen.getByText('Last name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Message is required')).toBeInTheDocument();
    expect(screen.getByText('You must agree to the privacy policy')).toBeInTheDocument();
    expect(contactApi.send).not.toHaveBeenCalled();
  });

  it('asks for a message of at least 10 characters', async () => {
    render(<ContactForm />);

    await fill('Hi');

    expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument();
    expect(contactApi.send).not.toHaveBeenCalled();
  });

  it('sends the message the way the API expects it', async () => {
    vi.mocked(contactApi.send).mockResolvedValue(RECEIPT);
    render(<ContactForm />);

    await fill();

    expect(contactApi.send).toHaveBeenCalledWith({
      full_name: 'Skye Favour',
      email: 'skye@example.com',
      topic: 'general',
      message: 'Hello, I have a question about pricing.',
    });
  });

  it('confirms with the reference number and clears the form', async () => {
    vi.mocked(contactApi.send).mockResolvedValue(RECEIPT);
    render(<ContactForm />);

    await fill();

    expect(await screen.findByRole('status')).toHaveTextContent('T-1042');
    expect(screen.getByLabelText('First name')).toHaveValue('');
  });

  it('shows a clear message when sending fails', async () => {
    vi.mocked(contactApi.send).mockRejectedValue(
      new ApiError({ status: 429, message: 'x', retryAfter: 30 }),
    );
    render(<ContactForm />);

    await fill();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many tries. Try again in 30 seconds.',
    );
    expect(screen.getByLabelText('First name')).toHaveValue('Skye');
  });
});
