#!/usr/bin/env bash
set -euo pipefail

if [ ! -f package.json ] || [ ! -d src ]; then
  echo "Run this from the careerline repo root." >&2
  exit 1
fi

mkdir -p src/test/fixtures
cat > src/test/fixtures/tests.ts << 'EOF'
import type { AssessmentAccess, AssessmentDetail, AssessmentPage, SkillsPage } from '../../lib/api';

export const SKILLS: SkillsPage = {
  total: 5,
  limit: 50,
  offset: 0,
  skills: [
    {
      skill_id: 1,
      skill_name: 'Frontend Web Development',
      category: 'Engineering and Development',
      description: 'Tests expertise in: HTML, CSS, JavaScript, React',
    },
    {
      skill_id: 2,
      skill_name: 'Backend Development',
      category: 'Engineering and Development',
      description: 'Tests expertise in: REST APIs, Node.js, authentication',
    },
    {
      skill_id: 8,
      skill_name: 'Version Control (Git)',
      category: 'Engineering and Development',
      description: 'Tests expertise in: Branching, merging, pull requests',
    },
    {
      skill_id: 13,
      skill_name: 'UI/UX Design',
      category: 'Design & Product',
      description: 'Tests expertise in: Figma, wireframing, prototyping',
    },
    {
      skill_id: 20,
      skill_name: 'Data Analysis',
      category: 'Data',
      description: 'Tests expertise in: SQL, spreadsheets, charts',
    },
  ],
};

export const TESTS: AssessmentPage = {
  total: 3,
  limit: 20,
  offset: 0,
  items: [
    {
      test_id: 201,
      title: 'Frontend Web Development',
      skill_id: 1,
      skill_name: 'Frontend Web Development',
      levels: ['BEGINNER', 'JUNIOR', 'MID', 'ADVANCED'],
      format: 'adaptive',
      question_count: 25,
      duration_minutes: 30,
      price_credits: 0,
      role_ids: [101],
    },
    {
      test_id: 202,
      title: 'Backend Development',
      skill_id: 2,
      skill_name: 'Backend Development',
      levels: ['BEGINNER', 'JUNIOR', 'MID', 'ADVANCED'],
      format: 'adaptive',
      question_count: 25,
      duration_minutes: 30,
      price_credits: 2,
      role_ids: [102],
    },
    {
      test_id: 208,
      title: 'Version Control (Git)',
      skill_id: 8,
      skill_name: 'Version Control (Git)',
      levels: ['BEGINNER', 'JUNIOR', 'MID'],
      format: 'fixed',
      question_count: 15,
      duration_minutes: 15,
      price_credits: 1,
      role_ids: [101, 102],
    },
  ],
};

export const TEST_DETAIL: AssessmentDetail = {
  test_id: 202,
  title: 'Backend Development',
  skill_id: 2,
  skill_name: 'Backend Development',
  levels: ['BEGINNER', 'JUNIOR', 'MID', 'ADVANCED'],
  format: 'adaptive',
  question_count: 25,
  duration_minutes: 30,
  price_credits: 2,
  role_ids: [102],
  description: 'Shows how well you design, build and secure server-side applications.',
  subskills: ['REST APIs', 'Databases', 'Authentication'],
  what_you_get: ['Your level from Beginner to Advanced', 'A score for each sub-skill'],
};

export const ACCESS_WITH_CREDITS: AssessmentAccess = {
  test_id: 202,
  can_start: true,
  reason: 'credits',
  price_credits: 2,
  credits_balance: 3,
};

export const ACCESS_SHORT_OF_CREDITS: AssessmentAccess = {
  test_id: 202,
  can_start: false,
  reason: 'insufficient_credits',
  price_credits: 2,
  credits_balance: 1,
};
EOF

mkdir -p src/lib/api
cat > src/lib/api/catalog.test.ts << 'EOF'
import { createCatalogApi } from './catalog';
import { createApiClient } from './client';

const setup = (pages: unknown[]) => {
  const fetcher = vi.fn<typeof fetch>();
  pages.forEach((body) =>
    fetcher.mockResolvedValueOnce(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    ),
  );
  const client = createApiClient({
    baseUrl: 'https://api.example.test/api/v1',
    getToken: () => 'token-123',
    fetcher,
  });

  return { fetcher, api: createCatalogApi(client) };
};

const urls = (fetcher: ReturnType<typeof setup>['fetcher']) =>
  fetcher.mock.calls.map(([input]) => String(input));

