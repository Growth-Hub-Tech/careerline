import type {
  Audit,
  AuditSummary,
  Heatmap,
  Organisation,
  Role,
  RoleSummary,
  Targets,
  TeamMember,
} from '../../lib/api';

export const ORGANISATION: Organisation = {
  organisation_id: 41,
  name: 'Kora Bank',
  industry: 'Finance',
  size: '51-200',
  seats_total: 50,
  seats_used: 8,
  created_at: '2026-10-01T09:00:00Z',
};

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

export const AUDIT: Audit = {
  ...AUDITS[0],
  benchmarks: [
    {
      role_id: 1,
      role_title: 'Frontend Developer',
      skill_id: 1,
      skill_name: 'Frontend Web Development',
      target_level: 'MID',
      team_average_score: 64.5,
      industry_average_score: 61,
      members_at_or_above_target: 2,
      members_tested: 3,
    },
  ],
};

export const HEATMAP: Heatmap = {
  organisation_id: 41,
  audit_id: null,
  group_by: 'member',
  skills: [
    { skill_id: 1, skill_name: 'Frontend Web Development' },
    { skill_id: 2, skill_name: 'Backend Development' },
  ],
  rows: [
    {
      key: '1',
      label: 'Ada Obi',
      members: 1,
      cells: [
        { skill_id: 1, average_score: 78, level: 'MID', members_tested: 1, band: 'strong' },
        { skill_id: 2, average_score: null, level: null, members_tested: 0, band: 'not_tested' },
      ],
    },
    {
      key: '2',
      label: 'Tunde Bello',
      members: 1,
      cells: [
        { skill_id: 1, average_score: 41.4, level: 'JUNIOR', members_tested: 1, band: 'weak' },
        { skill_id: 2, average_score: 55, level: 'JUNIOR', members_tested: 1, band: 'developing' },
      ],
    },
  ],
};

export const TARGETS: Targets = {
  organisation_id: 41,
  items: [
    {
      role_id: 1,
      role_title: 'Frontend Developer',
      skill_id: 1,
      skill_name: 'Frontend Web Development',
      target_level: 'MID',
      due_date: '2026-12-31',
      members_total: 3,
      members_meeting: 1,
      progress_percent: 33,
    },
  ],
};

export const roleWithSkills = (roleId: number): Role => ({
  ...ROLES[roleId - 1],
  description: '',
  skills:
    roleId === 1
      ? [
          { skill_id: 1, skill_name: 'Frontend Web Development', target_level: 'MID' },
          { skill_id: 2, skill_name: 'Backend Development', target_level: 'JUNIOR' },
        ]
      : [
          { skill_id: 2, skill_name: 'Backend Development', target_level: 'MID' },
          { skill_id: 3, skill_name: 'Databases', target_level: 'JUNIOR' },
        ],
  test_ids: [],
});
