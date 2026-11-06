import type { createApiClient } from './client';
import type {
  SkillHistory,
  ProgrammePage,
  AnswerRequest,
  AttemptState,
  AccountDeletion,
  AccountDeletionRequest,
  Acknowledgement,
  Checkout,
  CheckoutRequest,
  ConsentChange,
  Consents,
  BeginnerPath,
  ContactReceipt,
  ContactRequest,
  CreditPack,
  Credits,
  DataExport,
  IntakeQuestionnaire,
  IntakeSubmission,
  Payment,
  Plan,
  Profile,
  Programme,
  ProgrammeClick,
  ProgrammeClickRequest,
  RegisterRequest,
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

  listForRole: async (roleId: number) =>
    (
      await client.get<ProgrammePage>('/programmes', {
        query: { role_id: roleId, limit: 3, offset: 0 },
      })
    ).items,

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

  get: (reference: string) => client.get<Payment>(`/payments/${encodeURIComponent(reference)}`),

  credits: () => client.get<Credits>('/credits'),
});

export const createPrivacyApi = (client: Client) => ({
  getConsents: () => client.get<Consents>('/privacy/consents'),

  updateConsents: (items: readonly ConsentChange[]) =>
    client.put<Consents>('/privacy/consents', { body: { items } }),

  requestExport: () => client.post<DataExport>('/privacy/data-exports'),

  getExport: (exportId: number) => client.get<DataExport>(`/privacy/data-exports/${exportId}`),

  requestDeletion: (request: AccountDeletionRequest) =>
    client.post<AccountDeletion>('/privacy/account-deletion', { body: request }),

  cancelDeletion: () => client.delete<AccountDeletion>('/privacy/account-deletion'),
});

export const createProfileApi = (client: Client) => ({
  get: () => client.get<Profile>('/profile'),

  skillHistory: (skillId: number) =>
    client.get<SkillHistory>('/profile/skills/history', { query: { skill_id: skillId } }),
});

export const createAttemptsApi = (client: Client) => ({
  start: (skillId: number) =>
    client.post<AttemptState>('/attempts/start', { body: { skill_id: skillId } }),

  current: (attemptId: number) => client.get<AttemptState>(`/attempts/${attemptId}/question`),

  answer: (attemptId: number, answer: AnswerRequest) =>
    client.post<AttemptState>(`/attempts/${attemptId}/answer`, { body: answer }),
});