describe('catalog api', () => {
  it('collects every skill across pages', async () => {
    const { fetcher, api } = setup([
      {
        success: true,
        data: { skills: [{ skill_id: 1 }, { skill_id: 2 }], total: 3, limit: 2, offset: 0 },
      },
      { success: true, data: { skills: [{ skill_id: 3 }], total: 3, limit: 2, offset: 2 } },
    ]);

    const skills = await api.listSkills();

    expect(skills.map((skill) => skill.skill_id)).toEqual([1, 2, 3]);
    expect(urls(fetcher)).toEqual([
      'https://api.example.test/api/v1/skills/?limit=50&offset=0',
      'https://api.example.test/api/v1/skills/?limit=50&offset=2',
    ]);
  });

  it('collects every test across pages', async () => {
    const { fetcher, api } = setup([
      { success: true, data: { items: [{ test_id: 201 }], total: 1, limit: 50, offset: 0 } },
    ]);

    const tests = await api.listTests();

    expect(tests).toEqual([{ test_id: 201 }]);
    expect(urls(fetcher)).toEqual(['https://api.example.test/api/v1/tests?limit=50&offset=0']);
  });

  it('loads one test by its id', async () => {
    const { fetcher, api } = setup([{ success: true, data: { test_id: 202, title: 'Backend' } }]);

    const test = await api.getTest(202);

    expect(test).toEqual({ test_id: 202, title: 'Backend' });
    expect(urls(fetcher)).toEqual(['https://api.example.test/api/v1/tests/202']);
  });

  it('asks whether the person can start a test', async () => {
    const { fetcher, api } = setup([
      { success: true, data: { test_id: 202, can_start: false, reason: 'insufficient_credits' } },
    ]);

    const access = await api.getAccess(202);

    expect(access).toMatchObject({ can_start: false, reason: 'insufficient_credits' });
    expect(urls(fetcher)).toEqual(['https://api.example.test/api/v1/tests/202/access']);
  });
});
EOF

mkdir -p src/lib/tests
cat > src/lib/tests/catalog.test.ts << 'EOF'
import { SKILLS, TESTS } from '../../test/fixtures/tests';
import { describeCredits, describeLevels, describePrice, groupByCategory } from './catalog';

describe('groupByCategory', () => {
  it('groups the testable skills under their category', () => {
    const groups = groupByCategory(SKILLS.skills, TESTS.items);

    expect(groups.map((group) => group.category)).toEqual(['Engineering and Development']);
    expect(groups[0].entries.map((entry) => entry.test.test_id)).toEqual([201, 202, 208]);
  });

  it('leaves out skills that have no test', () => {
    const groups = groupByCategory(SKILLS.skills, TESTS.items);

    const names = groups.flatMap((group) => group.entries.map((entry) => entry.skill.skill_name));
    expect(names).not.toContain('UI/UX Design');
  });

  it('orders categories by where their first skill appears', () => {
    const tests = [
      TESTS.items[0],
      { ...TESTS.items[0], test_id: 300, skill_id: 13 },
      TESTS.items[1],
    ];

    const groups = groupByCategory(SKILLS.skills, tests);

    expect(groups.map((group) => group.category)).toEqual([
      'Engineering and Development',
      'Design & Product',
    ]);
  });

  it('files a test whose skill is unknown under Other', () => {
    const groups = groupByCategory(SKILLS.skills, [
      { ...TESTS.items[0], test_id: 999, skill_id: 777 },
    ]);

    expect(groups[0].category).toBe('Other');
    expect(groups[0].entries[0].skill.skill_name).toBe(TESTS.items[0].skill_name);
  });

  it('gives nothing when there are no tests', () => {
    expect(groupByCategory(SKILLS.skills, [])).toEqual([]);
  });
});

describe('describePrice', () => {
  it.each([
    [0, 'Free'],
    [1, '1 credit'],
    [2, '2 credits'],
  ])('shows %i credits as "%s"', (credits, text) => {
    expect(describePrice(credits)).toBe(text);
  });
});

describe('describeLevels', () => {
  it('lists the levels in plain words', () => {
    expect(describeLevels(['BEGINNER', 'JUNIOR', 'MID', 'ADVANCED'])).toBe(
      'Beginner, Junior, Mid, Advanced',
    );
  });
});

describe('describeCredits', () => {
  it('counts credits, including none', () => {
    expect(describeCredits(0)).toBe('0 credits');
    expect(describeCredits(1)).toBe('1 credit');
    expect(describeCredits(4)).toBe('4 credits');
  });
});
EOF

