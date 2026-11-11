import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { Account } from '../api/types';
import { needsUserType, userTypeFor } from './role';
import { isUserType, type User, type UserType } from './types';

export const USER_STORAGE_KEY = 'careerline.user';

type Roles = Readonly<Record<string, UserType>>;

interface UserState {
  readonly user: User | null;
  // The type chosen on Get started, per email (lower case)
  readonly roles: Roles;
  // The API ended the session (a 401); the sign-in page says so until the next sign-in
  readonly expired: boolean;
  readonly signIn: (account: Account) => void;
  readonly syncAccount: (account: Account) => void;
  readonly chooseUserType: (userType: UserType) => void;
  readonly signOut: () => void;
  readonly expire: () => void;
}

type Persisted = Pick<UserState, 'user' | 'roles'>;

const keyOf = (email: string) => email.toLowerCase();

const userFrom = (account: Account, roles: Roles): User => ({
  name: account.full_name,
  email: account.email,
  userType: userTypeFor(account.organisation_role, roles[keyOf(account.email)]) ?? 'beginner',
});

const isUser = (value: unknown): value is User => {
  if (typeof value !== 'object' || value === null) return false;
  const { name, email, userType } = value as Record<string, unknown>;
  return typeof name === 'string' && typeof email === 'string' && isUserType(userType);
};

const readRoles = (value: unknown): Roles =>
  typeof value === 'object' && value !== null
    ? Object.fromEntries(Object.entries(value).filter(([, role]) => isUserType(role)))
    : {};

// What this browser stored is checked before it is trusted
const readPersisted = (value: unknown): Persisted => {
  const { user, roles } = (typeof value === 'object' && value !== null ? value : {}) as Record<
    string,
    unknown
  >;
  return { user: isUser(user) ? user : null, roles: readRoles(roles) };
};

// Before this store, the signed-in user and the chosen types had keys of their own. They are read
// once so nobody is signed out by the change, and removed on the first save.
const LEGACY_SESSION_KEY = 'careerline.session';
const LEGACY_ROLES_KEY = 'careerline.roles';

const parse = (raw: string | null): unknown => {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const readLegacy = (): string | null => {
  const session = parse(localStorage.getItem(LEGACY_SESSION_KEY)) as { user?: unknown } | null;
  const roles = parse(localStorage.getItem(LEGACY_ROLES_KEY));
  if (!session && !roles) return null;
  return JSON.stringify({ state: { user: session?.user ?? null, roles }, version: 0 });
};

const storage: StateStorage = {
  getItem: (name) => localStorage.getItem(name) ?? readLegacy(),
  setItem: (name, value) => {
    localStorage.setItem(name, value);
    localStorage.removeItem(LEGACY_SESSION_KEY);
    localStorage.removeItem(LEGACY_ROLES_KEY);
  },
  removeItem: (name) => localStorage.removeItem(name),
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      roles: {},
      expired: false,

      signIn: (account) => set({ user: userFrom(account, get().roles), expired: false }),

      // A reply about someone other than the current user (who has since changed) is ignored
      syncAccount: (account) => {
        const { user, roles } = get();
        if (!user || keyOf(user.email) !== keyOf(account.email)) return;
        const next = userFrom(account, roles);
        if (next.name !== user.name || next.userType !== user.userType) set({ user: next });
      },

      chooseUserType: (userType) => {
        const { user, roles } = get();
        if (!user) return;
        set({ user: { ...user, userType }, roles: { ...roles, [keyOf(user.email)]: userType } });
      },

      signOut: () => set({ user: null }),

      expire: () => set({ user: null, expired: true }),
    }),
    {
      name: USER_STORAGE_KEY,
      storage: createJSONStorage(() => storage),
      partialize: ({ user, roles }): Persisted => ({ user, roles }),
      merge: (persisted, current) => ({ ...current, ...readPersisted(persisted) }),
    },
  ),
);

// Whether this person still has to say how they will use CareerLine (Get started)
export const userNeedsType = (user: User) =>
  needsUserType(user, useUserStore.getState().roles[keyOf(user.email)]);
