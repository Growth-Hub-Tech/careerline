import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { paymentsApi, subscriptionsApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { payment, subscription } from '../test/fixtures/payments';
import { Billing } from './Billing';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  subscriptionsApi: { mine: vi.fn(), cancel: vi.fn(), resume: vi.fn() },
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

  it('keeps a plan that is set to cancel', async () => {
    vi.mocked(subscriptionsApi.mine).mockResolvedValue(
      subscription({ cancel_at_period_end: true }),
    );
    vi.mocked(subscriptionsApi.resume).mockResolvedValue(subscription());
    setup();

    expect(await plan()).toHaveTextContent('Cancels on 1 Dec 2026');
    // subscribing again is refused while the plan runs, so it is not offered
    expect(screen.queryByRole('link', { name: 'Subscribe again' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Keep my plan' }));

    expect(subscriptionsApi.resume).toHaveBeenCalledTimes(1);
    expect(await plan()).toHaveTextContent('Renews on 1 Dec 2026');
    expect(screen.queryByRole('button', { name: 'Keep my plan' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel plan' })).toBeInTheDocument();
  });

  it('says when the plan could not be kept and lets the person try again', async () => {
    vi.mocked(subscriptionsApi.mine).mockResolvedValue(
      subscription({ cancel_at_period_end: true }),
    );
    vi.mocked(subscriptionsApi.resume).mockRejectedValue(
      new ApiError({
        status: 409,
        code: 'conflict',
        message: 'Your plan is not cancelled, so there is nothing to resume',
      }),
    );
    setup();

    const keep = await screen.findByRole('button', { name: 'Keep my plan' });
    await userEvent.click(keep);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your plan is not cancelled, so there is nothing to resume',
    );
    expect(keep).toBeEnabled();
  });

  it('sends one request however often Keep my plan is pressed', async () => {
    vi.mocked(subscriptionsApi.mine).mockResolvedValue(
      subscription({ cancel_at_period_end: true }),
    );
    vi.mocked(subscriptionsApi.resume).mockReturnValue(new Promise(() => undefined));
    setup();

    const keep = await screen.findByRole('button', { name: 'Keep my plan' });
    await userEvent.click(keep);
    await userEvent.click(keep);

    expect(keep).toBeDisabled();
    expect(subscriptionsApi.resume).toHaveBeenCalledTimes(1);
  });

  it('offers no Keep my plan for an ended plan, only subscribing again', async () => {
    vi.mocked(subscriptionsApi.mine).mockResolvedValue(
      subscription({ status: 'cancelled', cancel_at_period_end: true }),
    );
    setup();

    expect(await plan()).toHaveTextContent('Ended on 1 Dec 2026');
    expect(screen.queryByRole('button', { name: 'Keep my plan' })).not.toBeInTheDocument();
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
    expect(await plan()).not.toHaveTextContent('Renews on');
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
