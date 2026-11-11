import type { HeatmapGrouping } from './types';

// One place for every cache key. Keys nest, so invalidating a prefix (['organisation']) refreshes
// everything under it.
export const queryKeys = {
  account: ['account'] as const,
  verifyEmail: (token: string) => ['verify-email', token] as const,

  organisation: {
    all: ['organisation'] as const,
    me: ['organisation', 'me'] as const,
    users: ['organisation', 'users'] as const,
    members: ['organisation', 'members'] as const,
    audits: ['organisation', 'audits'] as const,
    audit: (auditId: number) => ['organisation', 'audits', auditId] as const,
    auditDeltas: (auditId: number) => ['organisation', 'audits', auditId, 'deltas'] as const,
    heatmaps: ['organisation', 'heatmap'] as const,
    heatmap: (groupBy: HeatmapGrouping, auditId: number | undefined) =>
      ['organisation', 'heatmap', groupBy, auditId ?? null] as const,
    targets: ['organisation', 'targets'] as const,
  },

  roles: {
    list: ['roles', 'list'] as const,
    detail: (roleId: number) => ['roles', roleId] as const,
  },

  programmes: {
    detail: (programmeId: number) => ['programmes', programmeId] as const,
    forRole: (roleId: number) => ['programmes', 'role', roleId] as const,
  },

  beginner: {
    intake: ['beginner', 'intake'] as const,
    recommendations: ['beginner', 'recommendations'] as const,
  },

  profile: {
    detail: ['profile'] as const,
    skills: ['profile', 'skills'] as const,
    skillHistory: (skillId: number) => ['profile', 'skills', 'history', skillId] as const,
  },

  catalog: {
    skills: ['skills'] as const,
    tests: ['tests', 'list'] as const,
    test: (testId: number) => ['tests', testId] as const,
    allAccess: ['test-access'] as const,
    access: (testId: number) => ['test-access', testId] as const,
  },

  attempts: {
    attempt: (attemptId: number) => ['attempts', attemptId] as const,
    review: (attemptId: number) => ['attempts', attemptId, 'review'] as const,
  },

  results: {
    list: ['results', 'list'] as const,
    detail: (resultId: number) => ['results', resultId] as const,
    report: (resultId: number) => ['results', resultId, 'report'] as const,
  },

  recruiter: {
    candidates: ['recruiter', 'candidates'] as const,
    candidate: (candidateId: number) => ['recruiter', 'candidates', candidateId] as const,
    candidateReport: (candidateId: number) =>
      ['recruiter', 'candidates', candidateId, 'report'] as const,
    invitations: ['recruiter', 'invitations'] as const,
  },

  invitation: (token: string) => ['invitation', token] as const,

  payments: {
    credits: ['credits'] as const,
    list: ['payments', 'list'] as const,
    payment: (reference: string) => ['payments', reference] as const,
    creditPacks: ['credit-packs'] as const,
    plans: ['plans'] as const,
    subscription: ['subscription'] as const,
  },

  privacy: {
    consents: ['privacy', 'consents'] as const,
    deletion: ['privacy', 'deletion'] as const,
    dataExport: (exportId: number) => ['privacy', 'exports', exportId] as const,
  },
};
