import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SAMPLE_PROGRAMMES } from '../data/sampleProgrammes';
import { Programme } from './Programme';

const programme = SAMPLE_PROGRAMMES[0];

const setup = (address = `/programmes/${programme.id}`) =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes>
        <Route path="/programmes/:programmeId" element={<Programme />} />
        <Route path="*" element={<p>Not found</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe('Programme', () => {
  it('shows the brand and the beginner path in the banner', () => {
    setup();

    expect(screen.getByRole('banner')).toHaveTextContent('CareerLine AI');
    expect(screen.getByRole('banner')).toHaveTextContent('Beginner path');
  });

  it('names the career path as the page heading', () => {
    setup();

    expect(
      screen.getByRole('heading', { level: 1, name: programme.careerTitle }),
    ).toBeInTheDocument();
    expect(screen.getByText(programme.tagline)).toBeInTheDocument();
  });

  it('shows the recommended programme', () => {
    setup();

    const card = screen.getByRole('region', { name: programme.programmeTitle });

    expect(within(card).getByText('Recommended programme')).toBeInTheDocument();
    expect(card).toHaveTextContent(programme.description);
    expect(
      within(card).getByRole('button', { name: 'View programme details' }),
    ).toBeInTheDocument();
  });

  it('explains why this programme', () => {
    setup();

    const panel = screen.getByRole('region', { name: 'Why this programme' });

    expect(within(panel).getAllByRole('listitem')).toHaveLength(programme.reasons.length);
    expect(panel).toHaveTextContent(programme.reasons[0]);
  });

  it('sends an unknown programme to the not found page', () => {
    setup('/programmes/does-not-exist');

    expect(screen.getByText('Not found')).toBeInTheDocument();
  });
});
