import { USER_TYPES, type UserType } from './types';

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
