export const USER_TYPES = ['beginner', 'self-test', 'recruiter', 'organization'] as const;

export type UserType = (typeof USER_TYPES)[number];

export const USER_TYPE_LABELS: Record<UserType, string> = {
  beginner: 'Beginner',
  'self-test': 'Professional',
  recruiter: 'Recruiter',
  organization: 'Organization',
};

export interface SessionUser {
  readonly name: string;
  readonly email: string;
  readonly userType: UserType;
}

// The API's sign-in cookie is the session itself; this only remembers who is signed in
export interface Session {
  readonly user: SessionUser;
}
