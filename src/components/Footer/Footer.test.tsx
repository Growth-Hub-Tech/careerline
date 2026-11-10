import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from './Footer';

describe('Footer', () => {
  it.each([
    ['Pricing', '/pricing'],
    ['How It Works', '/how-it-works'],
    ['Help Center', '/help'],
    ['Privacy', '/privacy'],
    ['Terms', '/terms'],
    ['Contact', '/contact'],
  ])('links %s to %s', (name, href) => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
  });

  it.each([
    ['For Individuals', '/for-individuals'],
    ['For Organizations', '/for-organizations'],
    ['For Recruiters', '/for-recruiters'],
  ])('links the %s group to its page', (name, href) => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
  });
});
