import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPatch, apiPost } from '..';
import { STALE_TIME } from '../queryClient';
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

export const useResetPassword = () =>
  useMutation({
    mutationFn: ({ email, pin, password }: { email: string; pin: string; password: string }) =>
      apiPost<Acknowledgement>(
        API_ROUTES.accounts.passwordReset,
        { email, pin, new_password: password },
        { auth: false },
      ),
  });
