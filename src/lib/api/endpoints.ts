import type { createApiClient } from './client';
import type {
  Acknowledgement,
  Attempt,
  Checkout,
  CheckoutRequest,
  AttemptSubmission,
  AttemptSubmissionReply,
  BeginnerPath,
  ContactReceipt,
  ContactRequest,
  CreditPack,
  IntakeQuestionnaire,
  IntakeSubmission,
  LevelName,
  Plan,
  Profile,
  Programme,
  ProgrammeClick,
  ProgrammeClickRequest,
  RegisterRequest,
  StartedAttempt,
  SubscribeRequest,
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

  verifyEmail: (token: string) =>
    client.post<Acknowledgement>('/accounts/verify-email', { body: { token }, auth: false }),

  resendVerification: () => client.post<Acknowledgement>('/accounts/verify-email/resend'),
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

export const createSubscriptionsApi = (client: Client) => ({
  listPlans: () => client.get<Plan[]>('/subscriptions/plans'),

  subscribe: (request: SubscribeRequest) =>
    client.post<Checkout>('/subscriptions', { body: request }),
});

export const createPaymentsApi = (client: Client) => ({
  listCreditPacks: () => client.get<CreditPack[]>('/payments/credit-packs'),

  checkout: (request: CheckoutRequest) =>
    client.post<Checkout>('/payments/checkout', { body: request }),
});

export const createProfileApi = (client: Client) => ({
  get: () => client.get<Profile>('/profile'),
});

export const createAttemptsApi = (client: Client) => ({
  start: (skillId: number, level: LevelName) =>
    client.post<StartedAttempt>('/attempts/start', {
      body: { skill_id: skillId, declared_level: level },
    }),

  get: async (attemptId: number) =>
    (await client.get<{ readonly attempt: Attempt }>(`/attempts/${attemptId}`)).attempt,

  submit: (submission: AttemptSubmission) =>
    client.post<AttemptSubmissionReply>('/attempts/submit', { body: submission }),
});
