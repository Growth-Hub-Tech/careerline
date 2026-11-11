import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '..';
import { hasStatus } from '../ApiError';
import { fetchAll } from '../fetchAll';
import { queryKeys } from '../queryKeys';
import { API_ROUTES } from '../routes';
import type {
  Candidate,
  CandidateCreate,
  CandidatePage,
  CandidateReport,
  Invitation,
  InvitationCreate,
  InvitationPage,
  InvitationPublic,
} from '../types';

const PAGE_SIZE = 50;

export const recruiterQueries = {
  candidates: () =>
    queryOptions({
      queryKey: queryKeys.recruiter.candidates,
      queryFn: ({ signal }) =>
        fetchAll((offset) =>
          apiGet<CandidatePage>(API_ROUTES.recruiter.candidates, {
            query: { limit: PAGE_SIZE, offset },
            signal,
          }),
        ),
    }),

  candidate: (candidateId: number) =>
    queryOptions({
      queryKey: queryKeys.recruiter.candidate(candidateId),
      queryFn: ({ signal }) =>
        apiGet<Candidate>(API_ROUTES.recruiter.candidate(candidateId), { signal }),
    }),

  // null until the candidate has finished a test and shared the result (the API says 404 or 409)
  candidateReport: (candidateId: number) =>
    queryOptions({
      queryKey: queryKeys.recruiter.candidateReport(candidateId),
      queryFn: async ({ signal }) => {
        try {
          return await apiGet<CandidateReport>(API_ROUTES.recruiter.candidateReport(candidateId), {
            signal,
          });
        } catch (error) {
          if (hasStatus(error, 404, 409)) return null;
          throw error;
        }
      },
    }),

  invitations: () =>
    queryOptions({
      queryKey: queryKeys.recruiter.invitations,
      queryFn: ({ signal }) =>
        fetchAll((offset) =>
          apiGet<InvitationPage>(API_ROUTES.invitations.list, {
            query: { limit: PAGE_SIZE, offset },
            signal,
          }),
        ),
    }),

  // The page a candidate opens from their email: it needs no session
  invitation: (token: string) =>
    queryOptions({
      queryKey: queryKeys.invitation(token),
      queryFn: ({ signal }) =>
        apiGet<InvitationPublic>(API_ROUTES.invitations.byToken(token), { auth: false, signal }),
      retry: false,
    }),
};

export const useAddCandidate = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (candidate: CandidateCreate) =>
      apiPost<Candidate>(API_ROUTES.recruiter.candidates, candidate),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.recruiter.candidates }),
  });
};

// Sending a test spends a credit and can add a candidate
export const useSendInvitation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (invitation: InvitationCreate) =>
      apiPost<Invitation>(API_ROUTES.invitations.list, invitation),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.recruiter.invitations }),
        client.invalidateQueries({ queryKey: queryKeys.recruiter.candidates }),
        client.invalidateQueries({ queryKey: queryKeys.payments.credits }),
      ]),
  });
};

export const useRevokeInvitation = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (invitationId: number) =>
      apiPost<Invitation>(API_ROUTES.invitations.revoke(invitationId)),
    onSuccess: (revoked) => {
      client.setQueryData<readonly Invitation[]>(queryKeys.recruiter.invitations, (list = []) =>
        list.map((item) => (item.invitation_id === revoked.invitation_id ? revoked : item)),
      );
      return client.invalidateQueries({ queryKey: queryKeys.payments.credits });
    },
  });
};

// Accepting starts the candidate's attempt; a reply without one cannot be continued
export const useAcceptInvitation = (token: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const accepted = await apiPost<InvitationPublic>(API_ROUTES.invitations.accept(token));
      if (accepted.attempt_id === null) throw new Error('The test could not be started.');
      return { ...accepted, attempt_id: accepted.attempt_id };
    },
    onSuccess: (invitation) => {
      client.setQueryData(queryKeys.invitation(token), invitation);
      return Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.payments.credits }),
        client.invalidateQueries({ queryKey: queryKeys.catalog.allAccess }),
      ]);
    },
  });
};
