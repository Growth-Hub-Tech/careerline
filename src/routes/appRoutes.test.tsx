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

const shellNav = () => screen.queryByRole('navigation', { name: 'Main' });

describe('app routes', () => {
  it('serves the dashboard inside the app shell', () => {
    renderAt('/dashboard');

    expect(shellNav()).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Welcome, Skye!' })).toBeInTheDocument();
  });

  it('serves other app addresses inside the app shell', () => {
    renderAt('/tasks');

    expect(shellNav()).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Tasks' })).toBeInTheDocument();
  });

  it.each(['/', '/pricing', '/sign-in', '/no-access', '/not-a-page', '/assessment'])(
    'keeps %s outside the app shell',
    (address) => {
      renderAt(address);

      expect(shellNav()).not.toBeInTheDocument();
    },
  );
});
