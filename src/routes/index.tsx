import type { RouteObject } from 'react-router-dom';
import { MainLayout } from './MainLayout/MainLayout.tsx';
import { MinimalLayout } from './MinimalLayout/MinimalLayout.tsx';
import { Home, Question, Contact } from '../pages';
import { NotFound } from '../components/NotFound/NotFound.tsx';
// import { NotFound } from '../components/NotFound';
import { SignIn } from '../components/SignIn';
import { ResetPassword } from '../components/ResetPassword';
import { SignUp as BeginnerSignUp } from '../features/beginner/auth/SignUp.tsx';
import { SignUp as RecruiterSignUp } from '../features/recruiters/auth/SignUp.tsx';
import { SignUp as OrganizationSignUp } from '../features/organizations/auth/SignUp.tsx';

export const getRoutes = (): RouteObject[] => [
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/contact',
        element: <Contact />,
      },
      // Catch-all, kept last so the fallback reads where you expect it.
      // React Router ranks by specificity, not array order, so every concrete
      // path above still wins over this one.
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  {
    element: <MinimalLayout />,
    children: [
      {
        path: '/question',
        element: <Question />,
      },
      {
        path: '/sign-in',
        element: <SignIn />,
      },
      {
        path: '/forgot-password',
        element: <ResetPassword />,
      },
      {
        path: '/beginner/sign-up',
        element: <BeginnerSignUp />,
      },
      {
        path: '/recruiter/sign-up',
        element: <RecruiterSignUp />,
      },
      {
        path: '/organization/sign-up',
        element: <OrganizationSignUp />,
      },
    ],
  },
];
