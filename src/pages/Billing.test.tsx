import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { paymentsApi, subscriptionsApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { payment, subscription } from '../test/fixtures/payments';
import { Billing } from './Billing';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  subscriptionsApi: { mine: vi.fn(), cancel: vi.fn() },
  paymentsApi: { list: vi.fn() },
}));

const setup = () =>
  render(
    <MemoryRouter>
      <Billing />
    </MemoryRouter>,
  );

const plan = () => screen.findByRole('region', { name: 'Your plan' });

beforeEach(() => {
  vi.mocked(subscriptionsApi.mine).mockResolvedValue(subscription());
  vi.mocked(subscriptionsApi.cancel).mockResolvedValue(
    subscription({ cancel_at_period_end: true }),
  );
  vi.mocked(paymentsApi.list).mockResolvedValue([payment('paid'), payment('failed')]);
});

describe('Billing', () => {
  it('shows a loader while the plan arrives', () => {
    vi.mocked(subscriptionsApi.mine).mockReturnValue(new Promise(() => undefined));
    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows the plan, its status and the next renewal', async () => {
    setup();

    const section = await plan();
    expect(section).toHaveTextContent('Individual Monthly');
    expect(section).toHaveTextContent('Active');
    expect(section).toHaveTextContent('Renews on 1 Dec 2026');
  });

  it('cancels at the end of the period after asking first', async () => {
    setup();

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel plan' }));
    const dialog = screen.getByRole('dialog', { name: 'Cancel your plan?' });
    expect(dialog).toHaveTextContent('You keep it until 1 Dec 2026');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel plan' }));

    expect(subscriptionsApi.cancel).toHaveBeenCalled();
    expect(await plan()).toHaveTextContent('Cancels on 1 Dec 2026');
    expect(screen.queryByRole('button', { name: 'Cancel plan' })).not.toBeInTheDocument();
  });

  it('explains how to keep a plan that is set to cancel', async () => {
    vi.mocked(subscriptionsApi.mine).mockResolvedValue(
      subscription({ cancel_at_period_end: true }),
    );
    setup();

    expect(await plan()).toHaveTextContent('Cancels on 1 Dec 2026');
    expect(screen.getByRole('link', { name: 'Subscribe again' })).toHaveAttribute(
      'href',
      '/pricing?return=%2Fbilling',
    );
  });

  it('warns when a payment failed and says by when to pay', async () => {
    vi.mocked(subscriptionsApi.mine).mockResolvedValue(subscription({ status: 'past_due' }));
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your last payment failed. Pay by 1 Dec 2026 to keep your plan.',
    );
    expect(screen.getByRole('link', { name: 'Subscribe again' })).toBeInTheDocument();
  });

  it('offers plans next to one-off prices when there is no plan', async () => {
    vi.mocked(subscriptionsApi.mine).mockResolvedValue(null);
    setup();

    expect(await plan()).toHaveTextContent('You have no plan.');
    expect(screen.getByRole('link', { name: 'Compare plans and one-off prices' })).toHaveAttribute(
      'href',
      '/pricing?return=%2Fbilling',
    );
  });

  it('lists the latest payments', async () => {
    setup();

    const rows = within(await screen.findByRole('table', { name: 'Payments' }))
      .getAllByRole('row')
      .slice(1);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Value pack');
    expect(rows[0]).toHaveTextContent('Paid');
    expect(rows[1]).toHaveTextContent('Failed');
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(subscriptionsApi.mine)
      .mockRejectedValueOnce(new ApiError({ status: 0, message: 'No connection.' }))
      .mockResolvedValue(subscription());
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await plan()).toBeInTheDocument();
  });
});
