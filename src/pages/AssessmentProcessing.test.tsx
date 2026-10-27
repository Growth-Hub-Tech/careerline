import { render, screen } from '@testing-library/react';
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

const setup = (state: unknown = { submission: submission() }) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/assessment/processing', state }]}>
      <Routes>
        <Route path="/assessment/processing" element={<AssessmentProcessing />} />
        <Route path="/assessment/results" element={<Results />} />
        <Route path="/assessment" element={<p>Assessment page</p>} />
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
});
