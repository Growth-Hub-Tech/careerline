import type { RouteObject } from 'react-router-dom';
import {
  CompleteProfile,
  GetStarted,
  ResetPassword,
  SignIn,
  SignUp,
  VerifyEmail,
} from './components';

export const authRoutes: RouteObject[] = [
  { path: '/sign-in', element: <SignIn /> },
  { path: '/forgot-password', element: <ResetPassword /> },
  { path: '/sign-up', element: <SignUp /> },
  { path: '/verify-email', element: <VerifyEmail /> },
  { path: '/complete-profile', element: <CompleteProfile /> },
  { path: '/get-started', element: <GetStarted /> },
];
