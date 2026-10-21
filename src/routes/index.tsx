import type { RouteObject } from 'react-router-dom';
import { MainLayout } from './MainLayout/MainLayout.tsx';
import { NoFooterLayout } from './NoFooterLayout/NoFooterLayout.tsx';
import { Home, Contact } from '../pages';
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
  ...authRoutes,
  {
    element: <NoFooterLayout />,
    children: [{ path: '*', element: <NotFound /> }],
  },
];
