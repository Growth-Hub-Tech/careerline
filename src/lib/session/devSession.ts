import type { Session, UserType } from './types';

export const createDevSession = (userType: UserType): Session => ({
  token: 'dev-session-token',
  user: { name: 'Skye Favour', email: 'skye@example.com', userType },
});
