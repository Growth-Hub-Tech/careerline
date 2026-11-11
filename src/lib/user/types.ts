export const USER_TYPES = ['beginner', 'self-test', 'recruiter', 'organization'] as const;

export type UserType = (typeof USER_TYPES)[number];

export const USER_TYPE_LABELS: Record<UserType, string> = {
  beginner: 'Beginner',
  'self-test': 'Professional',
  recruiter: 'Recruiter',
  organization: 'Organization',
};

export const isUserType = (value: unknown): value is UserType =>
  USER_TYPES.some((userType) => userType === value);

// Who is signed in. The API's HttpOnly cookie is the session itself; the browser only keeps this.
export interface User {
  readonly name: string;
  readonly email: string;
  readonly userType: UserType;
}
