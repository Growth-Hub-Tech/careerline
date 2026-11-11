import type { AuditSummary, RoleSummary, TeamMember } from '../../lib/api';

export const ROLES: readonly RoleSummary[] = [
  {
    role_id: 1,
    title: 'Frontend Developer',
    slug: 'frontend-developer',
    track: 'tech',
    summary: '',
  },
  { role_id: 2, title: 'Backend Developer', slug: 'backend-developer', track: 'tech', summary: '' },
];

export const member = (id: number, overrides: Partial<TeamMember> = {}): TeamMember => ({
  member_id: id,
  full_name: `Member ${id}`,
  email: `member${id}@kora.example`,
  department: 'Engineering',
  role_id: 1,
  role_title: 'Frontend Developer',
  status: 'invited',
  latest_level: null,
  ...overrides,
});

export const MEMBERS: readonly TeamMember[] = [
  member(1, { full_name: 'Ada Obi', status: 'completed', latest_level: 'MID' }),
  member(2, { full_name: 'Tunde Bello', status: 'in_progress' }),
  member(3, {
    full_name: 'Kemi Ade',
    role_id: 2,
    role_title: 'Backend Developer',
    status: 'not_invited',
  }),
];

export const AUDITS: readonly AuditSummary[] = [
  {
    audit_id: 3,
    name: 'Q4 engineering audit',
    status: 'in_progress',
    role_ids: [1, 2],
    members_total: 8,
    members_completed: 3,
    started_at: '2026-10-20T09:00:00Z',
    completed_at: null,
  },
];
