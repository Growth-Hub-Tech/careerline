import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SAMPLE_QUESTIONS } from '../data/sampleQuestions';
import { Assessment } from './Assessment';

const setup = () =>
  render(
    <MemoryRouter initialEntries={['/assessment']}>
      <Routes>
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/assessment/results" element={<p>Results page</p>} />
      </Routes>
    </MemoryRouter>,
  );

const next = () => userEvent.click(screen.getByRole('button', { name: 'Next' }));
const answerFirstOption = () => userEvent.click(screen.getAllByRole('radio')[0]);

const goToLastQuestion = async () => {
  for (let i = 0; i < SAMPLE_QUESTIONS.length - 1; i += 1) {
    await answerFirstOption();
    await next();
  }
};

const steps = () => within(screen.getByRole('navigation', { name: 'Assessment steps' }));

describe('Assessment', () => {
  it('has a main heading for the page', () => {
    setup();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Career assessment' }),
    ).toBeInTheDocument();
  });

  it('starts on the first question', () => {
    setup();

    expect(
      screen.getByRole('heading', { level: 2, name: SAMPLE_QUESTIONS[0].text }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: `Question 1 of ${SAMPLE_QUESTIONS.length}` }),
    ).toBeInTheDocument();
  });

  it('links back to the homepage', () => {
    setup();

    expect(screen.getByRole('link', { name: 'Back to Homepage' })).toHaveAttribute('href', '/');
  });

  it('cannot move on until the question is answered', async () => {
    setup();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    await answerFirstOption();

    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('moves to the next question and its step', async () => {
    setup();
    await answerFirstOption();
    await next();

    expect(
      screen.getByRole('heading', { level: 2, name: SAMPLE_QUESTIONS[1].text }),
    ).toBeInTheDocument();
    expect(steps().getByText('Goals').closest('li')).toHaveAttribute('aria-current', 'step');
    expect(steps().getByText('Personality').closest('li')).toHaveAttribute(
      'data-status',
      'complete',
    );
  });

  it('has no Back button on the first question but does on later ones', async () => {
    setup();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();

    await answerFirstOption();
    await next();

    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  it('keeps an earlier answer when going back', async () => {
    setup();
    const firstAnswer = SAMPLE_QUESTIONS[0].options[2].label;
    await userEvent.click(screen.getByRole('radio', { name: firstAnswer }));
    await next();

    await userEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(screen.getByRole('radio', { name: firstAnswer })).toBeChecked();
  });

  it('asks for an answer again on a question that was not answered', async () => {
    setup();
    await answerFirstOption();
    await next();

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('offers See my results on the last question', async () => {
    setup();
    await goToLastQuestion();

    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'See my results' })).toBeDisabled();
  });

  it('goes to the results page after the last answer', async () => {
    setup();
    await goToLastQuestion();
    await answerFirstOption();

    await userEvent.click(screen.getByRole('button', { name: 'See my results' }));

    expect(screen.getByText('Results page')).toBeInTheDocument();
  });
});
