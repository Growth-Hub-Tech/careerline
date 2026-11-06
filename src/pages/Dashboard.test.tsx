import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { paymentsApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { SessionProvider, writeSession } from '../lib/session';
import { CREDITS } from '../test/fixtures/payments';
import { signInAs } from '../test/session';
import { Dashboard } from './Dashboard';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  paymentsApi: { credits: vi.fn() },
}));

beforeEach(() => {
  vi.mocked(paymentsApi.credits).mockResolvedValue(CREDITS);
});

const setup = () =>
  render(
    <MemoryRouter>
      <SessionProvider>
        <Dashboard />
      </SessionProvider>
    </MemoryRouter>,
  );

describe('Dashboard', () => {
  it('welcomes the signed-in person by first name', () => {
    signInAs();

    setup();

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome, Skye!' })).toBeInTheDocument();
    expect(
      screen.getByText('Take your first step to knowing your ideal career path'),
    ).toBeInTheDocument();
  });

  it('uses whoever is signed in, not a fixed name', () => {
    writeSession({
      token: 'token',
      user: { name: 'Adaeze Obi Nwosu', email: 'ada@example.com', userType: 'beginner' },
    });

    setup();

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome, Adaeze!' })).toBeInTheDocument();
  });

  it('copes with extra spaces and a single name', () => {
    writeSession({
      token: 'token',
      user: { name: '  Tunde  ', email: 'tunde@example.com', userType: 'beginner' },
    });

    setup();

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome, Tunde!' })).toBeInTheDocument();
  });

  it('greets without a name when nobody is signed in', () => {
    setup();

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome!' })).toBeInTheDocument();
  });

  it('invites them to start the assessment', () => {
    signInAs();

    setup();

    expect(
      screen.getByRole('heading', { level: 2, name: /Not sure where to start/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Take Assessment Test' })).toHaveAttribute(
      'href',
      '/assessment',
    );
  });

  it('explains the test', () => {
    signInAs();

    setup();

    expect(
      screen.getByText(/An AI powered career clarity test - answer a few questions/),
    ).toBeInTheDocument();
  });

  it.each(['Your Top 3 Strengths', 'Roles That Match You', 'Explore Your Path'])(
    'shows the %s card',
    (title) => {
      signInAs();

      setup();

      expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
    },
  );

  it('keeps the career assessment for beginners only', () => {
    signInAs('self-test');

    setup();

    expect(screen.queryByRole('link', { name: 'Take Assessment Test' })).not.toBeInTheDocument();
    expect(
      screen.queryByText('Take your first step to knowing your ideal career path'),
    ).not.toBeInTheDocument();
  });

  it('points a self-tester to the skill tests and their reports', () => {
    signInAs('self-test');

    setup();

    expect(screen.getByRole('heading', { level: 2, name: 'Test your skills' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Choose a test' })).toHaveAttribute('href', '/tests');
    expect(screen.getByRole('link', { name: 'View your reports' })).toHaveAttribute(
      'href',
      '/reports',
    );
  });

  it.each([
    ['recruiter', 'Validate talent', 'Go to candidates', '/candidates'],
    ['organization', 'Audit your team', 'Go to your team', '/team'],
  ] as const)('points the %s user type to its own area', (userType, heading, link, href) => {
    signInAs(userType);

    setup();

    expect(screen.getByRole('heading', { level: 2, name: heading })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: link })).toHaveAttribute('href', href);
    expect(screen.queryByRole('link', { name: 'Take Assessment Test' })).not.toBeInTheDocument();
  });

  describe('credits strip', () => {
    it.each(['self-test', 'recruiter'] as const)(
      'shows the %s user their balance with ways to buy and see history',
      async (userType) => {
        signInAs(userType);
        setup();

        const strip = await screen.findByRole('region', { name: 'Your credits' });
        expect(strip).toHaveTextContent('You have 3 credits');
        expect(within(strip).getByRole('link', { name: 'Buy credits' })).toHaveAttribute(
          'href',
          '/pricing?return=%2Fdashboard',
        );
        expect(within(strip).getByRole('link', { name: 'View history' })).toHaveAttribute(
          'href',
          '/credits',
        );
      },
    );

    it('is not shown to beginners', async () => {
      signInAs('beginner');
      setup();

      await screen.findByRole('heading', { level: 1 });
      expect(screen.queryByRole('region', { name: 'Your credits' })).not.toBeInTheDocument();
      expect(paymentsApi.credits).not.toHaveBeenCalled();
    });

    it('stays out of the way when the balance cannot be read', async () => {
      vi.mocked(paymentsApi.credits).mockRejectedValue(
        new ApiError({ status: 500, message: 'Down.' }),
      );
      signInAs('self-test');
      setup();

      await vi.waitFor(() => expect(paymentsApi.credits).toHaveBeenCalled());
      expect(screen.queryByRole('region', { name: 'Your credits' })).not.toBeInTheDocument();
    });
  });
});
