import type { RouteObject } from 'react-router-dom';
import {
  CompleteProfile,
  GetStarted,
  ResetPassword,
  SignIn,
  SignUp,
  VerifyEmail,
} from './components';

/**
 * Auth screens carry their own header, so register these at the top level
 * of getRoutes() — not inside the layout that renders Navbar/Footer.
 */
export const authRoutes: RouteObject[] = [
  { path: '/sign-in', element: <SignIn /> },
  { path: '/forgot-password', element: <ResetPassword /> },
  // Sign-up flow: the role is chosen last, on /get-started
  { path: '/sign-up', element: <SignUp /> },
  { path: '/verify-email', element: <VerifyEmail /> },
  { path: '/complete-profile', element: <CompleteProfile /> },
  { path: '/get-started', element: <GetStarted /> },
];
