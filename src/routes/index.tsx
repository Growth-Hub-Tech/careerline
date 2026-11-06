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
  TestAttempt,
  Invitation,
  Quote,
} from '../pages';
import {
  Pricing,
  Credits,
  PaymentCheck,
  PrivacyCentre,
  Billing,
  Reports,
  Report,
  Candidates,
  CandidateReport,
  TeamAudits,
  StaffUpload,
  StartAudit,
  AuditProgress,
  TeamHeatmap,
  EmployeeReport,
  CompanyTargets,
} from './lazyPages';
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
          { path: '/pricing', element: <Pricing /> },
          { path: '/quote', element: <Quote /> },
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
              { path: '/credits', element: <Credits /> },
              { path: '/billing', element: <Billing /> },
              { path: '/payments/callback', element: <PaymentCheck /> },
              { path: '/settings/privacy', element: <PrivacyCentre /> },
              guard(accessFor('/tests'), [{ path: '/tests', element: <SkillTests /> }]),
              guard(accessFor('/reports'), [
                { path: '/reports', element: <Reports /> },
                { path: '/reports/:reportId', element: <Report /> },
              ]),
              guard(accessFor('/candidates'), [
                { path: '/candidates', element: <Candidates /> },
                { path: '/candidates/:candidateId', element: <CandidateReport /> },
              ]),
              guard(accessFor('/team'), [
                { path: '/team', element: <TeamAudits /> },
                { path: '/team/import', element: <StaffUpload /> },
                { path: '/team/audits/new', element: <StartAudit /> },
                { path: '/team/heatmap', element: <TeamHeatmap /> },
                { path: '/team/members/:memberId', element: <EmployeeReport /> },
                { path: '/team/targets', element: <CompanyTargets /> },
                { path: '/team/audits/:auditId', element: <AuditProgress /> },
              ]),
              ...groupByAccess(APP_PLACEHOLDERS),
            ],
          },
          {
            element: <TestFrame />,
            children: [
              guard(accessFor('/tests/:testId'), [
                { path: '/tests/:testId', element: <TestStart /> },
              ]),
              guard(accessFor('/tests/:testId/attempt'), [
                { path: '/tests/:testId/attempt', element: <TestAttempt /> },
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
          { path: '/invitations/:token', element: <Invitation /> },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
];
