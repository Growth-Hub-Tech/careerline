import { Navigate, type RouteObject } from 'react-router-dom';
import { CompleteProfile } from './components/CompleteProfile';
import { GetStarted } from './components/GetStarted';
import { ResetPassword } from './components/ResetPassword';
import { SignIn } from './components/SignIn';
import { SignUp } from './components/SignUp';
import { VerifyEmailPage } from './components/VerifyEmail';

export const authRoutes: RouteObject[] = [
  { path: '/sign-in', element: <SignIn /> },
  { path: '/forgot-password', element: <ResetPassword /> },
  { path: '/reset-password', element: <Navigate to="/forgot-password" replace /> },
  { path: '/sign-up', element: <SignUp /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/complete-profile', element: <CompleteProfile /> },
  { path: '/get-started', element: <GetStarted /> },
];
