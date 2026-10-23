import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AssessmentProcessing } from './AssessmentProcessing';

const setup = (delayMs: number) =>
  render(
    <MemoryRouter initialEntries={['/assessment/processing']}>
      <Routes>
        <Route path="/assessment/processing" element={<AssessmentProcessing delayMs={delayMs} />} />
        <Route path="/assessment/results" element={<p>Results page</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe('AssessmentProcessing', () => {
  it('tells people their answers are being matched', () => {
    setup(60_000);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Matching your answers to real career paths.',
    );
  });

  it('explains what is happening', () => {
    setup(60_000);

    expect(
      screen.getByText(
        'This usually takes a few seconds. CareerLine AI is comparing your responses against the profiles of people who have thrived on each path.',
      ),
    ).toBeInTheDocument();
  });

  it('stays on the matching screen until the wait is over', () => {
    setup(60_000);

    expect(screen.queryByText('Results page')).not.toBeInTheDocument();
  });

  it('moves on to the results when the wait is over', async () => {
    setup(0);

    expect(await screen.findByText('Results page')).toBeInTheDocument();
  });
});
