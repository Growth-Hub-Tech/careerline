import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost } from '..';
import { queryClient, STALE_TIME } from '../queryClient';
import { queryKeys } from '../queryKeys';
import { API_ROUTES } from '../routes';
import type { Account, AccountUpdate, Acknowledgement, ChangePasswordRequest } from '../types';

export const accountQueries = {
  me: () =>
    queryOptions({
      queryKey: queryKeys.account,
      queryFn: ({ signal }) => apiGet<Account>(API_ROUTES.accounts.me, { signal }),
      staleTime: STALE_TIME.record,
    }),

  // A POST with a single-use token: cached for good, so a second render (React's StrictMode, a
  // remount) never sends it twice. A confirmed email shows on the account.
  verifyEmail: (token: string) =>
    queryOptions({
      queryKey: queryKeys.verifyEmail(token),
      queryFn: async () => {
        const reply = await apiPost<Acknowledgement>(
          API_ROUTES.accounts.verifyEmail,
          { token },
          { auth: false },
        );
        void queryClient.invalidateQueries({ queryKey: queryKeys.account });
        return reply;
      },
      staleTime: Infinity,
      gcTime: Infinity,
      retry: false,
    }),
};

export const useAccount = () => useQuery(accountQueries.me());

export const useUpdateAccount = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (changes: AccountUpdate) => apiPatch<Account>(API_ROUTES.accounts.me, changes),
    onSuccess: (account) => client.setQueryData(queryKeys.account, account),
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: (request: ChangePasswordRequest) =>
      apiPost<Acknowledgement>(API_ROUTES.accounts.password, request),
  });

export const useResendVerification = () =>
  useMutation({
    mutationFn: () => apiPost<Acknowledgement>(API_ROUTES.accounts.resendVerification),
  });

export const useRequestPasswordReset = () =>
  useMutation({
    mutationFn: (email: string) =>
      apiPost<Acknowledgement>(API_ROUTES.accounts.passwordReset, { email }, { auth: false }),
  });

export const useConfirmPasswordReset = () =>
  useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      apiPost<Acknowledgement>(
        API_ROUTES.accounts.passwordResetConfirm,
        { token, new_password: newPassword },
        { auth: false },
      ),
  });
