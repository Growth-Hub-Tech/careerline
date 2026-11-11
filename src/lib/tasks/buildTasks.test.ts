import type { BeginnerPath, Invitation } from '../api/types';
import { AUDITS, member, MEMBERS } from '../../test/fixtures/organisation';
import { RESULT_SUMMARIES } from '../../test/fixtures/results';
import { beginnerTasks, organisationTasks, professionalTasks, recruiterTasks } from './buildTasks';

const ids = (tasks: readonly { id: string }[]) => tasks.map((task) => task.id);

const PATH: BeginnerPath = {
  intake_id: 1,
  submitted_at: '2026-10-20T09:00:00Z',
  recommendations: [
    {
      rank: 1,
      role_id: 3,
      title: 'Product Designer',
      match_score: 88,
      reasons: [],
      starting_test_id: null,
      programme: {
        programme_id: 9,
        name: 'Design Foundations',
        provider: 'Incubate',
        provider_type: 'incubate',
        mode: 'online',
        duration_weeks: 12,
        price: { amount: 0, currency: 'NGN' },
      },
    },
  ],
};

const invitation = (id: number, overrides: Partial<Invitation> = {}): Invitation => ({
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
  sent_at: '2026-10-20T09:00:00Z',
  accepted_at: null,
  completed_at: null,
  expires_at: '2026-10-27T09:00:00Z',
  ...overrides,
});

describe('tasks for a beginner', () => {
  it('starts with the questionnaire', () => {
    expect(ids(beginnerTasks(null))).toEqual(['questionnaire']);
    expect(ids(beginnerTasks({ ...PATH, recommendations: [] }))).toEqual(['questionnaire']);
  });

  it('points to the career paths and the top programme', () => {
    const tasks = beginnerTasks(PATH);

    expect(ids(tasks)).toEqual(['paths', 'programme']);
    expect(tasks[1].to).toBe('/programmes/9');
  });
});

describe('tasks for a professional', () => {
  it('starts with a first test', () => {
    expect(ids(professionalTasks([]))).toEqual(['first-test']);
  });

  it('offers the newest report and a retake', () => {
    const [report, retest] = professionalTasks(RESULT_SUMMARIES);

    expect(report.to).toBe('/reports/32');
    expect(retest.to).toBe('/tests/201');
  });
});

describe('tasks for a recruiter', () => {
  it('starts with sending a test', () => {
    expect(ids(recruiterTasks([]))).toEqual(['send']);
  });

  it('lists finished reports and tests still out, but nothing ended', () => {
    const tasks = recruiterTasks([
      invitation(1, { status: 'completed' }),
      invitation(2, { status: 'accepted' }),
      invitation(3, { status: 'revoked' }),
    ]);

    expect(ids(tasks)).toEqual(['report-1', 'waiting-2']);
    expect(tasks[1].waiting).toBe(true);
  });
});

describe('tasks for an organisation', () => {
  it('starts with the staff list', () => {
    expect(ids(organisationTasks(AUDITS, []))).toEqual(['roster']);
  });

  it('follows audits in progress and counts people not invited yet', () => {
    const tasks = organisationTasks(AUDITS, [...MEMBERS, member(4, { status: 'not_invited' })]);

    expect(ids(tasks)).toEqual(['audit-3', 'not-invited']);
    expect(tasks[1].text).toBe('2 people have not been invited to a test yet.');
  });
});
