import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { queryKeys } from '../api/queryKeys';
import type { Account } from '../api/types';
import { registerAccount, signInWithPassword, signOutOfApi } from './auth';
import { useUserStore } from './store';

// Signing in replaces whoever was signed in before (the provider then clears their data) and
// keeps the account the sign-in has just read, so the app does not ask for it again
const useStartSession = () => {
  const client = useQueryClient();
  return (account: Account) => {
    useUserStore.getState().signIn(account);
    client.setQueryData(queryKeys.account, account);
  };
};

export const useSignIn = () => {
  const startSession = useStartSession();
  return useMutation({
    mutationFn: signInWithPassword,
    onSuccess: startSession,
  });
};

export const useRegister = () => {
  const startSession = useStartSession();
  return useMutation({
    mutationFn: registerAccount,
    onSuccess: (account) => {
      if (account) startSession(account);
    },
  });
};

// Signing out here does not wait for the API: the browser forgets the user at once, and the
// cookie is cleared when the request lands
export const useSignOut = () => {
  const navigate = useNavigate();
  return () => {
    void signOutOfApi().catch(() => undefined);
    useUserStore.getState().signOut();
    navigate('/sign-in', { replace: true });
  };
};

// Ending every session must reach the API, so it waits for it and can fail
export const useSignOutEverywhere = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => signOutOfApi(true),
    onSuccess: () => {
      useUserStore.getState().signOut();
      navigate('/sign-in', { replace: true });
    },
  });
};
