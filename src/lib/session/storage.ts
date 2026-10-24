import { USER_TYPES, type Session, type UserType } from './types';

export const SESSION_KEY = 'careerline.session';
export const SESSION_EXPIRED_EVENT = 'careerline:session-expired';

const isUserType = (value: unknown): value is UserType =>
  USER_TYPES.some((userType) => userType === value);

const isSession = (value: unknown): value is Session => {
  if (typeof value !== 'object' || value === null) return false;

  const { token, user } = value as Record<string, unknown>;
  if (typeof token !== 'string' || token === '') return false;
  if (typeof user !== 'object' || user === null) return false;

  const { name, email, userType } = user as Record<string, unknown>;
  return typeof name === 'string' && typeof email === 'string' && isUserType(userType);
};

export const readSession = (): Session | null => {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const writeSession = (session: Session) => {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    return;
  }
};

export const clearSession = () => {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    return;
  }
};

export const expireSession = () => {
  clearSession();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};
