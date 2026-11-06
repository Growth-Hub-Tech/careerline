import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { contactApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { Quote } from './Quote';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  contactApi: { send: vi.fn() },
}));

const setup = () =>
  render(
    <MemoryRouter>
      <Quote />
    </MemoryRouter>,
  );

const fill = async () => {
  await userEvent.type(screen.getByLabelText('Full name'), 'Ngozi Okafor');
  await userEvent.type(screen.getByLabelText('Work email'), 'ngozi@kora.example');
  await userEvent.type(screen.getByLabelText('Organisation'), 'Kora Bank');
  await userEvent.selectOptions(screen.getByLabelText('People to test'), '201-1000');
  await userEvent.type(
    screen.getByLabelText('What do you need?'),
    'Audit our engineering team against our own role standards.',
  );
};

beforeEach(() => {
  vi.mocked(contactApi.send).mockResolvedValue({
    ticket_id: 'Q-42',
    status: 'received',
    received_at: '2026-11-03T09:00:00Z',
  });
});

describe('Quote', () => {
  it('has a main heading', () => {
    setup();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Request an enterprise quote' }),
    ).toBeInTheDocument();
  });

  it('checks every field before sending', async () => {
    setup();

    await userEvent.click(screen.getByRole('button', { name: 'Request a quote' }));

    expect(await screen.findByText('Enter your name')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid work email')).toBeInTheDocument();
    expect(screen.getByText('Enter your organisation')).toBeInTheDocument();
    expect(screen.getByText('Tell us what you need in at least 10 characters')).toBeInTheDocument();
    expect(contactApi.send).not.toHaveBeenCalled();
  });

  it('sends the request as an organisation audit enquiry', async () => {
    setup();

    await fill();
    await userEvent.click(screen.getByRole('button', { name: 'Request a quote' }));

    expect(contactApi.send).toHaveBeenCalledWith({
      full_name: 'Ngozi Okafor',
      email: 'ngozi@kora.example',
      topic: 'organisation_audit',
      organisation: 'Kora Bank',
      message:
        'People to test: 201-1000\n\nAudit our engineering team against our own role standards.',
    });
    expect(
      await screen.findByText('Thank you. We will reply to ngozi@kora.example with a quote.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Your reference is Q-42.')).toBeInTheDocument();
  });

  it('says why the request was not sent', async () => {
    vi.mocked(contactApi.send).mockRejectedValue(
      new ApiError({ status: 429, code: 'rate_limited', message: 'Slow down.', retryAfter: 120 }),
    );
    setup();

    await fill();
    await userEvent.click(screen.getByRole('button', { name: 'Request a quote' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many tries. Try again in 2 minutes.',
    );
  });
});
