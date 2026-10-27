import type { TokenResponse } from '../api/types';
import type { Session, UserType } from './types';

export const sessionFromToken = (
  token: TokenResponse,
  email: string,
  userType: UserType = 'beginner',
): Session => ({
  token: token.access_token,
  user: { name: token.full_name, email, userType },
});
