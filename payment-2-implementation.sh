#!/usr/bin/env bash
set -euo pipefail

if [ ! -f package.json ] || [ ! -d src ]; then
  echo "Run this from the careerline repo root." >&2
  exit 1
fi

mkdir -p src/lib/api
cat > src/lib/api/types.ts << 'EOF'
import type { components } from './schema';

type Schemas = components['schemas'];

export type RegisterRequest = Schemas['RegisterRequest'];
export type TokenResponse = Schemas['TokenResponse'];
export type Acknowledgement = Schemas['Acknowledgement'];
export type ContactRequest = Schemas['ContactRequest'];
export type ContactReceipt = Schemas['ContactReceipt'];
export type ContactTopic = NonNullable<ContactRequest['topic']>;
export type IntakeQuestionnaire = Schemas['IntakeQuestionnaire'];
export type IntakeQuestion = Schemas['IntakeQuestion'];
export type IntakeSubmission = Schemas['IntakeSubmission'];
export type BeginnerPath = Schemas['BeginnerPath'];
export type CareerPathRecommendation = Schemas['CareerPathRecommendation'];
export type Programme = Schemas['Programme'];
export type ProgrammeClick = Schemas['ProgrammeClick'];
export type ProgrammeClickRequest = Schemas['ProgrammeClickRequest'];
export type ProgrammeSummary = Schemas['ProgrammeSummary'];
export type Money = Schemas['Money'];

export type LevelName = Schemas['LevelName'];
export type AssessmentSummary = Schemas['AssessmentSummary'];
export type AssessmentPage = Schemas['Page_AssessmentSummary_'];
export type AssessmentDetail = Schemas['AssessmentDetail'];
export type AssessmentAccess = Schemas['AssessmentAccess'];

export interface Skill {
  readonly skill_id: number;
  readonly skill_name: string;
  readonly category: string;
  readonly description: string;
}

