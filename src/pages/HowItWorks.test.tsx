import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HowItWorks } from './HowItWorks';

const setup = () =>
  render(
    <MemoryRouter>
      <HowItWorks />
    </MemoryRouter>,
  );

describe('HowItWorks', () => {
  it('has a main heading', () => {
    setup();

    expect(screen.getByRole('heading', { level: 1, name: 'How it works' })).toBeInTheDocument();
  });

  it.each([
    ['Beginners', '/for-individuals'],
    ['Professionals', '/for-individuals'],
    ['Recruiters', '/for-recruiters'],
    ['Organizations', '/for-organizations'],
  ])('walks %s through their steps', (group, path) => {
    setup();

    const section = screen.getByRole('region', { name: group });
    expect(section.querySelectorAll('li').length).toBeGreaterThanOrEqual(3);
    expect(section.querySelector(`a[href="${path}"]`)).not.toBeNull();
  });

  it('explains where the scores come from', () => {
    setup();

    expect(screen.getByRole('region', { name: 'One engine underneath' })).toHaveTextContent(
      'adaptive',
    );
  });
});
