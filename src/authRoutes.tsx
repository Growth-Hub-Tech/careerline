import type { RouteObject } from 'react-router-dom';
import { CompleteProfile } from './components/CompleteProfile';
import { GetStarted } from './components/GetStarted';
import { ResetPassword } from './components/ResetPassword';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';

export const authRoutes: RouteObject[] = [
  { path: '/sign-in', element: <SignIn /> },
  { path: '/forgot-password', element: <ResetPassword /> },
  { path: '/sign-up', element: <SignUp /> },
  { path: '/complete-profile', element: <CompleteProfile /> },
  { path: '/get-started', element: <GetStarted /> },
];
