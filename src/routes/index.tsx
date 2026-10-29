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
} from '../pages';
import { NotFound } from '../components/NotFound/NotFound.tsx';
import { NoAccess } from '../components/NoAccess';
import { PlaceholderPage } from '../components/PlaceholderPage';
import { authRoutes } from '../authRoutes';
import type { UserType } from '../lib/session';
import { APP_PLACEHOLDERS, PUBLIC_PLACEHOLDERS, type PlaceholderRoute } from './routeMap';

const TEST_FRAME_PATHS: readonly string[] = ['/tests/:testId'];

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

export const getRoutes = (): RouteObject[] => {
  const framed = APP_PLACEHOLDERS.filter(({ path }) => !TEST_FRAME_PATHS.includes(path));
  const fullScreen = APP_PLACEHOLDERS.filter(({ path }) => TEST_FRAME_PATHS.includes(path));

  return [
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
                ...groupByAccess(framed),
              ],
            },
            { element: <TestFrame />, children: groupByAccess(fullScreen) },
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
};
