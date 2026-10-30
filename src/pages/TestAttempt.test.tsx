import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { attemptsApi, resultsApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { readAttempt, saveAttempt } from '../lib/tests/attemptStore';
import type { AttemptAnswer } from '../lib/api';
import { ATTEMPT_IN_PROGRESS, STARTED_ATTEMPT, SUBMITTED_ATTEMPT } from '../test/fixtures/tests';
import { RESULT_SUMMARIES } from '../test/fixtures/results';
import { signInAs } from '../test/session';
import { TestAttempt } from './TestAttempt';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  attemptsApi: { get: vi.fn(), submit: vi.fn() },
  resultsApi: { list: vi.fn() },
}));

const save = (answers: readonly AttemptAnswer[] = []) =>
  saveAttempt({ testId: 202, title: 'Backend Development', attempt: STARTED_ATTEMPT, answers });

const setup = () =>
  render(
    <MemoryRouter initialEntries={['/tests/202/attempt']}>
      <Routes>
        <Route path="/tests/:testId/attempt" element={<TestAttempt />} />
        <Route path="/tests/:testId" element={<h1>Test page</h1>} />
        <Route path="/reports/:reportId" element={<h1>Report page</h1>} />
      </Routes>
    </MemoryRouter>,
  );

const progress = () => screen.findByRole('progressbar');

const answer = async (option: string, button = 'Next') => {
  await userEvent.click(await screen.findByRole('radio', { name: option }));
  await userEvent.click(screen.getByRole('button', { name: button }));
};

beforeEach(() => {
  signInAs('self-test');
  save();
  vi.mocked(attemptsApi.get).mockResolvedValue(ATTEMPT_IN_PROGRESS);
  vi.mocked(attemptsApi.submit).mockResolvedValue(SUBMITTED_ATTEMPT);
  vi.mocked(resultsApi.list).mockResolvedValue([]);
});

