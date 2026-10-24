import { matchPath } from 'react-router-dom';
import { USER_TYPES, type UserType } from '../lib/session';

const EVERYONE: readonly UserType[] = USER_TYPES;
const BEGINNERS: readonly UserType[] = ['beginner'];
const PROFESSIONALS: readonly UserType[] = ['self-test'];
const RECRUITERS: readonly UserType[] = ['recruiter'];
const ORGANIZATIONS: readonly UserType[] = ['organization'];

export const PAGE_ACCESS: Readonly<Partial<Record<string, readonly UserType[]>>> = {
  '/dashboard': EVERYONE,
  '/tasks': EVERYONE,
  '/support': EVERYONE,
  '/settings': EVERYONE,
  '/assessment': BEGINNERS,
  '/assessment/processing': BEGINNERS,
  '/assessment/results': BEGINNERS,
  '/programmes/:programmeId': BEGINNERS,
  '/tests': PROFESSIONALS,
  '/tests/:testId': PROFESSIONALS,
  '/reports': PROFESSIONALS,
  '/reports/:reportId': PROFESSIONALS,
  '/candidates': RECRUITERS,
  '/candidates/:candidateId': RECRUITERS,
  '/team': ORGANIZATIONS,
  '/team/import': ORGANIZATIONS,
  '/team/heatmap': ORGANIZATIONS,
  '/users': ORGANIZATIONS,
};

export const accessFor = (path: string): readonly UserType[] => PAGE_ACCESS[path] ?? EVERYONE;

export const canAccess = (userType: UserType, pathname: string) => {
  const pattern = Object.keys(PAGE_ACCESS).find((path) => matchPath({ path, end: true }, pathname));

  return pattern ? accessFor(pattern).includes(userType) : true;
};
