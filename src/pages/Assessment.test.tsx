import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beginnerApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { QUESTIONNAIRE } from '../test/fixtures/beginner';
import { Assessment } from './Assessment';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  beginnerApi: { getIntake: vi.fn(), submitIntake: vi.fn(), getRecommendations: vi.fn() },
}));

const Processing = () => {
  const { state } = useLocation() as { state: { submission: unknown } };
  return <pre data-testid="submission">{JSON.stringify(state.submission)}</pre>;
};

const setup = () =>
  render(
    <MemoryRouter initialEntries={['/assessment']}>
      <Routes>
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/assessment/processing" element={<Processing />} />
      </Routes>
    </MemoryRouter>,
  );

const ready = () =>
  screen.findByRole('heading', { level: 2, name: QUESTIONNAIRE.questions[0].text });
const choices = () => [...screen.queryAllByRole('radio'), ...screen.queryAllByRole('checkbox')];
const answerFirstOption = () => userEvent.click(choices()[0]);
const next = () => userEvent.click(screen.getByRole('button', { name: 'Next' }));
const steps = () => within(screen.getByRole('navigation', { name: 'Assessment steps' }));

beforeEach(() => {
  vi.mocked(beginnerApi.getIntake).mockResolvedValue(QUESTIONNAIRE);
});

describe('Assessment', () => {
  it('shows a loader while the questions arrive', () => {
    vi.mocked(beginnerApi.getIntake).mockReturnValue(new Promise(() => undefined));

    setup();

    expect(screen.getByRole('status')).toHaveTextContent('Loading your questions');
  });

  it('says what went wrong and tries again on request', async () => {
    vi.mocked(beginnerApi.getIntake)
      .mockRejectedValueOnce(
        new ApiError({ status: 0, code: 'network', message: 'No connection.' }),
      )
      .mockResolvedValue(QUESTIONNAIRE);
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await ready()).toBeInTheDocument();
  });

  it('has a main heading, the beginner banner and the honesty tip', async () => {
    setup();
    await ready();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Career assessment' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveTextContent('Beginner path');
    expect(screen.getByText('Tip: Be honest for best results')).toBeInTheDocument();
  });

  it('centres the assessment vertically', async () => {
    setup();
    await ready();

    expect(screen.getByRole('main')).toHaveClass('flex-1', 'items-center', 'justify-center');
  });

  it('starts on the first question', async () => {
    setup();

    expect(await ready()).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: `Question 1 of ${QUESTIONNAIRE.questions.length}` }),
    ).toBeInTheDocument();
  });

  it('builds the steps from the sections the API sent', async () => {
    setup();
    await ready();

    expect(
      steps()
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['Personality', 'Time', 'Finances']);
    expect(steps().getByText('Personality').closest('li')).toHaveAttribute('aria-current', 'step');
  });

  it('links back to the homepage', async () => {
    setup();
    await ready();

    expect(screen.getByRole('link', { name: 'Back To Homepage' })).toHaveAttribute('href', '/');
  });

  it('cannot move on until the question is answered', async () => {
    setup();
    await ready();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    await answerFirstOption();

    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('lets a multiple choice question take several answers', async () => {
    setup();
    await ready();
    await answerFirstOption();
    await next();

    await userEvent.click(screen.getByRole('checkbox', { name: 'Curious' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Creative' }));

    expect(screen.getByRole('checkbox', { name: 'Curious' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Creative' })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('moves the step along with the questions', async () => {
    setup();
    await ready();
    await answerFirstOption();
    await next();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Curious' }));
    await next();

    expect(steps().getByText('Time').closest('li')).toHaveAttribute('aria-current', 'step');
    expect(steps().getByText('Personality').closest('li')).toHaveAttribute(
      'data-status',
      'complete',
    );
  });

  it('has no Back button on the first question but a disabled one after', async () => {
    setup();
    await ready();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();

    await answerFirstOption();
    await next();

    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
  });

  it('offers Generate Result on the last question', async () => {
    setup();
    await ready();
    await userEvent.click(choices()[0]);
    await next();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Curious' }));
    await next();
    await answerFirstOption();
    await next();

    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generate Result' })).toBeDisabled();
  });

  it('hands the answers to the matching screen', async () => {
    setup();
    await ready();
    await answerFirstOption();
    await next();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Curious' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Creative' }));
    await next();
    await answerFirstOption();
    await next();
    await answerFirstOption();

    await userEvent.click(screen.getByRole('button', { name: 'Generate Result' }));

    expect(JSON.parse(screen.getByTestId('submission').textContent ?? '')).toEqual({
      version: '2026-10',
      answers: [
        { question_id: 'free_hour', values: ['hands'] },
        { question_id: 'traits', values: ['curious', 'creative'] },
        { question_id: 'hours', values: ['5'] },
        { question_id: 'budget', values: ['free'] },
      ],
    });
  });
});
