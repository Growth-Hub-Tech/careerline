import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  catalogApi,
  invitationsApi,
  organisationsApi,
  paymentsApi,
  privacyApi,
  profileApi,
  programmesApi,
  recruiterApi,
  resultsApi,
  rolesApi,
  subscriptionsApi,
} from '../lib/api';
import { SessionProvider, type UserType } from '../lib/session';
import {
  AuditProgress,
  Billing,
  CandidateReport,
  Candidates,
  CompanyTargets,
  Credits,
  Home,
  EmployeeReport,
  Invitation,
  Pricing,
  PrivacyCentre,
  Report,
  StaffUpload,
  StartAudit,
  TeamAudits,
  TeamHeatmap,
  TestStart,
} from '../pages';
import { PROGRAMME } from './fixtures/beginner';
import {
  AUDIT,
  AUDITS,
  HEATMAP,
  MEMBERS,
  ORGANISATION,
  ROLES,
  roleWithSkills,
  TARGETS,
} from './fixtures/organisation';
import { CREDIT_PACKS, CREDITS, PLANS, payment, subscription } from './fixtures/payments';
import { consents } from './fixtures/privacy';
import { CANDIDATE_REPORT, CANDIDATES, INVITATION_PUBLIC, INVITATIONS } from './fixtures/recruiter';
import { REPORT_READY, RESULT_DETAIL, SKILL_HISTORY } from './fixtures/results';
import { ACCESS_WITH_CREDITS, TEST_DETAIL, TESTS } from './fixtures/tests';
import { signInAs } from './session';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  catalogApi: { getTest: vi.fn(), getAccess: vi.fn(), listTests: vi.fn() },
  paymentsApi: { listCreditPacks: vi.fn(), credits: vi.fn(), list: vi.fn() },
  subscriptionsApi: { listPlans: vi.fn(), mine: vi.fn() },
  privacyApi: { getConsents: vi.fn() },
  recruiterApi: { listCandidates: vi.fn(), getCandidate: vi.fn(), getReport: vi.fn() },
  invitationsApi: { list: vi.fn(), open: vi.fn() },
  organisationsApi: {
    me: vi.fn(),
    listAudits: vi.fn(),
    listMembers: vi.fn(),
    getAudit: vi.fn(),
    heatmap: vi.fn(),
    getTargets: vi.fn(),
  },
  rolesApi: { list: vi.fn(), get: vi.fn() },
  programmesApi: { listForRole: vi.fn() },
  profileApi: { skillHistory: vi.fn() },
  resultsApi: { get: vi.fn(), getReport: vi.fn() },
}));

beforeEach(() => {
  vi.mocked(catalogApi.getTest).mockResolvedValue(TEST_DETAIL);
  vi.mocked(catalogApi.getAccess).mockResolvedValue(ACCESS_WITH_CREDITS);
  vi.mocked(catalogApi.listTests).mockResolvedValue([...TESTS.items]);
  vi.mocked(paymentsApi.listCreditPacks).mockResolvedValue([...CREDIT_PACKS]);
  vi.mocked(paymentsApi.credits).mockResolvedValue(CREDITS);
  vi.mocked(paymentsApi.list).mockResolvedValue([payment('paid')]);
  vi.mocked(subscriptionsApi.listPlans).mockResolvedValue([...PLANS]);
  vi.mocked(subscriptionsApi.mine).mockResolvedValue(subscription());
  vi.mocked(privacyApi.getConsents).mockResolvedValue(consents());
  vi.mocked(recruiterApi.listCandidates).mockResolvedValue([...CANDIDATES]);
  vi.mocked(recruiterApi.getCandidate).mockResolvedValue(CANDIDATES[0]);
  vi.mocked(recruiterApi.getReport).mockResolvedValue(CANDIDATE_REPORT);
  vi.mocked(invitationsApi.list).mockResolvedValue([...INVITATIONS]);
  vi.mocked(invitationsApi.open).mockResolvedValue(INVITATION_PUBLIC);
  vi.mocked(organisationsApi.me).mockResolvedValue(ORGANISATION);
  vi.mocked(organisationsApi.listAudits).mockResolvedValue([...AUDITS]);
  vi.mocked(organisationsApi.listMembers).mockResolvedValue([...MEMBERS]);
  vi.mocked(organisationsApi.getAudit).mockResolvedValue(AUDIT);
  vi.mocked(organisationsApi.heatmap).mockResolvedValue(HEATMAP);
  vi.mocked(organisationsApi.getTargets).mockResolvedValue(TARGETS);
  vi.mocked(rolesApi.list).mockResolvedValue([...ROLES]);
  vi.mocked(rolesApi.get).mockResolvedValue(roleWithSkills(1));
  vi.mocked(programmesApi.listForRole).mockResolvedValue([PROGRAMME]);
  vi.mocked(profileApi.skillHistory).mockResolvedValue(SKILL_HISTORY);
  vi.mocked(resultsApi.get).mockResolvedValue(RESULT_DETAIL);
  vi.mocked(resultsApi.getReport).mockResolvedValue(REPORT_READY);
});

