import type { IconType } from 'react-icons';
import { LuBadgeCheck, LuCompass, LuPuzzle, LuSearchCheck } from 'react-icons/lu';

export type RoleKey = 'beginner' | 'self-test' | 'recruiter' | 'organization';

export interface Role {
  readonly key: RoleKey;
  readonly title: string;
  readonly description: string;
  readonly icon: IconType;
  readonly iconClass: string;
  /** Where Continue on the role picker goes when no role-specific area exists yet. */
  readonly nextPath: string;
}

export const ROLES: readonly Role[] = [
  {
    key: 'beginner',
    title: 'Discover your career path',
    description: 'Take a short assessment and get a ranked list of tech paths that fit you.',
    icon: LuCompass,
    iconClass: 'bg-terracotta-100 text-terracotta-800',
    nextPath: '/dashboard',
  },
  {
    key: 'self-test',
    title: 'Test your skills',
    description: 'Take a skill test on your own and download a shareable report.',
    icon: LuPuzzle,
    iconClass: 'bg-amber-100 text-amber-800',
    nextPath: '/dashboard',
  },
  {
    key: 'recruiter',
    title: 'Validate talent',
    description: "Verify a candidate's real skill level before you make an offer.",
    icon: LuSearchCheck,
    iconClass: 'bg-indigo-100 text-indigo-900',
    nextPath: '/dashboard',
  },
  {
    key: 'organization',
    title: 'Audit your team',
    description: 'Test your staff against the Global Standard for their roles and titles.',
    icon: LuBadgeCheck,
    iconClass: 'bg-teal-100 text-teal-800',
    nextPath: '/dashboard',
  },
];

/** Sign-up flow: signUp → completeProfile (registers) → verifyEmail → link in the email → getStarted. */
export const AUTH_PATHS = {
  signIn: '/sign-in',
  forgotPassword: '/forgot-password',
  signUp: '/sign-up',
  verifyEmail: '/verify-email',
  completeProfile: '/complete-profile',
  getStarted: '/get-started',
} as const;
