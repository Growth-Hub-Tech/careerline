import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import {
  attemptsApi,
  beginnerApi,
  catalogApi,
  invitationsApi,
  organisationsApi,
  paymentsApi,
  profileApi,
  programmesApi,
  recruiterApi,
  resultsApi,
  rolesApi,
} from '../lib/api';
import { PATH, PROFILE, PROGRAMME, QUESTIONNAIRE } from '../test/fixtures/beginner';
import {
  AUDIT,
  AUDITS,
  HEATMAP,
  MEMBERS,
  ORGANISATION,
  roleWithSkills,
  TARGETS,
} from '../test/fixtures/organisation';
import { CREDITS } from '../test/fixtures/payments';
import {
  CANDIDATE_REPORT,
  CANDIDATES,
  candidate,
  INVITATIONS,
  invitation,
} from '../test/fixtures/recruiter';
import { REPORT_READY, RESULT_DETAIL, SKILL_HISTORY } from '../test/fixtures/results';
import {
  ACCESS_WITH_CREDITS,
  ATTEMPT_COMPLETED,
  attemptAt,
  TEST_DETAIL,
  TESTS,
} from '../test/fixtures/tests';
import { signInAs } from '../test/session';
import { getRoutes } from './index';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  catalogApi: { getTest: vi.fn(), getAccess: vi.fn(), listTests: vi.fn() },
  attemptsApi: { start: vi.fn(), current: vi.fn(), answer: vi.fn() },
  resultsApi: { get: vi.fn(), getReport: vi.fn() },
  profileApi: { get: vi.fn(), skillHistory: vi.fn() },
  beginnerApi: { getIntake: vi.fn(), submitIntake: vi.fn(), getRecommendations: vi.fn() },
  programmesApi: { get: vi.fn(), recordClick: vi.fn(), listForRole: vi.fn() },
  paymentsApi: { credits: vi.fn() },
  recruiterApi: {
    listCandidates: vi.fn(),
    addCandidate: vi.fn(),
    getCandidate: vi.fn(),
    getReport: vi.fn(),
  },
  invitationsApi: { list: vi.fn(), send: vi.fn() },
  organisationsApi: {
    me: vi.fn(),
    listAudits: vi.fn(),
    listMembers: vi.fn(),
    startAudit: vi.fn(),
    getAudit: vi.fn(),
    heatmap: vi.fn(),
    getTargets: vi.fn(),
  },
  rolesApi: { get: vi.fn() },
}));

const App = () => useRoutes(getRoutes());

const start = (address: string) =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <App />
    </MemoryRouter>,
  );

const heading = (name: string | RegExp) => screen.findByRole('heading', { level: 1, name });

const click = async (role: 'button' | 'link', name: string | RegExp) =>
  userEvent.click(await screen.findByRole(role, { name }));