export interface SkillsPage {
  readonly skills: readonly Skill[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}
EOF

mkdir -p src/lib/api
cat > src/lib/api/catalog.ts << 'EOF'
import type { createApiClient } from './client';
import { fetchAll } from './fetchAll';
import type { AssessmentAccess, AssessmentDetail, AssessmentPage, SkillsPage } from './types';

type Client = ReturnType<typeof createApiClient>;

const PAGE_SIZE = 50;

export const createCatalogApi = (client: Client) => ({
  listSkills: () =>
    fetchAll(async (offset) => {
      const page = await client.get<SkillsPage>('/skills/', {
        query: { limit: PAGE_SIZE, offset },
      });
      return { items: page.skills, total: page.total };
    }),

  listTests: () =>
    fetchAll((offset) =>
      client.get<AssessmentPage>('/tests', { query: { limit: PAGE_SIZE, offset } }),
    ),

  getTest: (testId: number) => client.get<AssessmentDetail>(`/tests/${testId}`),

  getAccess: (testId: number) => client.get<AssessmentAccess>(`/tests/${testId}/access`),
});
EOF

mkdir -p src/lib/tests
cat > src/lib/tests/catalog.ts << 'EOF'
import type { AssessmentSummary, LevelName, Skill } from '../api/types';

export const LEVEL_LABELS: Record<LevelName, string> = {
  BEGINNER: 'Beginner',
  JUNIOR: 'Junior',
  MID: 'Mid',
  ADVANCED: 'Advanced',
};

export interface CatalogEntry {
  readonly test: AssessmentSummary;
  readonly skill: Skill;
}

export interface CatalogGroup {
  readonly category: string;
  readonly entries: readonly CatalogEntry[];
}

export const FORMAT_LABELS: Record<AssessmentSummary['format'], string> = {
  adaptive: 'Adaptive',
  fixed: 'Fixed',
};

const UNKNOWN_POSITION = Number.MAX_SAFE_INTEGER;

export const groupByCategory = (
  skills: readonly Skill[],
  tests: readonly AssessmentSummary[],
): CatalogGroup[] => {
  const skillById = new Map(skills.map((skill) => [skill.skill_id, skill]));
  const position = new Map(skills.map((skill, index) => [skill.skill_id, index]));

  const entries = [...tests]
    .sort(
      (a, b) =>
        (position.get(a.skill_id) ?? UNKNOWN_POSITION) -
        (position.get(b.skill_id) ?? UNKNOWN_POSITION),
    )
    .map<CatalogEntry>((test) => ({
      test,
      skill: skillById.get(test.skill_id) ?? {
        skill_id: test.skill_id,
        skill_name: test.skill_name,
        category: 'Other',
        description: '',
      },
    }));

  const groups = new Map<string, CatalogEntry[]>();
  entries.forEach((entry) => {
    groups.set(entry.skill.category, [...(groups.get(entry.skill.category) ?? []), entry]);
  });

  return [...groups].map(([category, items]) => ({ category, entries: items }));
};

export const describeCredits = (credits: number) =>
  `${credits} ${credits === 1 ? 'credit' : 'credits'}`;

export const describePrice = (credits: number) =>
  credits === 0 ? 'Free' : describeCredits(credits);

export const describeLevels = (levels: readonly LevelName[]) =>
  levels.map((level) => LEVEL_LABELS[level]).join(', ');
EOF

mkdir -p src/components/PaymentNeeded
cat > src/components/PaymentNeeded/PaymentNeeded.tsx << 'EOF'
import { useId } from 'react';
import { Link } from 'react-router-dom';
import { LuWallet } from 'react-icons/lu';
import { describeCredits } from '../../lib/tests/catalog';

interface PaymentNeededProps {
  readonly priceCredits: number;
  readonly balance?: number;
  readonly buyHref?: string;
}

export const PaymentNeeded = ({
  priceCredits,
  balance,
  buyHref = '/pricing',
}: PaymentNeededProps) => {
  const headingId = useId();
  const shortfall = balance === undefined ? 0 : Math.max(priceCredits - balance, 1);

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800"
        >
          <LuWallet size={20} />
        </span>
        <div className="flex flex-col gap-1 text-[14px] leading-[1.55] text-amber-950">
          <h2 id={headingId} className="font-heading text-[18px] font-bold text-slate-950">
            Payment needed
          </h2>
          <p>This test costs {describeCredits(priceCredits)}.</p>
          {balance !== undefined && (
            <p>
              You have {describeCredits(balance)}. Buy {shortfall} more to start.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={buyHref}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-4 text-[15px] font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Buy credits
        </Link>
        <Link
          to="/tests"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-[15px] font-medium text-slate-800 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Back to tests
        </Link>
      </div>
    </section>
  );
};
EOF

mkdir -p src/components/PaymentNeeded
cat > src/components/PaymentNeeded/index.ts << 'EOF'
export * from './PaymentNeeded';
EOF

mkdir -p src/pages
cat > src/pages/TestStart.tsx << 'EOF'
import { useCallback, useId } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { PageLoader } from '../components/Loader';
import { PaymentNeeded } from '../components/PaymentNeeded';
import { catalogApi, type AssessmentAccess } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { describeError } from '../lib/api/describeError';
import { useRequest } from '../lib/hooks/useRequest';
import { describeCredits, FORMAT_LABELS } from '../lib/tests/catalog';

const isStatus = (error: unknown, status: number) =>
  error instanceof ApiError && error.status === status;

const describeAccess = ({ reason, price_credits, credits_balance }: AssessmentAccess) => {
  if (reason === 'free') return 'This test is free.';
  if (reason === 'subscription') return 'Your subscription covers this test.';
  return `This test uses ${describeCredits(price_credits)}. You have ${describeCredits(credits_balance)}.`;
};

const TestDetails = ({ id }: { id: number }) => {
  const listId = useId();

  const load = useCallback(async () => {
    const [test, access] = await Promise.all([
      catalogApi.getTest(id),
      catalogApi.getAccess(id).catch((error: unknown) => {
        if (isStatus(error, 402)) return undefined;
        throw error;
      }),
    ]);
    return { test, access };
  }, [id]);
  const { state, retry } = useRequest(load);

  if (state.status === 'loading') {
    return <PageLoader title="Loading the test" className="flex-1" />;
  }

  if (state.status === 'error') {
    if (isStatus(state.error, 404)) return <Navigate to="/page-not-found" replace />;

    return (
      <div className="flex w-full max-w-[480px] flex-col gap-4">
        <Alert variant="error">{describeError(state.error)}</Alert>
        <Button fullWidth={false} onClick={retry}>
          Try again
        </Button>
      </div>
    );
  }

  const { test, access } = state.data;
  const facts = [
    `${test.question_count} questions`,
    `${test.duration_minutes} minutes`,
    FORMAT_LABELS[test.format],
  ].join(' · ');

  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-white p-6 sm:p-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-[28px] leading-[1.25] font-bold text-slate-950">
          {test.title}
        </h1>
        <p className="max-w-[60ch] text-[15px] leading-[1.55] text-slate-600">{test.description}</p>
        <p className="text-[14px] font-medium text-slate-700">{facts}</p>
      </header>

      {test.what_you_get.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 id={listId} className="text-[16px] font-semibold text-slate-950">
            What you get
          </h2>
          <ul
            aria-labelledby={listId}
            className="flex list-disc flex-col gap-1 pl-5 text-[14px] text-slate-700"
          >
            {test.what_you_get.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {access?.can_start ? (
        <p className="text-[14px] text-slate-700">{describeAccess(access)}</p>
      ) : (
        <PaymentNeeded
          priceCredits={access?.price_credits ?? test.price_credits}
          balance={access?.credits_balance}
        />
      )}
    </div>
  );
};

export const TestStart = () => {
  const { testId } = useParams();
  const id = Number(testId);

  if (!Number.isInteger(id) || id <= 0) {
    return <Navigate to="/page-not-found" replace />;
  }

  return <TestDetails key={id} id={id} />;
};
EOF

mkdir -p src/pages
cat > src/pages/index.ts << 'EOF'
export * from './Home';
export * from './Contact';
export * from './Dashboard';
export * from './Assessment';
export * from './AssessmentResults';
export * from './Programme';
export * from './AssessmentProcessing';
export * from './SkillTests';
export * from './TestStart';
EOF

mkdir -p src/pages
cat > src/pages/SkillTests.tsx << 'EOF'
import { useId } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { PageLoader } from '../components/Loader';
import { StatusLabel } from '../components/StatusLabel';
import { catalogApi } from '../lib/api';
import { describeError } from '../lib/api/describeError';
import { useRequest } from '../lib/hooks/useRequest';
import {
  describeLevels,
  describePrice,
  FORMAT_LABELS,
  groupByCategory,
  type CatalogGroup,
} from '../lib/tests/catalog';

const load = () => Promise.all([catalogApi.listSkills(), catalogApi.listTests()]);

const CategorySection = ({ group }: { group: CatalogGroup }) => {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <h2 id={headingId} className="font-heading text-[22px] font-bold text-slate-950">
        {group.category}
      </h2>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {group.entries.map(({ test, skill }) => (
          <Card
            key={test.test_id}
            title={test.title}
            description={skill.description}
            footer={
              <>
                <StatusLabel status={test.price_credits === 0 ? 'success' : 'info'}>
                  {describePrice(test.price_credits)}
                </StatusLabel>
                <Link
                  to={`/tests/${test.test_id}`}
                  aria-label={`Start ${test.title} test`}
                  className="ml-auto inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-4 text-[14px] font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Start test
                </Link>
              </>
            }
          >
            <ul className="flex flex-col gap-1 text-[13px] text-slate-600">
              <li>{test.question_count} questions</li>
              <li>{test.duration_minutes} minutes</li>
              <li>{FORMAT_LABELS[test.format]}</li>
              <li>{describeLevels(test.levels)}</li>
            </ul>
          </Card>
        ))}
      </div>
    </section>
  );
};

export const SkillTests = () => {
  const { state, retry } = useRequest(load);

  if (state.status === 'loading') {
    return <PageLoader title="Loading the tests" className="flex-1" />;
  }

  if (state.status === 'error') {
    return (
      <div className="flex w-full max-w-[480px] flex-col gap-4 px-5 py-8 sm:px-8">
        <Alert variant="error">{describeError(state.error)}</Alert>
        <Button fullWidth={false} onClick={retry}>
          Try again
        </Button>
      </div>
    );
  }

  const [skills, tests] = state.data;
  const groups = groupByCategory(skills, tests);

  return (
    <div className="flex w-full max-w-[1100px] flex-col gap-8 px-5 py-8 sm:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-[28px] leading-[1.25] font-bold text-slate-950 sm:text-[32px]">
          Skill tests
        </h1>
        <p className="text-[15px] text-slate-600">
          Choose a skill to test. Your result shows your level and what to learn next.
        </p>
      </header>

      {groups.length === 0 ? (
        <EmptyState
          title="No tests are available yet"
          description="Check back soon. New skill tests are added regularly."
        />
      ) : (
        groups.map((group) => <CategorySection key={group.category} group={group} />)
      )}
    </div>
  );
};
EOF

mkdir -p src/routes
cat > src/routes/routeMap.ts << 'EOF'
export interface PlaceholderRoute {
  readonly path: string;
  readonly title: string;
  readonly description: string;
}

export const PUBLIC_PLACEHOLDERS: readonly PlaceholderRoute[] = [
  {
    path: '/how-it-works',
    title: 'How it works',
    description: 'See how one test engine guides careers, audits teams and validates talent.',
  },
  {
    path: '/pricing',
    title: 'Pricing',
    description: 'Plans for individuals, recruiters and organizations.',
  },
  {
    path: '/for-individuals',
    title: 'For individuals',
    description: 'Discover a career path or test your own skills and download a shareable report.',
  },
  {
    path: '/for-organizations',
    title: 'For organizations',
    description: 'Audit your team against the Global Standard for their roles and titles.',
  },
  {
    path: '/for-recruiters',
    title: 'For recruiters',
    description: "Verify a candidate's real skill level before you make an offer.",
  },
  {
    path: '/help',
    title: 'Help Center',
    description: 'Answers to common questions about tests, reports and accounts.',
  },
  {
    path: '/privacy',
    title: 'Privacy policy',
    description: 'How CareerLine AI collects, uses and protects your data.',
  },
  {
    path: '/terms',
    title: 'Terms of service',
    description: 'The terms that apply when you use CareerLine AI.',
  },
];

export const APP_PLACEHOLDERS: readonly PlaceholderRoute[] = [
  {
    path: '/reports',
    title: 'Reports',
    description: 'Every report you have taken, ready to download or share.',
  },
  {
    path: '/reports/:reportId',
    title: 'Report',
    description: 'Score, strengths, weaknesses and a recommendation for the next step.',
  },
  {
    path: '/candidates',
    title: 'Candidates',
    description: 'Candidates you have assigned a role-specific test to.',
  },
  {
    path: '/candidates/:candidateId',
    title: 'Candidate report',
    description: 'A scored report with a clear recommendation before you make an offer.',
  },
  {
    path: '/team',
    title: 'Team',
    description: 'Your team roster, mapped to roles and titles.',
  },
  {
    path: '/team/import',
    title: 'Import team roster',
    description: 'Upload your staff list so tests can be assigned by role.',
  },
  {
    path: '/team/heatmap',
    title: 'Capability heatmap',
    description: 'How your whole team measures up, skill by skill.',
  },
  {
    path: '/tasks',
    title: 'Tasks',
    description: 'Tests and recommendations waiting on you.',
  },
  {
    path: '/users',
    title: 'Users',
    description: 'People who can access this account.',
  },
  {
    path: '/support',
    title: 'Support',
    description: 'Get help from the CareerLine AI team.',
  },
  {
    path: '/settings',
    title: 'Settings',
    description: 'Your profile, password and notification preferences.',
  },
];
EOF

mkdir -p src/routes
cat > src/routes/index.tsx << 'EOF'
import type { RouteObject } from 'react-router-dom';
import { MainLayout } from './MainLayout/MainLayout.tsx';
import { NoFooterLayout } from './NoFooterLayout/NoFooterLayout.tsx';
import { AppLayout } from './AppLayout/AppLayout.tsx';
import { TestFrame } from './TestFrame/TestFrame.tsx';
import { RequireAccess } from './guards/RequireAccess.tsx';
import { SessionRoot } from './SessionRoot.tsx';
import { accessFor } from './access';
import {
  Home,
  Contact,
  Dashboard,
  Assessment,
  AssessmentProcessing,
  AssessmentResults,
  Programme,
  SkillTests,
  TestStart,
} from '../pages';
import { NotFound } from '../components/NotFound/NotFound.tsx';
import { NoAccess } from '../components/NoAccess';
import { PlaceholderPage } from '../components/PlaceholderPage';
import { authRoutes } from '../authRoutes';
import type { UserType } from '../lib/session';
import { APP_PLACEHOLDERS, PUBLIC_PLACEHOLDERS, type PlaceholderRoute } from './routeMap';

const toRoute = ({ path, title, description }: PlaceholderRoute): RouteObject => ({
  path,
  element: <PlaceholderPage title={title} description={description} />,
});

const guard = (allow: readonly UserType[], children: RouteObject[]): RouteObject => ({
  element: <RequireAccess allow={allow} />,
  children,
});

const groupByAccess = (placeholders: readonly PlaceholderRoute[]): RouteObject[] => {
  const groups = new Map<string, { allow: readonly UserType[]; routes: RouteObject[] }>();

  placeholders.forEach((placeholder) => {
    const allow = accessFor(placeholder.path);
    const key = allow.join(',');
    const group = groups.get(key) ?? { allow, routes: [] };
    group.routes.push(toRoute(placeholder));
    groups.set(key, group);
  });

  return [...groups.values()].map(({ allow, routes }) => guard(allow, routes));
};

export const getRoutes = (): RouteObject[] => [
  {
    element: <SessionRoot />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: '/', element: <Home /> },
          { path: '/contact', element: <Contact /> },
          ...PUBLIC_PLACEHOLDERS.map(toRoute),
        ],
      },
      ...authRoutes,
      {
        element: <RequireAccess />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: '/dashboard', element: <Dashboard /> },
              guard(accessFor('/tests'), [{ path: '/tests', element: <SkillTests /> }]),
              ...groupByAccess(APP_PLACEHOLDERS),
            ],
          },
          {
            element: <TestFrame />,
            children: [
              guard(accessFor('/tests/:testId'), [
                { path: '/tests/:testId', element: <TestStart /> },
              ]),
            ],
          },
          guard(accessFor('/assessment'), [
            { path: '/assessment', element: <Assessment /> },
            { path: '/assessment/processing', element: <AssessmentProcessing /> },
            { path: '/assessment/results', element: <AssessmentResults /> },
            { path: '/programmes/:programmeId', element: <Programme /> },
          ]),
        ],
      },
      {
        element: <NoFooterLayout />,
        children: [
          { path: '/no-access', element: <NoAccess /> },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
];
EOF

echo "Wrote 10 files."
