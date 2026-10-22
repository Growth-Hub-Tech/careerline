import type { RouteObject } from 'react-router-dom';
import { MainLayout } from './MainLayout/MainLayout.tsx';
import { NoFooterLayout } from './NoFooterLayout/NoFooterLayout.tsx';
import { Home, Contact } from '../pages';
import { NotFound } from '../components/NotFound/NotFound.tsx';
import { NoAccess } from '../components/NoAccess';
import { PlaceholderPage } from '../components/PlaceholderPage';
import { authRoutes } from '../authRoutes';
import { APP_PLACEHOLDERS, PUBLIC_PLACEHOLDERS, type PlaceholderRoute } from './routeMap';

const toRoute = ({ path, title, description }: PlaceholderRoute): RouteObject => ({
  path,
  element: <PlaceholderPage title={title} description={description} />,
});

export const getRoutes = (): RouteObject[] => [
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
    element: <NoFooterLayout />,
    children: [
      ...APP_PLACEHOLDERS.map(toRoute),
      { path: '/no-access', element: <NoAccess /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];