mkdir -p src/components/PaymentNeeded
cat > src/components/PaymentNeeded/PaymentNeeded.test.tsx << 'EOF'
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PaymentNeeded } from './PaymentNeeded';

const setup = (props: Partial<Parameters<typeof PaymentNeeded>[0]> = {}) =>
  render(
    <MemoryRouter>
      <PaymentNeeded priceCredits={2} balance={1} {...props} />
    </MemoryRouter>,
  );

describe('PaymentNeeded', () => {
  it('is a named region', () => {
    setup();

    expect(screen.getByRole('region', { name: 'Payment needed' })).toBeInTheDocument();
  });

  it('shows the price and balance the server sent', () => {
    setup({ priceCredits: 5, balance: 2 });

    expect(screen.getByText('This test costs 5 credits.')).toBeInTheDocument();
    expect(screen.getByText('You have 2 credits. Buy 3 more to start.')).toBeInTheDocument();
  });

  it('uses the singular for one credit', () => {
    setup({ priceCredits: 1, balance: 0 });

    expect(screen.getByText('This test costs 1 credit.')).toBeInTheDocument();
    expect(screen.getByText('You have 0 credits. Buy 1 more to start.')).toBeInTheDocument();
  });

  it('leaves out the balance when it is not known', () => {
    setup({ balance: undefined });

    expect(screen.getByText('This test costs 2 credits.')).toBeInTheDocument();
    expect(screen.queryByText(/You have/)).not.toBeInTheDocument();
  });

  it('links to buying credits and back to the tests', () => {
    setup();

    expect(screen.getByRole('link', { name: 'Buy credits' })).toHaveAttribute('href', '/pricing');
    expect(screen.getByRole('link', { name: 'Back to tests' })).toHaveAttribute('href', '/tests');
  });

  it('can send the person somewhere else to buy', () => {
    setup({ buyHref: '/credits' });

    expect(screen.getByRole('link', { name: 'Buy credits' })).toHaveAttribute('href', '/credits');
  });
});
EOF

mkdir -p src/pages
cat > src/pages/TestStart.test.tsx << 'EOF'
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { catalogApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { ACCESS_SHORT_OF_CREDITS, ACCESS_WITH_CREDITS, TEST_DETAIL } from '../test/fixtures/tests';
import { TestStart } from './TestStart';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  catalogApi: { getTest: vi.fn(), getAccess: vi.fn() },
}));

const setup = (address = '/tests/202') =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes>
        <Route path="/tests/:testId" element={<TestStart />} />
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
    </MemoryRouter>,
  );

const paymentPanel = () => screen.queryByRole('region', { name: 'Payment needed' });

beforeEach(() => {
  vi.mocked(catalogApi.getTest).mockResolvedValue(TEST_DETAIL);
  vi.mocked(catalogApi.getAccess).mockResolvedValue(ACCESS_WITH_CREDITS);
});

