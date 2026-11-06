import type { createApiClient } from './client';
import { fetchAll } from './fetchAll';
import type {
  Candidate,
  CandidateCreate,
  CandidatePage,
  CandidateReport,
  Invitation,
  InvitationCreate,
  InvitationPage,
  InvitationPublic,
} from './types';

type Client = ReturnType<typeof createApiClient>;

const PAGE_SIZE = 50;

export const createRecruiterApi = (client: Client) => ({
  listCandidates: () =>
    fetchAll((offset) =>
      client.get<CandidatePage>('/recruiter/candidates', {
        query: { limit: PAGE_SIZE, offset },
      }),
    ),

  addCandidate: (candidate: CandidateCreate) =>
    client.post<Candidate>('/recruiter/candidates', { body: candidate }),

  getCandidate: (candidateId: number) =>
    client.get<Candidate>(`/recruiter/candidates/${candidateId}`),

  getReport: (candidateId: number) =>
    client.get<CandidateReport>(`/recruiter/candidates/${candidateId}/report`),
});

export const createInvitationsApi = (client: Client) => ({
  send: (invitation: InvitationCreate) =>
    client.post<Invitation>('/invitations', { body: invitation }),

  list: () =>
    fetchAll((offset) =>
      client.get<InvitationPage>('/invitations', { query: { limit: PAGE_SIZE, offset } }),
    ),

  revoke: (invitationId: number) => client.post<Invitation>(`/invitations/${invitationId}/revoke`),

  open: (token: string) =>
    client.get<InvitationPublic>(`/invitations/token/${encodeURIComponent(token)}`, {
      auth: false,
    }),

  accept: (token: string) =>
    client.post<InvitationPublic>(`/invitations/token/${encodeURIComponent(token)}/accept`),
});
