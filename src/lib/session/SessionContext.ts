import { createContext } from 'react';
import type { Session } from './types';

export interface SessionContextValue {
  readonly session: Session | null;
  readonly signIn: (session: Session) => void;
  readonly signOut: () => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);
