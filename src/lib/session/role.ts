import type { Account } from '../api/types';
import { USER_TYPES, type Session, type UserType } from './types';

const KEY = 'careerline.roles';

type RoleMap = Record<string, UserType>;

const isUserType = (value: unknown): value is UserType =>
  USER_TYPES.some((userType) => userType === value);

const readAll = (): RoleMap => {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? '{}');
    if (typeof parsed !== 'object' || parsed === null) return {};

    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => isUserType(value)),
    ) as RoleMap;
  } catch {
    return {};
  }
};

export const readRole = (email: string): UserType | undefined => readAll()[email.toLowerCase()];

export const writeRole = (email: string, userType: UserType) => {
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ ...readAll(), [email.toLowerCase()]: userType }),
    );
  } catch {
    return;
  }
};

type OrganisationRole = NonNullable<Account['organisation_role']>;

const ORGANISATION_USER_TYPES: Readonly<Record<OrganisationRole, UserType>> = {
  owner: 'organization',
  admin: 'organization',
  recruiter: 'recruiter',
};

// The account's organisation role decides the user type on any device; the type chosen on Get
// started (kept in this browser) counts only for an account outside any organisation
export const userTypeFor = (
  email: string,
  organisationRole: Account['organisation_role'] | undefined,
): UserType | undefined =>
  organisationRole ? ORGANISATION_USER_TYPES[organisationRole] : readRole(email);

// Get started is for someone outside any organisation who has not chosen a type here yet
export const needsUserType = ({ user }: Session) =>
  readRole(user.email) === undefined &&
  !Object.values(ORGANISATION_USER_TYPES).includes(user.userType);