interface PageCase {
  readonly name: string;
  readonly path: string;
  readonly address: string;
  readonly element: ReactElement;
  readonly ready: string;
  readonly userType: UserType;
}

const PAGES: readonly PageCase[] = [
  {
    name: 'landing',
    path: '/',
    address: '/',
    element: <Home />,
    ready: 'Discover the right career path, assess talents, validate capabilities',
    userType: 'self-test',
  },
  {
    name: 'pricing',
    path: '/pricing',
    address: '/pricing',
    element: <Pricing />,
    ready: 'For individuals',
    userType: 'self-test',
  },
  {
    name: 'credits',
    path: '/credits',
    address: '/credits',
    element: <Credits />,
    ready: 'Credit history',
    userType: 'self-test',
  },
  {
    name: 'billing',
    path: '/billing',
    address: '/billing',
    element: <Billing />,
    ready: 'Your plan',
    userType: 'self-test',
  },
  {
    name: 'privacy centre',
    path: '/settings/privacy',
    address: '/settings/privacy',
    element: <PrivacyCentre />,
    ready: 'Who can see your results',
    userType: 'self-test',
  },
  {
    name: 'test start',
    path: '/tests/:testId',
    address: '/tests/202',
    element: <TestStart />,
    ready: 'Start test',
    userType: 'self-test',
  },
  {
    name: 'result',
    path: '/reports/:reportId',
    address: '/reports/31',
    element: <Report />,
    ready: 'CareerLine AI Skill Report',
    userType: 'self-test',
  },
  {
    name: 'candidates',
    path: '/candidates',
    address: '/candidates',
    element: <Candidates />,
    ready: 'Tests sent',
    userType: 'recruiter',
  },
  {
    name: 'candidate report',
    path: '/candidates/:candidateId',
    address: '/candidates/601',
    element: <CandidateReport />,
    ready: 'Recommendation',
    userType: 'recruiter',
  },
  {
    name: 'invitation',
    path: '/invitations/:token',
    address: '/invitations/token-1',
    element: <Invitation />,
    ready: 'What you are agreeing to',
    userType: 'self-test',
  },
  {
    name: 'team audits',
    path: '/team',
    address: '/team',
    element: <TeamAudits />,
    ready: 'Q4 engineering audit',
    userType: 'organization',
  },
  {
    name: 'staff upload',
    path: '/team/import',
    address: '/team/import',
    element: <StaffUpload />,
    ready: 'Staff list (CSV file)',
    userType: 'organization',
  },
  {
    name: 'start audit',
    path: '/team/audits/new',
    address: '/team/audits/new',
    element: <StartAudit />,
    ready: 'Roles to test',
    userType: 'organization',
  },
  {
    name: 'audit progress',
    path: '/team/audits/:auditId',
    address: '/team/audits/3',
    element: <AuditProgress />,
    ready: 'Where people are',
    userType: 'organization',
  },
  {
    name: 'heatmap',
    path: '/team/heatmap',
    address: '/team/heatmap',
    element: <TeamHeatmap />,
    ready: 'Ada Obi',
    userType: 'organization',
  },
  {
    name: 'employee report',
    path: '/team/members/:memberId',
    address: '/team/members/2',
    element: <EmployeeReport />,
    ready: 'Role standard',
    userType: 'organization',
  },
  {
    name: 'company targets',
    path: '/team/targets',
    address: '/team/targets',
    element: <CompanyTargets />,
    ready: 'Edit targets',
    userType: 'organization',
  },
];

const violations = async (container: HTMLElement) => {
  const result = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
  return result.violations.map(
    (violation) =>
      `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`,
  );
};

describe('accessibility', () => {
  it.each(PAGES)('finds no problems on the $name page', async (page) => {
    signInAs(page.userType);
    const { container } = render(
      <MemoryRouter initialEntries={[page.address]}>
        <SessionProvider>
          <main>
            <Routes>
              <Route path={page.path} element={page.element} />
            </Routes>
          </main>
        </SessionProvider>
      </MemoryRouter>,
    );

    expect((await screen.findAllByText(page.ready)).length).toBeGreaterThan(0);
    expect(await violations(container)).toEqual([]);
  });
});
