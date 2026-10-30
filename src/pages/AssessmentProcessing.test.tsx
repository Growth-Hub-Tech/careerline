import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beginnerApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { PATH } from '../test/fixtures/beginner';
import { AssessmentProcessing } from './AssessmentProcessing';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  beginnerApi: { getIntake: vi.fn(), submitIntake: vi.fn(), getRecommendations: vi.fn() },
}));

const submission = () => ({
  version: '2026-10',
  answers: [{ question_id: 'free_hour', values: ['hands'] }],
});

const Results = () => {
  const { state } = useLocation() as { state: { path: { intake_id: number } } };
  return <p>Results for intake {state.path.intake_id}</p>;
};

const Questions = () => {
  const { state } = useLocation() as { state: unknown };
  return (
    <>
      <p>Assessment page</p>
      <pre data-testid="returned">{JSON.stringify(state)}</pre>
    </>
  );
};

const setup = (state: unknown = { submission: submission() }, timeLimit?: number) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/assessment/processing', state }]}>
      <Routes>
        <Route
          path="/assessment/processing"
          element={<AssessmentProcessing timeLimit={timeLimit} />}
        />
        <Route path="/assessment/results" element={<Results />} />
        <Route path="/assessment" element={<Questions />} />
      </Routes>
    </MemoryRouter>,
  );

describe('AssessmentProcessing', () => {
  it('tells people their answers are being matched', () => {
    vi.mocked(beginnerApi.submitIntake).mockReturnValue(new Promise(() => undefined));

    setup();

    expect(screen.getByRole('status')).toHaveTextContent(
      'Matching your answers to real career paths.',
    );
    expect(
      screen.getByText(
        'This usually takes a few seconds. CareerLine AI is comparing your responses against the profiles of people who have thrived on each path.',
      ),
    ).toBeInTheDocument();
  });

  it('sends the answers and moves on to the results', async () => {
    vi.mocked(beginnerApi.submitIntake).mockResolvedValue(PATH);

    setup();

    expect(await screen.findByText('Results for intake 1')).toBeInTheDocument();
    expect(beginnerApi.submitIntake).toHaveBeenCalledWith(submission());
    expect(beginnerApi.submitIntake).toHaveBeenCalledTimes(1);
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(beginnerApi.submitIntake)
      .mockRejectedValueOnce(
        new ApiError({ status: 500, message: 'Something went wrong on our side.' }),
      )
      .mockResolvedValue(PATH);
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong on our side.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('Results for intake 1')).toBeInTheDocument();
    expect(beginnerApi.submitIntake).toHaveBeenCalledTimes(2);
  });

  it('sends people with no answers back to the assessment', () => {
    setup(null);

    expect(screen.getByText('Assessment page')).toBeInTheDocument();
    expect(beginnerApi.submitIntake).not.toHaveBeenCalled();
  });

  it('goes back to the questions the server says are wrong', async () => {
    vi.mocked(beginnerApi.submitIntake).mockRejectedValue(
      new ApiError({
        status: 422,
        code: 'validation_error',
        message: 'Request validation failed',
        fieldErrors: { 'answers.0.values': 'Choose one of the listed options.' },
      }),
    );

    setup();

    expect(await screen.findByText('Assessment page')).toBeInTheDocument();
    expect(JSON.parse(screen.getByTestId('returned').textContent ?? '')).toEqual({
      submission: submission(),
      flagged: { free_hour: 'Choose one of the listed options.' },
    });
  });

  it('lets people review their answers when the error is not about one question', async () => {
    vi.mocked(beginnerApi.submitIntake).mockRejectedValue(
      new ApiError({ status: 400, message: 'These answers are for an older questionnaire.' }),
    );
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'These answers are for an older questionnaire.',
    );
    await userEvent.click(screen.getByRole('link', { name: 'Review your answers' }));

    expect(JSON.parse(screen.getByTestId('returned').textContent ?? '')).toEqual({
      submission: submission(),
    });
  });

  describe('when the results take too long', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('says so once the time limit passes and sends the answers again on request', async () => {
      vi.mocked(beginnerApi.submitIntake)
        .mockReturnValueOnce(new Promise(() => undefined))
        .mockResolvedValue(PATH);
      setup(undefined, 30_000);

      await act(() => vi.advanceTimersByTimeAsync(29_000));
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      await act(() => vi.advanceTimersByTimeAsync(1_000));

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Preparing your results is taking longer than it should.',
      );
      await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

      expect(await screen.findByText('Results for intake 1')).toBeInTheDocument();
      expect(beginnerApi.submitIntake).toHaveBeenCalledTimes(2);
    });

    it('still moves on when the late answer arrives', async () => {
      let finish: (path: typeof PATH) => void = () => undefined;
      vi.mocked(beginnerApi.submitIntake).mockReturnValue(
        new Promise((resolve) => {
          finish = resolve;
        }),
      );
      setup(undefined, 30_000);

      await act(() => vi.advanceTimersByTimeAsync(30_000));
      expect(screen.getByRole('alert')).toBeInTheDocument();
      await act(async () => finish(PATH));

      expect(await screen.findByText('Results for intake 1')).toBeInTheDocument();
    });
  });
});
