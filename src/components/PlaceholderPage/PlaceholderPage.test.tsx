import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PlaceholderPage } from './PlaceholderPage';

const setup = () =>
  render(
    <MemoryRouter>
      <PlaceholderPage title="Pricing" description="Plans for individuals, recruiters and teams." />
    </MemoryRouter>,
  );

describe('PlaceholderPage', () => {
  it('shows the page title as the main heading', () => {
    setup();

    expect(screen.getByRole('heading', { level: 1, name: 'Pricing' })).toBeInTheDocument();
  });

  it('shows the description', () => {
    setup();

    expect(screen.getByText('Plans for individuals, recruiters and teams.')).toBeInTheDocument();
  });

  it('says the page is coming soon', () => {
    setup();

    expect(screen.getByText('Coming soon')).toBeInTheDocument();
  });

  it('links back to the homepage', () => {
    setup();

    expect(screen.getByRole('link', { name: 'Go to homepage' })).toHaveAttribute('href', '/');
  });
});
