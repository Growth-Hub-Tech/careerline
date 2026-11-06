import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { attemptsApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { reviewOf } from '../test/fixtures/results';
import { AttemptReview } from './AttemptReview';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  attemptsApi: { review: vi.fn() },
}));

const setup = (address = '/attempts/12/review') =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes>
        <Route path="/attempts/:attemptId/review" element={<AttemptReview pollInterval={5} />} />
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
    </MemoryRouter>,
  );

const questions = async () =>
  screen.findAllByRole('article').then((items) => items.map((item) => within(item)));

beforeEach(() => {
  vi.mocked(attemptsApi.review).mockResolvedValue(reviewOf());
});

describe('AttemptReview', () => {
  it('shows a loader while the review arrives', () => {
    vi.mocked(attemptsApi.review).mockReturnValue(new Promise(() => undefined));
    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(attemptsApi.review).toHaveBeenCalledWith(12);
  });

  it('goes through the test question by question with the score', async () => {
    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Review your answers' }),
    ).toBeInTheDocument();
    expect(screen.getByText('1 of 2 right')).toBeInTheDocument();
    const [first, second] = await questions();
    expect(
      first.getByRole('heading', { name: 'Question 1: What does HTML stand for?' }),
    ).toBeInTheDocument();
    expect(first.getByText('Wrong')).toBeInTheDocument();
    expect(second.getByText('Right')).toBeInTheDocument();
  });

  it('marks your answer and the right answer in words, not colour alone', async () => {
    setup();

    const [first] = await questions();
    expect(first.getByText('Hyper Transfer Markup Language').closest('li')).toHaveTextContent(
      'Your answer',
    );
    expect(first.getByText('Hyper Text Markup Language').closest('li')).toHaveTextContent(
      'Right answer',
    );
  });

  it('explains each answer', async () => {
    setup();

    const [first] = await questions();
    expect(first.getByText('HTML stands for Hyper Text Markup Language.')).toBeInTheDocument();
  });

  it('waits while the explanations are being written, then shows them', async () => {
    vi.mocked(attemptsApi.review)
      .mockResolvedValueOnce(reviewOf('generating'))
      .mockResolvedValue(reviewOf('ready'));
    setup();

    expect(await screen.findByText(/Writing fuller explanations/)).toBeInTheDocument();
    expect(await screen.findByText(/Explained by CareerLine AI/)).toBeInTheDocument();
    expect(screen.queryByText(/Writing fuller explanations/)).not.toBeInTheDocument();
  });

  it('says the test must be finished first', async () => {
    vi.mocked(attemptsApi.review).mockRejectedValue(
      new ApiError({ status: 409, code: 'attempt_not_finished', message: 'Not finished.' }),
    );
    setup();

    expect(
      await screen.findByText('You can review your answers once the test is finished.'),
    ).toBeInTheDocument();
  });

  it('shows page not found for an unknown test', async () => {
    vi.mocked(attemptsApi.review).mockRejectedValue(
      new ApiError({ status: 404, code: 'not_found', message: 'Not found.' }),
    );
    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeInTheDocument();
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(attemptsApi.review)
      .mockRejectedValueOnce(new ApiError({ status: 0, message: 'No connection.' }))
      .mockResolvedValue(reviewOf());
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await questions()).toHaveLength(2);
  });
});
