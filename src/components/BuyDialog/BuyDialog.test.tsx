import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { paymentsApi, subscriptionsApi } from '../../lib/api';
import { ApiError } from '../../lib/api/ApiError';
import { readReturn } from '../../lib/payments/checkoutReturn';
import { BuyDialog, type BuyItem } from './BuyDialog';

vi.mock('../../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/api')>()),
  paymentsApi: { checkout: vi.fn() },
  subscriptionsApi: { subscribe: vi.fn() },
}));

const PACK: BuyItem = {
  kind: 'credit_pack',
  id: 12,
  name: 'Value pack',
  price: { amount: 2500000, currency: 'NGN' },
  summary: '10 credits',
};

const TEAM: BuyItem = {
  kind: 'subscription_plan',
  id: 3,
  name: 'Team Audit',
  price: { amount: 120000000, currency: 'NGN' },
  summary: '600 credits a year',
  seats: 50,
};

const CHECKOUT = { reference: 'ref-1', authorization_url: 'https://pay.test/ref-1' };

const setup = (item: BuyItem | null = PACK) => {
  const handlers = { onClose: vi.fn(), onOpen: vi.fn() };
  render(<BuyDialog item={item} returnTo="/tests/202" {...handlers} />);
  return handlers;
};

const dialog = () => screen.getByRole('dialog');
const pay = () => userEvent.click(within(dialog()).getByRole('button', { name: /^Pay / }));

describe('BuyDialog', () => {
  it('stays closed without a product', () => {
    setup(null);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the product and the price from the server', () => {
    setup();

    expect(dialog()).toHaveAccessibleName('Buy Value pack');
    expect(dialog()).toHaveTextContent('10 credits');
    expect(within(dialog()).getByRole('button', { name: 'Pay ₦25,000' })).toBeInTheDocument();
  });

  it('shows the seats only for a product sold per seat', () => {
    setup(TEAM);

    expect(dialog()).toHaveTextContent('For up to 50 seats');
  });

  it('has no seats for a credit pack', () => {
    setup();

    expect(dialog()).not.toHaveTextContent('seats');
  });

  it('starts a checkout for a credit pack and goes to Paystack', async () => {
    vi.mocked(paymentsApi.checkout).mockResolvedValue(CHECKOUT as never);
    const { onOpen } = setup();

    await pay();

    expect(paymentsApi.checkout).toHaveBeenCalledWith({
      item_type: 'credit_pack',
      item_id: 12,
      callback_url: `${window.location.origin}/payments/callback`,
    });
    expect(onOpen).toHaveBeenCalledWith('https://pay.test/ref-1');
    expect(readReturn()).toBe('/tests/202');
  });

  it('subscribes to a plan and goes to Paystack', async () => {
    vi.mocked(subscriptionsApi.subscribe).mockResolvedValue(CHECKOUT as never);
    const { onOpen } = setup(TEAM);

    await pay();

    expect(subscriptionsApi.subscribe).toHaveBeenCalledWith({
      plan_id: 3,
      callback_url: `${window.location.origin}/payments/callback`,
    });
    expect(onOpen).toHaveBeenCalledWith('https://pay.test/ref-1');
  });

  it('stays on the page and says what went wrong when the checkout fails', async () => {
    vi.mocked(paymentsApi.checkout).mockRejectedValue(
      new ApiError({ status: 500, message: 'Something went wrong on our side.' }),
    );
    const { onOpen } = setup();

    await pay();

    expect(within(dialog()).getByRole('alert')).toHaveTextContent(
      'Something went wrong on our side.',
    );
    expect(onOpen).not.toHaveBeenCalled();
    expect(readReturn()).toBeNull();
  });

  it('closes on Cancel', async () => {
    const { onClose } = setup();

    await userEvent.click(within(dialog()).getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();
  });
});
