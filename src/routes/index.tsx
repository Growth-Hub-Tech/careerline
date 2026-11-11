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
  AudiencePage,
  HowItWorks,
  Help,
  PrivacyPolicy,
  Terms,
  Settings,
  Support,
  Tasks,
  Users,
  AttemptReview,
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
import { authRoutes } from '../authRoutes';
import type { UserType } from '../lib/user';

const guard = (allow: readonly UserType[], children: RouteObject[]): RouteObject => ({
  element: <RequireAccess allow={allow} />,
  children,
});

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
          { path: '/how-it-works', element: <HowItWorks /> },
          { path: '/help', element: <Help /> },
          { path: '/privacy', element: <PrivacyPolicy /> },
          { path: '/terms', element: <Terms /> },
          { path: '/for-individuals', element: <AudiencePage audience="individuals" /> },
          { path: '/for-organizations', element: <AudiencePage audience="organizations" /> },
          { path: '/for-recruiters', element: <AudiencePage audience="recruiters" /> },
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
              { path: '/settings', element: <Settings /> },
              { path: '/support', element: <Support /> },
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
              { path: '/tasks', element: <Tasks /> },
              { path: '/attempts/:attemptId/review', element: <AttemptReview /> },
              guard(accessFor('/users'), [{ path: '/users', element: <Users /> }]),
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
