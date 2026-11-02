import type { TokenResponse } from '../api/types';
import { readRole } from './role';
import type { Session, UserType } from './types';

export const sessionFromToken = (
  token: TokenResponse,
  email: string,
  userType?: UserType,
): Session => ({
  token: token.access_token,
  user: { name: token.full_name, email, userType: userType ?? readRole(email) ?? 'beginner' },
});
