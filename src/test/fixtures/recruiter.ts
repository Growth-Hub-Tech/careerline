import type {
  Candidate,
  CandidateReport,
  CandidateTestResult,
  Invitation,
  InvitationPublic,
} from '../../lib/api';

export const ADA_RESULT: CandidateTestResult = {
  test_id: 201,
  test_title: 'Frontend Web Development',
  level: 'MID',
  percentage_score: 78,
  passed: true,
  completed_at: '2026-11-02T10:00:00Z',
  result_id: 91,
};

export const candidate = (id: number, overrides: Partial<Candidate> = {}): Candidate => ({
  candidate_id: id,
  full_name: `Candidate ${id}`,
  email: `candidate${id}@example.com`,
  role_id: 101,
  role_title: 'Frontend Developer',
  status: 'invited',
  added_at: '2026-11-01T09:00:00Z',
  latest_result: null,
  ...overrides,
});

export const CANDIDATES: readonly Candidate[] = [
  candidate(601, {
    full_name: 'Ada Obi',
    email: 'ada@example.com',
    status: 'completed',
    latest_result: ADA_RESULT,
  }),
  candidate(602, { full_name: 'Tunde Bello', email: 'tunde@example.com' }),
];

export const invitation = (id: number, overrides: Partial<Invitation> = {}): Invitation => ({
  invitation_id: id,
  token: `token-${id}`,
  kind: 'candidate',
  status: 'sent',
  email: `candidate${id}@example.com`,
  full_name: `Candidate ${id}`,
  test_id: 201,
  test_title: 'Frontend Web Development',
  candidate_id: id,
  organisation_id: null,
  attempt_id: null,
  result_id: null,
  invite_url: `https://careerline.example/invitations/token-${id}`,
  sent_at: '2026-11-01T09:00:00Z',
  accepted_at: null,
  completed_at: null,
  expires_at: '2026-11-08T09:00:00Z',
  ...overrides,
});

export const INVITATIONS: readonly Invitation[] = [
  invitation(1, {
    full_name: 'Ada Obi',
    email: 'ada@example.com',
    candidate_id: 601,
    status: 'completed',
    result_id: 91,
  }),
  invitation(2, { full_name: 'Tunde Bello', email: 'tunde@example.com', candidate_id: 602 }),
];

export const CANDIDATE_REPORT: CandidateReport = {
  candidate_id: 601,
  full_name: 'Ada Obi',
  role_title: 'Frontend Developer',
  fit: 'strong_fit',
  summary: 'Ada answered most frontend questions correctly and is strongest in layout and CSS.',
  results: [ADA_RESULT],
  report_url: 'https://files.example.test/candidate-601.pdf',
};

export const INVITATION_PUBLIC: InvitationPublic = {
  token: 'token-1',
  status: 'sent',
  invited_by: 'Brightway Recruiting',
  full_name: 'Ada Obi',
  test_id: 201,
  test_title: 'Frontend Web Development',
  duration_minutes: 30,
  message: 'Please take this test before Friday.',
  expires_at: '2026-11-08T09:00:00Z',
  attempt_id: null,
};
