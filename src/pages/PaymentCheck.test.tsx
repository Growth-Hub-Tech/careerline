import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { paymentsApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { rememberReturn } from '../lib/payments/checkoutReturn';
import { payment } from '../test/fixtures/payments';
import { PaymentCheck } from './PaymentCheck';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  paymentsApi: { get: vi.fn() },
}));

const setup = (address = '/payments/callback?reference=ref-1&trxref=ref-1') =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes>
        <Route
          path="/payments/callback"
          element={<PaymentCheck pollInterval={5} maxChecks={3} />}
        />
        <Route path="/credits" element={<h1>Credits page</h1>} />
      </Routes>
    </MemoryRouter>,
  );

const heading = (name: string) => screen.findByRole('heading', { level: 1, name });

describe('PaymentCheck', () => {
  it('says it is checking the payment', () => {
    vi.mocked(paymentsApi.get).mockReturnValue(new Promise(() => undefined));
    setup();

    expect(screen.getByRole('status')).toHaveTextContent('Checking your payment');
    expect(paymentsApi.get).toHaveBeenCalledWith('ref-1');
  });

  it('reads the reference Paystack sends as trxref', () => {
    vi.mocked(paymentsApi.get).mockReturnValue(new Promise(() => undefined));
    setup('/payments/callback?trxref=ref-9');

    expect(paymentsApi.get).toHaveBeenCalledWith('ref-9');
  });

  it('confirms a paid payment and goes back to where the person was', async () => {
    vi.mocked(paymentsApi.get).mockResolvedValue(payment('paid'));
    rememberReturn('/tests/202');
    setup();

    expect(await heading('Payment received')).toBeInTheDocument();
    expect(screen.getByText('10 credits were added to your account.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue' })).toHaveAttribute('href', '/tests/202');
  });

  it('goes to the credits page after paying when nothing was remembered', async () => {
    vi.mocked(paymentsApi.get).mockResolvedValue(payment('paid'));
    setup();

    expect(await heading('Payment received')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue' })).toHaveAttribute('href', '/credits');
  });

  it('keeps checking while the payment is pending', async () => {
    vi.mocked(paymentsApi.get)
      .mockResolvedValueOnce(payment('pending'))
      .mockResolvedValue(payment('paid'));
    setup();

    expect(await heading('Payment received')).toBeInTheDocument();
    expect(paymentsApi.get).toHaveBeenCalledTimes(2);
  });

  it.each(['failed', 'abandoned'] as const)(
    'says a %s payment did not go through',
    async (status) => {
      vi.mocked(paymentsApi.get).mockResolvedValue(payment(status));
      setup();

      expect(await heading('Payment not completed')).toBeInTheDocument();
      expect(screen.getByText('You have not been charged. You can try again.')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Try again' })).toHaveAttribute(
        'href',
        '/pricing?return=%2Fcredits',
      );
    },
  );

  it('says the payment is safe when it is still not confirmed', async () => {
    vi.mocked(paymentsApi.get).mockResolvedValue(payment('pending'));
    setup();

    expect(await heading('Your payment is not confirmed yet')).toBeInTheDocument();
    expect(paymentsApi.get).toHaveBeenCalledTimes(3);
    expect(
      screen.getByText(
        'Your payment is safe. Paystack can take a few minutes to confirm it, and your credits will be added as soon as it does.',
      ),
    ).toBeInTheDocument();
  });

  it('checks again on request', async () => {
    vi.mocked(paymentsApi.get).mockResolvedValue(payment('pending'));
    setup();
    await heading('Your payment is not confirmed yet');
    vi.mocked(paymentsApi.get).mockResolvedValue(payment('paid'));

    await userEvent.click(screen.getByRole('button', { name: 'Check again' }));

    expect(await heading('Payment received')).toBeInTheDocument();
  });

  it('says what went wrong when the payment cannot be read', async () => {
    vi.mocked(paymentsApi.get).mockRejectedValue(
      new ApiError({ status: 0, message: 'No connection.' }),
    );
    setup();

    expect(await heading('Your payment is not confirmed yet')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('No connection.');
  });

  it('goes to the credits page without a reference', () => {
    setup('/payments/callback');

    expect(screen.getByRole('heading', { name: 'Credits page' })).toBeInTheDocument();
    expect(paymentsApi.get).not.toHaveBeenCalled();
  });
});
