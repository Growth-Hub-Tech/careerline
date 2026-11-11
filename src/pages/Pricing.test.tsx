import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { paymentsApi, subscriptionsApi } from '../lib/api';
import { SessionProvider, type UserType } from '../lib/session';
import { readReturn } from '../lib/payments/checkoutReturn';
import { signInAs } from '../test/session';
import { ApiError } from '../lib/api/ApiError';
import { CREDIT_PACKS, PLANS } from '../test/fixtures/payments';
import { Pricing } from './Pricing';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  paymentsApi: { listCreditPacks: vi.fn(), checkout: vi.fn() },
  subscriptionsApi: { listPlans: vi.fn(), subscribe: vi.fn() },
}));

const setup = (address = '/pricing') =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <SessionProvider>
        <Pricing onOpen={vi.fn()} />
      </SessionProvider>
    </MemoryRouter>,
  );

const plan = async (groupName: string, name: string) =>
  within(await group(groupName)).getByRole('article', { name });

const signedInAs = (userType: UserType) => {
  signInAs(userType);
  vi.mocked(paymentsApi.checkout).mockResolvedValue({
    reference: 'ref-1',
    authorization_url: 'https://pay.test/ref-1',
  } as never);
};

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
      '/quote',
    );
  });

  it('asks visitors to log in before buying', async () => {
    setup();

    const plan = within(await group('For individuals')).getByRole('article', {
      name: 'Individual Monthly',
    });
    expect(within(plan).getByRole('link', { name: 'Log in to buy' })).toHaveAttribute(
      'href',
      '/sign-in',
    );
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
      'href',
      '/sign-up',
    );
  });

  it('brings visitors back to the same prices after they log in', async () => {
    const SignInPage = () => {
      const { state } = useLocation() as { state: { from: { pathname: string; search: string } } };
      return <p>Back to {state.from.pathname + state.from.search}</p>;
    };
    render(
      <MemoryRouter initialEntries={['/pricing?return=%2Ftests%2F202']}>
        <SessionProvider>
          <Routes>
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/sign-in" element={<SignInPage />} />
          </Routes>
        </SessionProvider>
      </MemoryRouter>,
    );

    const card = within(await group('For individuals')).getByRole('article', {
      name: 'Individual Monthly',
    });
    await userEvent.click(within(card).getByRole('link', { name: 'Log in to buy' }));

    expect(screen.getByText('Back to /pricing?return=%2Ftests%2F202')).toBeInTheDocument();
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

  describe('when signed in', () => {
    it('opens the buy dialog for a plan', async () => {
      signedInAs('self-test');
      setup();

      await userEvent.click(
        within(await plan('For individuals', 'Individual Monthly')).getByRole('button', {
          name: 'Buy',
        }),
      );

      expect(screen.getByRole('dialog')).toHaveAccessibleName('Buy Individual Monthly');
    });

    it('keeps organisation plans for organisation accounts', async () => {
      signedInAs('self-test');
      setup();

      const team = await plan('For organisations', 'Team Audit');
      expect(within(team).queryByRole('button', { name: 'Buy' })).not.toBeInTheDocument();
      expect(team).toHaveTextContent('Only organisation owners and admins can buy this plan.');
    });

    it('keeps recruiter plans for recruiter accounts', async () => {
      signedInAs('self-test');
      setup();

      const pro = await plan('For recruiters', 'Recruiter Pro');
      expect(within(pro).queryByRole('button', { name: 'Buy' })).not.toBeInTheDocument();
      expect(pro).toHaveTextContent('Only recruiter accounts can buy this plan.');
    });

    it('keeps individual plans for individual accounts', async () => {
      signedInAs('recruiter');
      setup();

      const monthly = await plan('For individuals', 'Individual Monthly');
      expect(within(monthly).queryByRole('button', { name: 'Buy' })).not.toBeInTheDocument();
      expect(monthly).toHaveTextContent('Only individual accounts can buy this plan.');
    });

    it('lets any account buy a credit pack', async () => {
      signedInAs('recruiter');
      setup();

      expect(
        within(await plan('For individuals', 'Starter pack')).getByRole('button', { name: 'Buy' }),
      ).toBeInTheDocument();
    });

    it("puts the person's own prices first", async () => {
      signedInAs('recruiter');
      setup();

      await group('For recruiters');
      expect(screen.getAllByRole('heading', { level: 2 })[0]).toHaveTextContent('For recruiters');
    });

    it('does not offer an account to someone signed in', async () => {
      signedInAs('self-test');
      setup();

      await group('For individuals');
      expect(screen.queryByRole('link', { name: 'Create an account' })).not.toBeInTheDocument();
    });

    it('lets an organisation account buy an organisation plan', async () => {
      signedInAs('organization');
      setup();

      expect(
        within(await plan('For organisations', 'Team Audit')).getByRole('button', {
          name: 'Buy',
        }),
      ).toBeInTheDocument();
    });

    it('comes back to the page that sent the person here after paying', async () => {
      signedInAs('self-test');
      setup('/pricing?return=%2Ftests%2F202');

      await userEvent.click(
        within(await plan('For individuals', 'Value pack')).getByRole('button', { name: 'Buy' }),
      );
      await userEvent.click(screen.getByRole('button', { name: 'Pay ₦25,000' }));

      expect(readReturn()).toBe('/tests/202');
    });

    it('comes back to the credits page by default', async () => {
      signedInAs('self-test');
      setup('/pricing?return=https%3A%2F%2Fevil.test');

      await userEvent.click(
        within(await plan('For individuals', 'Value pack')).getByRole('button', { name: 'Buy' }),
      );
      await userEvent.click(screen.getByRole('button', { name: 'Pay ₦25,000' }));

      expect(readReturn()).toBe('/credits');
    });
  });
});
