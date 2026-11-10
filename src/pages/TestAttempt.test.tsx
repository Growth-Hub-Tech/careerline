import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { attemptsApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { readAttempt, saveAttempt } from '../lib/tests/attemptStore';
import { ATTEMPT_COMPLETED, ATTEMPT_EXPIRED, attemptAt } from '../test/fixtures/tests';
import { signInAs } from '../test/session';
import { TestAttempt } from './TestAttempt';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  attemptsApi: { current: vi.fn(), answer: vi.fn() },
}));

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
  saveAttempt({ testId: 202, title: 'Backend Development', attemptId: 12 });
  vi.mocked(attemptsApi.current).mockResolvedValue(attemptAt(1));
  vi.mocked(attemptsApi.answer).mockResolvedValue(attemptAt(2));
});

describe('TestAttempt', () => {
  it('goes back to the test page when nothing has been started', () => {
    window.localStorage.clear();
    signInAs('self-test');

    setup();

    expect(screen.getByRole('heading', { level: 1, name: 'Test page' })).toBeInTheDocument();
  });

  it('shows a loader while it finds where the test stands', () => {
    vi.mocked(attemptsApi.current).mockReturnValue(new Promise(() => undefined));

    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(attemptsApi.current).toHaveBeenCalledWith(12);
  });

  it('shows the question to answer now, with its number', async () => {
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

  it('picks up where the person left off', async () => {
    vi.mocked(attemptsApi.current).mockResolvedValue(attemptAt(2));

    setup();

    expect(await progress()).toHaveAccessibleName('Question 2 of 3');
  });

  it('shows how much time is left', async () => {
    setup();

    expect(await screen.findByRole('timer')).toHaveTextContent(/Time left 29:\d\d|30:00/);
  });

  it('waits for an answer before moving on', async () => {
    setup();

    expect(await screen.findByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('sends the answer and shows the next question', async () => {
    setup();

    await answer('Hyper Text Markup Language');

    expect(attemptsApi.answer).toHaveBeenCalledWith(12, { question_id: 1, selected_option_id: 1 });
    expect(await progress()).toHaveAccessibleName('Question 2 of 3');
    expect(
      screen.getByRole('heading', { level: 2, name: /change the text color/ }),
    ).toBeInTheDocument();
  });

  it('sends an answer only once when Next is clicked twice', async () => {
    vi.mocked(attemptsApi.answer).mockReturnValue(new Promise(() => undefined));
    setup();

    await userEvent.click(await screen.findByRole('radio', { name: 'Hyper Text Markup Language' }));
    await userEvent.dblClick(screen.getByRole('button', { name: 'Next' }));

    expect(attemptsApi.answer).toHaveBeenCalledTimes(1);
  });

  it('never offers to go back', async () => {
    setup();

    await progress();

    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });

  it('offers to submit on the last question', async () => {
    vi.mocked(attemptsApi.current).mockResolvedValue(attemptAt(3));

    setup();

    expect(await screen.findByRole('button', { name: 'Submit test' })).toBeInTheDocument();
  });

  it('opens the report when the test is finished', async () => {
    vi.mocked(attemptsApi.current).mockResolvedValue(attemptAt(3));
    vi.mocked(attemptsApi.answer).mockResolvedValue(ATTEMPT_COMPLETED);
    setup();

    await answer('number', 'Submit test');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Report page' }),
    ).toBeInTheDocument();
    expect(readAttempt(202)).toBeNull();
  });

  it('opens the report of a test that had already finished', async () => {
    vi.mocked(attemptsApi.current).mockResolvedValue(ATTEMPT_COMPLETED);

    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Report page' }),
    ).toBeInTheDocument();
  });

  it('says the time ran out when the test expired', async () => {
    vi.mocked(attemptsApi.current).mockResolvedValue(ATTEMPT_EXPIRED);

    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Your time ran out' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to the test' })).toHaveAttribute(
      'href',
      '/tests/202',
    );
    await waitFor(() => expect(readAttempt(202)).toBeNull());
  });

  it('checks where the test stands when the time is up', async () => {
    vi.mocked(attemptsApi.current)
      .mockResolvedValueOnce({ ...attemptAt(2), expires_at: '2026-01-01T00:00:00Z' })
      .mockResolvedValue(ATTEMPT_EXPIRED);

    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Your time ran out' }),
    ).toBeInTheDocument();
    expect(attemptsApi.current).toHaveBeenCalledTimes(2);
  });

  it('shows the right question when the answer was for an old one', async () => {
    vi.mocked(attemptsApi.answer).mockRejectedValue(
      new ApiError({ status: 409, code: 'not_current_question', message: 'Not current.' }),
    );
    vi.mocked(attemptsApi.current)
      .mockResolvedValueOnce(attemptAt(1))
      .mockResolvedValue(attemptAt(3));
    setup();

    await answer('Hyper Text Markup Language');

    expect(await screen.findByRole('progressbar', { name: 'Question 3 of 3' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('says the time ran out when an answer comes too late', async () => {
    vi.mocked(attemptsApi.answer).mockRejectedValue(
      new ApiError({ status: 410, code: 'expired', message: 'Time is up.' }),
    );
    vi.mocked(attemptsApi.current)
      .mockResolvedValueOnce(attemptAt(1))
      .mockResolvedValue(ATTEMPT_EXPIRED);
    setup();

    await answer('Hyper Text Markup Language');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Your time ran out' }),
    ).toBeInTheDocument();
  });

  it('keeps the question and says why the answer was not sent', async () => {
    vi.mocked(attemptsApi.answer)
      .mockRejectedValueOnce(new ApiError({ status: 0, message: 'No connection.' }))
      .mockResolvedValue(attemptAt(2));
    setup();

    await answer('Hyper Text Markup Language');

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    expect(await progress()).toHaveAccessibleName('Question 1 of 3');

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByRole('progressbar', { name: 'Question 2 of 3' })).toBeInTheDocument();
  });

  it('says the test has ended when it cannot be found', async () => {
    vi.mocked(attemptsApi.current).mockRejectedValue(
      new ApiError({ status: 404, code: 'not_found', message: 'Not found.' }),
    );

    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'This test has ended' }),
    ).toBeInTheDocument();
    await waitFor(() => expect(readAttempt(202)).toBeNull());
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(attemptsApi.current)
      .mockRejectedValueOnce(new ApiError({ status: 0, message: 'No connection.' }))
      .mockResolvedValue(attemptAt(1));
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await progress()).toHaveAccessibleName('Question 1 of 3');
  });
});
