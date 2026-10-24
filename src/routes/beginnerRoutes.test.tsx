import { render, screen } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { getRoutes } from './index';
import { signInAs } from '../test/session';

const Routes = () => useRoutes(getRoutes());

const renderAt = (address: string) =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes />
    </MemoryRouter>,
  );

const shellNav = () => screen.queryByRole('navigation', { name: 'Main' });

describe('beginner flow routes', () => {
  beforeEach(() => signInAs());

  it('serves the matching screen outside the app shell', () => {
    renderAt('/assessment/processing');

    expect(screen.getByRole('status')).toHaveTextContent('Matching your answers');
    expect(shellNav()).not.toBeInTheDocument();
  });

  it('serves the results outside the app shell', () => {
    renderAt('/assessment/results');

    expect(screen.getByRole('heading', { level: 1, name: /Congratulations/ })).toBeInTheDocument();
    expect(shellNav()).not.toBeInTheDocument();
  });

  it('serves a programme outside the app shell', () => {
    renderAt('/programmes/product-design');

    expect(screen.getByRole('heading', { level: 1, name: 'Product Design' })).toBeInTheDocument();
    expect(shellNav()).not.toBeInTheDocument();
  });

  it('shows the not found page for an unknown programme', () => {
    renderAt('/programmes/does-not-exist');

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  });
});
