import { createDevSession, writeSession, type UserType } from '../lib/session';

export const signInAs = (userType: UserType = 'beginner') => {
  writeSession(createDevSession(userType));
};