describe('TestStart', () => {
  it('shows a loader while the test arrives', () => {
    vi.mocked(catalogApi.getAccess).mockReturnValue(new Promise(() => undefined));

    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('asks for the test in the address', async () => {
    setup('/tests/208');

    await screen.findByRole('heading', { level: 1 });

    expect(catalogApi.getTest).toHaveBeenCalledWith(208);
    expect(catalogApi.getAccess).toHaveBeenCalledWith(208);
  });

  it('names the test and says what it involves', async () => {
    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Backend Development' }),
    ).toBeInTheDocument();
    expect(screen.getByText(TEST_DETAIL.description)).toBeInTheDocument();
    expect(screen.getByText('25 questions · 30 minutes · Adaptive')).toBeInTheDocument();
    expect(screen.getByText('A score for each sub-skill')).toBeInTheDocument();
  });

  it('says what starting will use from the balance', async () => {
    setup();

    expect(
      await screen.findByText('This test uses 2 credits. You have 3 credits.'),
    ).toBeInTheDocument();
    expect(paymentPanel()).not.toBeInTheDocument();
  });

  it('says when the test is free', async () => {
    vi.mocked(catalogApi.getAccess).mockResolvedValue({
      ...ACCESS_WITH_CREDITS,
      reason: 'free',
      price_credits: 0,
    });

    setup();

    expect(await screen.findByText('This test is free.')).toBeInTheDocument();
  });

  it('says when a subscription covers the test', async () => {
    vi.mocked(catalogApi.getAccess).mockResolvedValue({
      ...ACCESS_WITH_CREDITS,
      reason: 'subscription',
    });

    setup();

    expect(await screen.findByText('Your subscription covers this test.')).toBeInTheDocument();
  });

  it('shows the payment panel with the price the server sent', async () => {
    vi.mocked(catalogApi.getAccess).mockResolvedValue(ACCESS_SHORT_OF_CREDITS);

    setup();

    expect(await screen.findByRole('region', { name: 'Payment needed' })).toHaveTextContent(
      'This test costs 2 credits.You have 1 credit. Buy 1 more to start.',
    );
  });

  it('shows the payment panel when the server answers payment required', async () => {
    vi.mocked(catalogApi.getAccess).mockRejectedValue(
      new ApiError({ status: 402, code: 'payment_required', message: 'Payment required.' }),
    );

    setup();

    const panel = await screen.findByRole('region', { name: 'Payment needed' });
    expect(panel).toHaveTextContent('This test costs 2 credits.');
    expect(panel).not.toHaveTextContent('You have');
  });

  it('sends an unknown test to page not found', async () => {
    vi.mocked(catalogApi.getTest).mockRejectedValue(
      new ApiError({ status: 404, code: 'not_found', message: 'Not found.' }),
    );

    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeInTheDocument();
  });

  it('sends an address that is not a test id to page not found', () => {
    setup('/tests/abc');

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    expect(catalogApi.getTest).not.toHaveBeenCalled();
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(catalogApi.getTest)
      .mockRejectedValueOnce(
        new ApiError({ status: 0, code: 'network', message: 'No connection.' }),
      )
      .mockResolvedValue(TEST_DETAIL);

    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Backend Development' }),
    ).toBeInTheDocument();
  });
});
EOF

mkdir -p src/routes
cat > src/routes/sessionRoutes.test.tsx << 'EOF'
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import type { UserType } from '../lib/session';
import { catalogApi } from '../lib/api';
import { signInAs } from '../test/session';
import { getRoutes } from './index';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  catalogApi: { getTest: vi.fn(), getAccess: vi.fn() },
}));

const Routes = () => useRoutes(getRoutes());

const renderAt = (address: string) =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes />
    </MemoryRouter>,
  );

const menu = () => within(screen.getByRole('navigation', { name: 'Main' }));

const MENUS: readonly [UserType, string, string][] = [
  ['beginner', 'Assessment', 'Candidates'],
  ['self-test', 'Skill tests', 'Team'],
  ['recruiter', 'Candidates', 'Skill tests'],
  ['organization', 'Team', 'Candidates'],
];

describe('session routes', () => {
  it('sends a signed-out visitor from the dashboard to sign in', () => {
    renderAt('/dashboard');

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome Back' })).toBeInTheDocument();
  });

  it('keeps a signed-out visitor out of every app page', () => {
    renderAt('/candidates');

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome Back' })).toBeInTheDocument();
  });

  it.each(MENUS)('shows %s its own menu', (userType, shown, hidden) => {
    signInAs(userType);

    renderAt('/dashboard');

    expect(menu().getByRole('link', { name: shown })).toBeInTheDocument();
    expect(menu().queryByRole('link', { name: hidden })).not.toBeInTheDocument();
  });

  it('shows the signed-in role in the header', () => {
    signInAs('recruiter');

    renderAt('/dashboard');

    expect(screen.getByText('Recruiter')).toBeInTheDocument();
  });

  it.each([
    ['beginner', '/candidates'],
    ['recruiter', '/team/heatmap'],
    ['organization', '/tests'],
    ['self-test', '/assessment'],
  ] as const)('sends %s away from %s', (userType, address) => {
    signInAs(userType);

    renderAt(address);

    expect(
      screen.getByRole('heading', { level: 1, name: "You don't have access to this page" }),
    ).toBeInTheDocument();
  });

  it('puts a self-test inside the full-screen frame', () => {
    vi.mocked(catalogApi.getTest).mockReturnValue(new Promise(() => undefined));
    vi.mocked(catalogApi.getAccess).mockReturnValue(new Promise(() => undefined));
    signInAs('self-test');

    renderAt('/tests/202');

    expect(screen.getByRole('banner')).toHaveTextContent('Skill test');
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Exit test' })).toBeInTheDocument();
  });
});
EOF

echo "Wrote 6 files."
