import { render, screen } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { paymentsApi, subscriptionsApi } from '../lib/api';
import { CREDITS, CREDIT_PACKS, PLANS, payment } from '../test/fixtures/payments';
import { signInAs } from '../test/session';
import { getRoutes } from './index';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  paymentsApi: { credits: vi.fn(), get: vi.fn(), listCreditPacks: vi.fn(), checkout: vi.fn() },
  subscriptionsApi: { listPlans: vi.fn(), subscribe: vi.fn() },
}));

const Routes = () => useRoutes(getRoutes());

const renderAt = (address: string) =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.mocked(paymentsApi.credits).mockResolvedValue(CREDITS);
  vi.mocked(paymentsApi.get).mockResolvedValue(payment('paid'));
  vi.mocked(paymentsApi.listCreditPacks).mockResolvedValue([...CREDIT_PACKS]);
  vi.mocked(subscriptionsApi.listPlans).mockResolvedValue([...PLANS]);
});

describe('payment routes', () => {
  it('serves the pricing page to visitors', async () => {
    renderAt('/pricing');

    expect(await screen.findByRole('heading', { level: 1, name: 'Pricing' })).toBeInTheDocument();
  });

  it('serves the credits page inside the app', async () => {
    signInAs('self-test');
    renderAt('/credits');

    expect(await screen.findByRole('heading', { level: 1, name: 'Credits' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
  });

  it('serves the payment check page after Paystack', async () => {
    signInAs('self-test');
    renderAt('/payments/callback?reference=ref-1');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Payment received' }),
    ).toBeInTheDocument();
  });

  it('asks visitors to sign in before checking a payment', () => {
    renderAt('/payments/callback?reference=ref-1');

    expect(screen.queryByRole('heading', { name: 'Payment received' })).not.toBeInTheDocument();
    expect(paymentsApi.get).not.toHaveBeenCalled();
  });
});
