import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AUDIENCES } from '../content/audiences';
import { AudiencePage } from './AudiencePage';

const setup = (key: (typeof AUDIENCES)[number]['key']) =>
  render(
    <MemoryRouter>
      <AudiencePage audience={key} />
    </MemoryRouter>,
  );

describe('AudiencePage', () => {
  it.each(AUDIENCES)('explains what $title get and how it works', (audience) => {
    setup(audience.key);

    expect(screen.getByRole('heading', { level: 1, name: audience.title })).toBeInTheDocument();
    expect(screen.getByText(audience.intro)).toBeInTheDocument();
    expect(
      within(screen.getByRole('region', { name: 'What you get' })).getAllByRole('listitem'),
    ).toHaveLength(audience.benefits.length);
    expect(
      within(screen.getByRole('region', { name: 'How it works' })).getAllByRole('listitem'),
    ).toHaveLength(audience.steps.length);
  });

  it.each(AUDIENCES)('leads $title to the next step', (audience) => {
    setup(audience.key);

    expect(screen.getByRole('link', { name: audience.action.label })).toHaveAttribute(
      'href',
      audience.action.to,
    );
    if (audience.secondary) {
      expect(screen.getByRole('link', { name: audience.secondary.label })).toHaveAttribute(
        'href',
        audience.secondary.to,
      );
    }
  });

  it('always says the scores support decisions rather than make them', () => {
    setup('recruiters');

    expect(screen.getByText(/Decision support only/)).toBeInTheDocument();
  });
});
