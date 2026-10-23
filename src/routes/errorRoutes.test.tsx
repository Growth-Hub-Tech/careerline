import { render, screen } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { getRoutes } from './index';

const Routes = () => useRoutes(getRoutes());

const renderAt = (address: string) =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes />
    </MemoryRouter>,
  );

describe('error routes', () => {
  it('serves the no access page at /no-access', () => {
    renderAt('/no-access');

    expect(
      screen.getByRole('heading', { level: 1, name: "You don't have access to this page" }),
    ).toBeInTheDocument();
  });

  it('shows the not found page for an unknown address', () => {
    renderAt('/nothing-lives-here');

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  });

  it('shows the not found page for an unknown nested address', () => {
    renderAt('/reports/abc/unknown/deeper');

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  });
});
