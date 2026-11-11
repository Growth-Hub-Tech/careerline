import type { Account } from '../api/types';
import type { User, UserType } from './types';

type OrganisationRole = NonNullable<Account['organisation_role']>;

const ORGANISATION_USER_TYPES: Readonly<Record<OrganisationRole, UserType>> = {
  owner: 'organization',
  admin: 'organization',
  recruiter: 'recruiter',
};

const ORGANISATION_TYPES: readonly UserType[] = Object.values(ORGANISATION_USER_TYPES);

// The account's organisation role decides the user type on any device; the type chosen on Get
// started (kept in this browser) counts only for an account outside any organisation
export const userTypeFor = (
  organisationRole: Account['organisation_role'] | undefined,
  chosen: UserType | undefined,
): UserType | undefined => (organisationRole ? ORGANISATION_USER_TYPES[organisationRole] : chosen);

// Get started is for someone outside any organisation who has not chosen a type here yet
export const needsUserType = (user: User, chosen: UserType | undefined) =>
  chosen === undefined && !ORGANISATION_TYPES.includes(user.userType);
