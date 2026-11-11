import type { Session, UserType } from './types';

export const createDevSession = (userType: UserType): Session => ({
  user: { name: 'Skye Favour', email: 'skye@example.com', userType },
});
