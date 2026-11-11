import { useEffect, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { accountQueries } from '../api/queries/account';
import { USER_STORAGE_KEY, useUserStore } from './store';

const emailOf = (user: { email: string } | null) => user?.email.toLowerCase() ?? null;

// The one place that keeps the remembered user and the API's session in step:
// - a remembered user is checked against the account (a 401 signs them out through the API
//   client), and the account's name and organisation role correct what this browser kept
// - when the signed-in person changes or signs out (here, in another tab, or because the session
//   ended), everything fetched for the previous person is dropped
export const UserProvider = ({ children }: { readonly children: ReactNode }) => {
  const client = useQueryClient();
  const isSignedIn = useUserStore((state) => state.user !== null);
  const { data: account } = useQuery({ ...accountQueries.me(), enabled: isSignedIn });

  useEffect(() => {
    if (account) useUserStore.getState().syncAccount(account);
  }, [account]);

  useEffect(
    () =>
      useUserStore.subscribe((state, previous) => {
        if (emailOf(state.user) !== emailOf(previous.user)) client.removeQueries();
      }),
    [client],
  );

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === USER_STORAGE_KEY) {
        void useUserStore.persist.rehydrate();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return children;
};
