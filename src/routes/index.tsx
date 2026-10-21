import type { RouteObject } from 'react-router-dom';
import { MainLayout } from './MainLayout/MainLayout.tsx';
import { MinimalLayout } from './MinimalLayout/MinimalLayout.tsx';
import { NoFooterLayout } from './NoFooterLayout/NoFooterLayout.tsx';
import { Home, Question, Contact } from '../pages';
import { NotFound } from '../components/NotFound/NotFound.tsx';
import { authRoutes } from '../authRoutes';

export const getRoutes = (): RouteObject[] => [
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/contact', element: <Contact /> },
    ],
  },
  {
    element: <MinimalLayout />,
    children: [{ path: '/question', element: <Question /> }],
  },
  // Auth screens have their own header, so they sit outside the layouts
  ...authRoutes,
  {
    element: <NoFooterLayout />,
    children: [{ path: '*', element: <NotFound /> }],
  },
];
