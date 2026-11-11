import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AssessmentStart } from './AssessmentStart';

const setup = () =>
  render(
    <MemoryRouter initialEntries={['/assessment/start']}>
      <Routes>
        <Route path="/assessment/start" element={<AssessmentStart />} />
        <Route path="/assessment" element={<h1>Questionnaire</h1>} />
      </Routes>
    </MemoryRouter>,
  );

describe('AssessmentStart', () => {
  it('explains what the test covers', () => {
    setup();

    expect(screen.getByRole('heading', { level: 1, name: 'Start your test' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Your test is a series of questions about your personality, future goals, time availability and financial capacity.',
      ),
    ).toBeInTheDocument();
  });

  it('opens the questionnaire', async () => {
    setup();

    await userEvent.click(screen.getByRole('button', { name: 'Start Test' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Questionnaire' })).toBeInTheDocument();
  });

  it('leads back to the dashboard', () => {
    setup();

    expect(screen.getByRole('link', { name: 'Go to my Dashboard' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });
});
