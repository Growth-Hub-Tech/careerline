import type { createApiClient } from './client';
import type {
  Acknowledgement,
  BeginnerPath,
  ContactReceipt,
  ContactRequest,
  IntakeQuestionnaire,
  IntakeSubmission,
  Programme,
  ProgrammeClick,
  ProgrammeClickRequest,
  RegisterRequest,
  TokenResponse,
} from './types';

type Client = ReturnType<typeof createApiClient>;

export const createAuthApi = (client: Client) => ({
  login: (email: string, password: string) =>
    client.post<TokenResponse>('/auth/login', {
      body: new URLSearchParams({ username: email, password }),
      auth: false,
    }),

  register: (details: RegisterRequest) =>
    client.post<unknown>('/auth/register', { body: details, auth: false }),

  requestPasswordReset: (email: string) =>
    client.post<Acknowledgement>('/accounts/password-reset', { body: { email }, auth: false }),
});

export const createContactApi = (client: Client) => ({
  send: (message: ContactRequest) =>
    client.post<ContactReceipt>('/contact', { body: message, auth: false }),
});

export const createBeginnerApi = (client: Client) => ({
  getIntake: () => client.get<IntakeQuestionnaire>('/beginner-path/intake'),

  submitIntake: (submission: IntakeSubmission) =>
    client.post<BeginnerPath>('/beginner-path/intake', { body: submission }),

  getRecommendations: () => client.get<BeginnerPath>('/beginner-path/recommendations'),
});

export const createProgrammesApi = (client: Client) => ({
  get: (programmeId: number) => client.get<Programme>(`/programmes/${programmeId}`),

  recordClick: (programmeId: number, click: ProgrammeClickRequest) =>
    client.post<ProgrammeClick>(`/programmes/${programmeId}/clicks`, { body: click }),
});
