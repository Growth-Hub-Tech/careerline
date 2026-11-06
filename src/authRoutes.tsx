import type { RouteObject } from 'react-router-dom';
import {
  CompleteProfile,
  GetStarted,
  ResetPassword,
  SignIn,
  SignUp,
  VerifyEmailPage,
} from './components';
import { SetNewPassword } from './pages/SetNewPassword';

export const authRoutes: RouteObject[] = [
  { path: '/sign-in', element: <SignIn /> },
  { path: '/forgot-password', element: <ResetPassword /> },
  { path: '/reset-password', element: <SetNewPassword /> },
  { path: '/sign-up', element: <SignUp /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/complete-profile', element: <CompleteProfile /> },
  { path: '/get-started', element: <GetStarted /> },
];