describe('the four main journeys', () => {
  it('a professional takes a skill test and reads the report', async () => {
    vi.mocked(catalogApi.getTest).mockResolvedValue(TEST_DETAIL);
    vi.mocked(catalogApi.getAccess).mockResolvedValue(ACCESS_WITH_CREDITS);
    const onlyQuestion = { ...attemptAt(1), total_questions: 1 };
    vi.mocked(attemptsApi.start).mockResolvedValue(onlyQuestion);
    vi.mocked(attemptsApi.current).mockResolvedValue(onlyQuestion);
    vi.mocked(attemptsApi.answer).mockResolvedValue({ ...ATTEMPT_COMPLETED, attempt_id: 31 });
    vi.mocked(resultsApi.get).mockResolvedValue(RESULT_DETAIL);
    vi.mocked(resultsApi.getReport).mockResolvedValue(REPORT_READY);
    vi.mocked(profileApi.skillHistory).mockResolvedValue(SKILL_HISTORY);
    signInAs('self-test');
    start('/tests/202');

    await click('button', 'Start test');
    await userEvent.click(await screen.findByRole('radio', { name: 'Hyper Text Markup Language' }));
    await click('button', 'Submit test');

    expect(await heading('Your results are ready.')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'CareerLine AI Skill Report' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download your report' })).toBeInTheDocument();
  });

  it('a beginner answers the questionnaire and opens a matched programme', async () => {
    vi.mocked(beginnerApi.getIntake).mockResolvedValue(QUESTIONNAIRE);
    vi.mocked(beginnerApi.submitIntake).mockResolvedValue(PATH);
    vi.mocked(beginnerApi.getRecommendations).mockResolvedValue(PATH);
    vi.mocked(programmesApi.get).mockResolvedValue(PROGRAMME);
    vi.mocked(profileApi.get).mockResolvedValue(PROFILE);
    signInAs('beginner');
    start('/assessment');

    for (let step = 0; step < QUESTIONNAIRE.questions.length; step += 1) {
      const choices = await screen
        .findAllByRole('radio')
        .catch(() => screen.findAllByRole('checkbox'));
      await userEvent.click(choices[0]);
      const isLast = step === QUESTIONNAIRE.questions.length - 1;
      await click('button', isLast ? 'Generate Result' : 'Next');
    }

    await userEvent.click((await screen.findAllByRole('link', { name: 'View programme' }))[0]);

    expect(await screen.findByRole('heading', { name: PROGRAMME.name })).toBeInTheDocument();
  });

  it('a recruiter sends a test and reads the candidate report', async () => {
    vi.mocked(paymentsApi.credits).mockResolvedValue(CREDITS);
    vi.mocked(catalogApi.listTests).mockResolvedValue([...TESTS.items]);
    vi.mocked(recruiterApi.listCandidates).mockResolvedValue([...CANDIDATES]);
    vi.mocked(recruiterApi.addCandidate).mockResolvedValue(
      candidate(603, { full_name: 'Chidi Eze', email: 'chidi@example.com' }),
    );
    vi.mocked(invitationsApi.list).mockResolvedValue([...INVITATIONS]);
    vi.mocked(invitationsApi.send).mockResolvedValue(
      invitation(3, { full_name: 'Chidi Eze', email: 'chidi@example.com' }),
    );
    vi.mocked(recruiterApi.getCandidate).mockResolvedValue(CANDIDATES[0]);
    vi.mocked(recruiterApi.getReport).mockResolvedValue(CANDIDATE_REPORT);
    signInAs('recruiter');
    start('/candidates');

    await userEvent.type(await screen.findByLabelText('Full name'), 'Chidi Eze');
    await userEvent.type(screen.getByLabelText('Email'), 'chidi@example.com');
    await userEvent.selectOptions(screen.getByLabelText('Test'), 'Backend Development');
    await click('button', 'Send test');
    expect(await screen.findByText('Test sent to Chidi Eze.')).toBeInTheDocument();

    await click('link', 'View report');

    expect(await heading('Ada Obi')).toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'Recommendation' })).getByText(
        CANDIDATE_REPORT.summary,
      ),
    ).toBeInTheDocument();
  });

  it('an organisation starts an audit, follows it and opens an employee report', async () => {
    vi.mocked(organisationsApi.me).mockResolvedValue(ORGANISATION);
    vi.mocked(organisationsApi.listAudits).mockResolvedValue([...AUDITS]);
    vi.mocked(organisationsApi.listMembers).mockResolvedValue([...MEMBERS]);
    vi.mocked(organisationsApi.startAudit).mockResolvedValue(AUDIT);
    vi.mocked(organisationsApi.getAudit).mockResolvedValue(AUDIT);
    vi.mocked(organisationsApi.heatmap).mockResolvedValue(HEATMAP);
    vi.mocked(organisationsApi.getTargets).mockResolvedValue(TARGETS);
    vi.mocked(rolesApi.get).mockResolvedValue(roleWithSkills(1));
    vi.mocked(programmesApi.listForRole).mockResolvedValue([PROGRAMME]);
    signInAs('organization');
    start('/team');

    await click('link', 'Start an audit');
    await userEvent.type(await screen.findByLabelText('Audit name'), 'Q4 engineering audit');
    await click('button', /^Send invitations/);
    expect(await heading('Q4 engineering audit')).toBeInTheDocument();

    await click('link', 'Back to team audits');
    await click('link', 'See the heatmap');
    await click('link', 'Ada Obi');

    expect(await heading('Ada Obi')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Skills against standards' })).toBeInTheDocument();
  });
});
