import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { SessionContext } from './SessionContext';
import {
  clearSession,
  readSession,
  SESSION_EXPIRED_EVENT,
  SESSION_KEY,
  writeSession,
} from './storage';
import type { Session } from './types';

interface SessionProviderProps {
  readonly children: ReactNode;
}

export const SessionProvider = ({ children }: SessionProviderProps) => {
  const [session, setSession] = useState<Session | null>(readSession);

  useEffect(() => {
    const refresh = () => setSession(readSession());
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === SESSION_KEY) refresh();
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      signIn: (next: Session) => {
        writeSession(next);
        setSession(next);
      },
      signOut: () => {
        clearSession();
        setSession(null);
      },
    }),
    [session],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};
