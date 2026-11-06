import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { paymentsApi, subscriptionsApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { CREDIT_PACKS, PLANS } from '../test/fixtures/payments';
import { Pricing } from './Pricing';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  paymentsApi: { listCreditPacks: vi.fn() },
  subscriptionsApi: { listPlans: vi.fn() },
}));

const setup = () =>
  render(
    <MemoryRouter initialEntries={['/pricing']}>
      <Pricing />
    </MemoryRouter>,
  );

const group = (name: string) => screen.findByRole('region', { name });

beforeEach(() => {
  vi.mocked(subscriptionsApi.listPlans).mockResolvedValue([...PLANS]);
  vi.mocked(paymentsApi.listCreditPacks).mockResolvedValue([...CREDIT_PACKS]);
});

describe('Pricing', () => {
  it('shows a loader while the prices arrive', () => {
    vi.mocked(subscriptionsApi.listPlans).mockReturnValue(new Promise(() => undefined));

    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has a main heading', async () => {
    setup();

    expect(await screen.findByRole('heading', { level: 1, name: 'Pricing' })).toBeInTheDocument();
  });

  it('groups the plans by who they are for', async () => {
    setup();

    expect(
      within(await group('For individuals')).getByText('Individual Monthly'),
    ).toBeInTheDocument();
    expect(within(await group('For recruiters')).getByText('Recruiter Pro')).toBeInTheDocument();
    expect(within(await group('For organisations')).getByText('Team Audit')).toBeInTheDocument();
  });

  it('shows the price, credits and features of a plan', async () => {
    setup();

    const plan = within(await group('For individuals')).getByRole('article', {
      name: 'Individual Monthly',
    });
    expect(plan).toHaveTextContent('₦5,000 a month');
    expect(plan).toHaveTextContent('5 credits a month');
    expect(plan).toHaveTextContent('Five skill tests a month');
    expect(plan).toHaveTextContent('PDF reports');
  });

  it('shows yearly prices and seats', async () => {
    setup();

    const plan = within(await group('For organisations')).getByRole('article', {
      name: 'Team Audit',
    });
    expect(plan).toHaveTextContent('₦1,200,000 a year');
    expect(plan).toHaveTextContent('600 credits a year');
    expect(plan).toHaveTextContent('Up to 50 seats');
  });

  it('lists the credit packs for individuals', async () => {
    setup();

    const pack = within(await group('For individuals')).getByRole('article', {
      name: 'Value pack',
    });
    expect(pack).toHaveTextContent('10 credits');
    expect(pack).toHaveTextContent('₦25,000');
  });

  it('offers a quote for enterprise', async () => {
    setup();

    const enterprise = await group('Enterprise');
    expect(within(enterprise).getByRole('link', { name: 'Request a quote' })).toHaveAttribute(
      'href',
      '/contact?topic=organisation_audit',
    );
  });

  it('asks visitors to sign up before buying', async () => {
    setup();

    const plan = within(await group('For individuals')).getByRole('article', {
      name: 'Individual Monthly',
    });
    expect(within(plan).getByRole('link', { name: 'Get started' })).toHaveAttribute(
      'href',
      '/sign-up',
    );
  });

  it('says so when there is nothing to buy yet', async () => {
    vi.mocked(subscriptionsApi.listPlans).mockResolvedValue([]);
    vi.mocked(paymentsApi.listCreditPacks).mockResolvedValue([]);
    setup();

    expect(await screen.findByText('Prices will be listed here soon.')).toBeInTheDocument();
    expect(await group('Enterprise')).toBeInTheDocument();
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(subscriptionsApi.listPlans)
      .mockRejectedValueOnce(new ApiError({ status: 0, message: 'No connection.' }))
      .mockResolvedValue([...PLANS]);
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await group('For recruiters')).toBeInTheDocument();
  });
});
