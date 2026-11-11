// Every API address the site calls, relative to VITE_API_URL (…/api/v1). Checked against
// docs/openapi.json by routes.test.ts.
const segment = (value: string) => encodeURIComponent(value);

export const API_ROUTES = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
  },
  accounts: {
    me: '/accounts/me',
    password: '/accounts/me/password',
    passwordReset: '/accounts/password-reset',
    passwordResetConfirm: '/accounts/password-reset/confirm',
    verifyEmail: '/accounts/verify-email',
    resendVerification: '/accounts/verify-email/resend',
  },
  contact: '/contact',
  beginner: {
    intake: '/beginner-path/intake',
    recommendations: '/beginner-path/recommendations',
  },
  programmes: {
    list: '/programmes',
    detail: (programmeId: number) => `/programmes/${programmeId}`,
    clicks: (programmeId: number) => `/programmes/${programmeId}/clicks`,
  },
  profile: {
    detail: '/profile',
    skills: '/profile/skills',
    skillHistory: '/profile/skills/history',
  },
  subscriptions: {
    plans: '/subscriptions/plans',
    subscribe: '/subscriptions',
    mine: '/subscriptions/me',
    cancel: '/subscriptions/me/cancel',
    resume: '/subscriptions/me/resume',
  },
  payments: {
    list: '/payments',
    creditPacks: '/payments/credit-packs',
    checkout: '/payments/checkout',
    detail: (reference: string) => `/payments/${segment(reference)}`,
    credits: '/credits',
  },
  privacy: {
    consents: '/privacy/consents',
    dataExports: '/privacy/data-exports',
    dataExport: (exportId: number) => `/privacy/data-exports/${exportId}`,
    accountDeletion: '/privacy/account-deletion',
  },
  catalog: {
    skills: '/skills/',
    tests: '/tests',
    test: (testId: number) => `/tests/${testId}`,
    access: (testId: number) => `/tests/${testId}/access`,
  },
  attempts: {
    start: '/attempts/start',
    question: (attemptId: number) => `/attempts/${attemptId}/question`,
    answer: (attemptId: number) => `/attempts/${attemptId}/answer`,
    review: (attemptId: number) => `/attempts/${attemptId}/review`,
    cancel: (attemptId: number) => `/attempts/${attemptId}/cancel`,
  },
  results: {
    list: '/results',
    detail: (resultId: number) => `/results/${resultId}`,
    report: (resultId: number) => `/results/${resultId}/report`,
  },
  recruiter: {
    candidates: '/recruiter/candidates',
    candidate: (candidateId: number) => `/recruiter/candidates/${candidateId}`,
    candidateReport: (candidateId: number) => `/recruiter/candidates/${candidateId}/report`,
  },
  invitations: {
    list: '/invitations',
    revoke: (invitationId: number) => `/invitations/${invitationId}/revoke`,
    byToken: (token: string) => `/invitations/token/${segment(token)}`,
    accept: (token: string) => `/invitations/token/${segment(token)}/accept`,
  },
  organisations: {
    me: '/organisations/me',
    users: (organisationId: number) => `/organisations/${organisationId}/users`,
    user: (organisationId: number, learnerId: number) =>
      `/organisations/${organisationId}/users/${learnerId}`,
    members: (organisationId: number) => `/organisations/${organisationId}/members`,
    audits: (organisationId: number) => `/organisations/${organisationId}/audits`,
    audit: (organisationId: number, auditId: number) =>
      `/organisations/${organisationId}/audits/${auditId}`,
    retest: (organisationId: number, auditId: number) =>
      `/organisations/${organisationId}/audits/${auditId}/retest`,
    deltas: (organisationId: number, auditId: number) =>
      `/organisations/${organisationId}/audits/${auditId}/deltas`,
    heatmap: (organisationId: number) => `/organisations/${organisationId}/heatmap`,
    targets: (organisationId: number) => `/organisations/${organisationId}/targets`,
  },
  roles: {
    list: '/roles',
    detail: (roleId: number) => `/roles/${roleId}`,
  },
} as const;
