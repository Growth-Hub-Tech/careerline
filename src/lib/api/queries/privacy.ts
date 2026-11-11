import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPost, apiPut } from '..';
import { hasStatus } from '../ApiError';
import { queryKeys } from '../queryKeys';
import { API_ROUTES } from '../routes';
import type {
  AccountDeletion,
  AccountDeletionRequest,
  ConsentChange,
  Consents,
  DataExport,
} from '../types';

export const privacyQueries = {
  consents: () =>
    queryOptions({
      queryKey: queryKeys.privacy.consents,
      queryFn: ({ signal }) => apiGet<Consents>(API_ROUTES.privacy.consents, { signal }),
    }),

  // null when no deletion was ever asked for (the API says 404)
  deletion: () =>
    queryOptions({
      queryKey: queryKeys.privacy.deletion,
      queryFn: async ({ signal }) => {
        try {
          return await apiGet<AccountDeletion>(API_ROUTES.privacy.accountDeletion, { signal });
        } catch (error) {
          if (hasStatus(error, 404)) return null;
          throw error;
        }
      },
    }),

  dataExport: (exportId: number) =>
    queryOptions({
      queryKey: queryKeys.privacy.dataExport(exportId),
      queryFn: ({ signal }) =>
        apiGet<DataExport>(API_ROUTES.privacy.dataExport(exportId), { signal }),
    }),
};

export const useUpdateConsents = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (items: readonly ConsentChange[]) =>
      apiPut<Consents>(API_ROUTES.privacy.consents, { items }),
    onSuccess: (consents) => client.setQueryData(queryKeys.privacy.consents, consents),
  });
};

export const useRequestExport = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<DataExport>(API_ROUTES.privacy.dataExports),
    onSuccess: (dataExport) =>
      client.setQueryData(queryKeys.privacy.dataExport(dataExport.export_id), dataExport),
  });
};

const useDeletionChange = (
  change: (request?: AccountDeletionRequest) => Promise<AccountDeletion>,
) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: change,
    onSuccess: (deletion) => client.setQueryData(queryKeys.privacy.deletion, deletion),
  });
};

export const useRequestDeletion = () =>
  useDeletionChange((request) =>
    apiPost<AccountDeletion>(API_ROUTES.privacy.accountDeletion, request),
  );

export const useCancelDeletion = () =>
  useDeletionChange(() => apiDelete<AccountDeletion>(API_ROUTES.privacy.accountDeletion));
