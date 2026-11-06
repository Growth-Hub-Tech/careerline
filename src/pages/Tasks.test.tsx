import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beginnerApi, invitationsApi, organisationsApi, resultsApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { SessionProvider } from '../lib/session';
import { PATH } from '../test/fixtures/beginner';
import { AUDITS, MEMBERS, ORGANISATION } from '../test/fixtures/organisation';
import { INVITATIONS } from '../test/fixtures/recruiter';
import { RESULT_SUMMARIES } from '../test/fixtures/results';
import { signInAs } from '../test/session';
import { Tasks } from './Tasks';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  beginnerApi: { getRecommendations: vi.fn() },
  resultsApi: { list: vi.fn() },
  invitationsApi: { list: vi.fn() },
  organisationsApi: { me: vi.fn(), listAudits: vi.fn(), listMembers: vi.fn() },
}));

const setup = () =>
  render(
    <MemoryRouter>
      <SessionProvider>
        <Tasks />
      </SessionProvider>
    </MemoryRouter>,
  );

const tasks = async () =>
  within(await screen.findByRole('list', { name: 'Your tasks' })).getAllByRole('listitem');

const notFound = () => new ApiError({ status: 404, code: 'not_found', message: 'Not found.' });

beforeEach(() => {
  vi.mocked(beginnerApi.getRecommendations).mockResolvedValue(PATH);
  vi.mocked(resultsApi.list).mockResolvedValue([...RESULT_SUMMARIES]);
  vi.mocked(invitationsApi.list).mockResolvedValue([...INVITATIONS]);
  vi.mocked(organisationsApi.me).mockResolvedValue(ORGANISATION);
  vi.mocked(organisationsApi.listAudits).mockResolvedValue([...AUDITS]);
  vi.mocked(organisationsApi.listMembers).mockResolvedValue([...MEMBERS]);
});

describe('Tasks', () => {
  it('shows a loader while the tasks are worked out', () => {
    signInAs('self-test');
    vi.mocked(resultsApi.list).mockReturnValue(new Promise(() => undefined));
    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('sends a beginner to the questionnaire first', async () => {
    signInAs('beginner');
    vi.mocked(beginnerApi.getRecommendations).mockRejectedValue(notFound());
    setup();

    const [task] = await tasks();
    expect(task).toHaveTextContent('Answer the career questionnaire');
    expect(within(task).getByRole('link', { name: 'Start the questionnaire' })).toHaveAttribute(
      'href',
      '/assessment',
    );
  });

  it('points a beginner with paths to the results and the top programme', async () => {
    signInAs('beginner');
    setup();

    const items = await tasks();
    expect(items[0]).toHaveTextContent('Read why each career path fits you.');
    expect(within(items[1]).getByRole('link', { name: 'View programme' })).toHaveAttribute(
      'href',
      `/programmes/${PATH.recommendations[0].programme?.programme_id}`,
    );
  });

  it('suggests a first test to a professional with no results', async () => {
    signInAs('self-test');
    vi.mocked(resultsApi.list).mockResolvedValue([]);
    setup();

    const [task] = await tasks();
    expect(within(task).getByRole('link', { name: 'Choose a test' })).toHaveAttribute(
      'href',
      '/tests',
    );
  });

  it('points a professional to the latest report and a retake', async () => {
    signInAs('self-test');
    setup();

    const [report, retest] = await tasks();
    expect(report).toHaveTextContent('Frontend Web Development report');
    expect(within(report).getByRole('link')).toHaveAttribute('href', '/reports/32');
    expect(within(retest).getByRole('link')).toHaveAttribute('href', '/tests/201');
  });

  it('shows a recruiter the reports to read and the tests still out', async () => {
    signInAs('recruiter');
    setup();

    const [read, waiting] = await tasks();
    expect(read).toHaveTextContent('Read Ada Obi’s Frontend Web Development report.');
    expect(within(read).getByRole('link')).toHaveAttribute('href', '/candidates/601');
    expect(waiting).toHaveTextContent('Waiting for Tunde Bello to finish');
  });

  it('shows an organisation its running audits and who is not invited', async () => {
    signInAs('organization');
    setup();

    const [audit, invite] = await tasks();
    expect(audit).toHaveTextContent('Q4 engineering audit: 3 of 8 finished.');
    expect(invite).toHaveTextContent('1 person has not been invited to a test yet.');
    expect(within(invite).getByRole('link')).toHaveAttribute('href', '/team/audits/new');
  });

  it('says when there is nothing to do', async () => {
    signInAs('organization');
    vi.mocked(organisationsApi.listAudits).mockResolvedValue([]);
    vi.mocked(organisationsApi.listMembers).mockResolvedValue([
      { ...MEMBERS[0], status: 'completed' },
    ]);
    setup();

    expect(await screen.findByText('Nothing to do right now.')).toBeInTheDocument();
  });

  it('shows what went wrong and tries again on request', async () => {
    signInAs('self-test');
    vi.mocked(resultsApi.list)
      .mockRejectedValueOnce(new ApiError({ status: 0, message: 'No connection.' }))
      .mockResolvedValue([]);
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await tasks()).toHaveLength(1);
  });
});