describe('TestAttempt', () => {
  it('goes back to the test page when nothing has been started', () => {
    window.localStorage.clear();
    signInAs('self-test');

    setup();

    expect(screen.getByRole('heading', { level: 1, name: 'Test page' })).toBeInTheDocument();
  });

  it('shows a loader while it checks the attempt', () => {
    vi.mocked(attemptsApi.get).mockReturnValue(new Promise(() => undefined));

    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('checks the attempt that was started', async () => {
    setup();

    await progress();

    expect(attemptsApi.get).toHaveBeenCalledWith(12);
  });

  it('shows one question at a time with its number', async () => {
    setup();

    expect(await progress()).toHaveAccessibleName('Question 1 of 3');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Backend Development Skill Test' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'What does HTML stand for?' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });

  it('waits for an answer before moving on', async () => {
    setup();

    expect(await screen.findByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('moves to the next question and remembers the answer', async () => {
    setup();

    await answer('Hyper Text Markup Language');

    expect(await progress()).toHaveAccessibleName('Question 2 of 3');
    expect(readAttempt(202)?.answers).toEqual([{ question_id: 1, selected_option_id: 1 }]);
  });

  it('shows the same question after a refresh', async () => {
    save([{ question_id: 1, selected_option_id: 1 }]);

    setup();

    expect(await progress()).toHaveAccessibleName('Question 2 of 3');
    expect(
      screen.getByRole('heading', { level: 2, name: /change the text color/ }),
    ).toBeInTheDocument();
  });

  it('never offers to go back', async () => {
    save([{ question_id: 1, selected_option_id: 1 }]);

    setup();

    await progress();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });

  it('moves on only one question when Next is clicked twice', async () => {
    setup();

    await userEvent.click(await screen.findByRole('radio', { name: 'Hyper Text Markup Language' }));
    await userEvent.dblClick(screen.getByRole('button', { name: 'Next' }));

    expect(await progress()).toHaveAccessibleName('Question 2 of 3');
  });

  it('submits every answer in order on the last question', async () => {
    setup();

    await answer('Hyper Text Markup Language');
    await answer('color');
    await answer('number', 'Submit test');

    expect(attemptsApi.submit).toHaveBeenCalledWith({
      attempt_id: 12,
      answers: [
        { question_id: 1, selected_option_id: 1 },
        { question_id: 6, selected_option_id: 22 },
        { question_id: 10, selected_option_id: 40 },
      ],
    });
  });

  it('shows the score and forgets the attempt once submitted', async () => {
    save([
      { question_id: 1, selected_option_id: 1 },
      { question_id: 6, selected_option_id: 22 },
    ]);
    setup();

    await answer('number', 'Submit test');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Test submitted' }),
    ).toBeInTheDocument();
    expect(screen.getByText('You scored 67%, with 2 of 3 answers correct.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to tests' })).toHaveAttribute('href', '/tests');
    expect(readAttempt(202)).toBeNull();
  });

  it('submits only once when Submit test is clicked twice', async () => {
    vi.mocked(attemptsApi.submit).mockReturnValue(new Promise(() => undefined));
    save([
      { question_id: 1, selected_option_id: 1 },
      { question_id: 6, selected_option_id: 22 },
    ]);
    setup();

    await userEvent.click(await screen.findByRole('radio', { name: 'number' }));
    await userEvent.dblClick(screen.getByRole('button', { name: 'Submit test' }));

    expect(attemptsApi.submit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled();
  });

  it('keeps the answers and lets the person try again when submitting fails', async () => {
    vi.mocked(attemptsApi.submit)
      .mockRejectedValueOnce(
        new ApiError({ status: 0, code: 'network', message: 'No connection.' }),
      )
      .mockResolvedValue(SUBMITTED_ATTEMPT);
    save([
      { question_id: 1, selected_option_id: 1 },
      { question_id: 6, selected_option_id: 22 },
    ]);
    setup();

    await answer('number', 'Submit test');

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    expect(readAttempt(202)?.answers).toHaveLength(2);

    await userEvent.click(screen.getByRole('button', { name: 'Submit test' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Test submitted' }),
    ).toBeInTheDocument();
  });

  it.each(['failed', 'passed', 'cancelled'])(
    'says the test has ended when the attempt is %s',
    async (status) => {
      vi.mocked(attemptsApi.get).mockResolvedValue({
        ...ATTEMPT_IN_PROGRESS,
        attempt_status: status,
      });

      setup();

      expect(
        await screen.findByRole('heading', { level: 1, name: 'This test has ended' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Back to the test' })).toHaveAttribute(
        'href',
        '/tests/202',
      );
      expect(readAttempt(202)).toBeNull();
    },
  );

  it('says the test has ended when the server no longer knows the attempt', async () => {
    vi.mocked(attemptsApi.get).mockRejectedValue(
      new ApiError({ status: 404, code: 'not_found', message: 'Not found.' }),
    );

    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'This test has ended' }),
    ).toBeInTheDocument();
  });

  it.each([
    [409, 'conflict'],
    [410, 'expired'],
  ])('says the test has ended when submitting answers %i', async (status, code) => {
    vi.mocked(attemptsApi.submit).mockRejectedValue(
      new ApiError({ status, code, message: 'Attempt 12 is already failed.' }),
    );
    save([
      { question_id: 1, selected_option_id: 1 },
      { question_id: 6, selected_option_id: 22 },
    ]);
    setup();

    await answer('number', 'Submit test');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'This test has ended' }),
    ).toBeInTheDocument();
    expect(readAttempt(202)).toBeNull();
  });

  it('shows what went wrong while checking and tries again on request', async () => {
    vi.mocked(attemptsApi.get)
      .mockRejectedValueOnce(
        new ApiError({ status: 0, code: 'network', message: 'No connection.' }),
      )
      .mockResolvedValue(ATTEMPT_IN_PROGRESS);

    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await progress()).toHaveAccessibleName('Question 1 of 3');
  });

  it('opens the result page once the result is listed', async () => {
    vi.mocked(resultsApi.list).mockResolvedValue([...RESULT_SUMMARIES]);
    save([
      { question_id: 1, selected_option_id: 1 },
      { question_id: 6, selected_option_id: 22 },
    ]);
    setup();

    await answer('number', 'Submit test');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Report page' }),
    ).toBeInTheDocument();
    expect(readAttempt(202)).toBeNull();
  });

  it('still shows the score when the result list cannot be read', async () => {
    vi.mocked(resultsApi.list).mockRejectedValue(
      new ApiError({ status: 0, code: 'network', message: 'No connection.' }),
    );
    save([
      { question_id: 1, selected_option_id: 1 },
      { question_id: 6, selected_option_id: 22 },
    ]);
    setup();

    await answer('number', 'Submit test');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Test submitted' }),
    ).toBeInTheDocument();
  });
});
