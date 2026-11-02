import { render, screen } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { getRoutes } from './index';
import { signInAs } from '../test/session';
import { accessFor } from './access';
import { APP_PLACEHOLDERS, PUBLIC_PLACEHOLDERS } from './routeMap';

const Routes = () => useRoutes(getRoutes());

const renderAt = (address: string) =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes />
    </MemoryRouter>,
  );

const withExampleParams = (path: string) => path.replace(/:[^/]+/g, 'example');

const PLACEHOLDERS = [...PUBLIC_PLACEHOLDERS, ...APP_PLACEHOLDERS];

describe('route map', () => {
  beforeEach(() => signInAs());

  it('has no duplicate addresses', () => {
    const paths = PLACEHOLDERS.map(({ path }) => path);

    expect(new Set(paths).size).toBe(paths.length);
  });

  it('only uses absolute addresses', () => {
    PLACEHOLDERS.forEach(({ path }) => expect(path.startsWith('/')).toBe(true));
  });

  it.each(PLACEHOLDERS)('serves $path with a placeholder page', ({ path, title, description }) => {
    signInAs(accessFor(path)[0]);
    renderAt(withExampleParams(path));

    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
  });

  it('shows the marketing footer on public pages only', () => {
    const { unmount } = renderAt('/pricing');
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    unmount();

    renderAt('/dashboard');
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
  });

  it('still serves the contact page', () => {
    renderAt('/contact');

    expect(screen.getByRole('heading', { level: 1, name: 'Contact us' })).toBeInTheDocument();
  });

  it('still serves the sign-in page', () => {
    renderAt('/sign-in');

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome Back' })).toBeInTheDocument();
  });

  it('shows the not found page for an unknown address', () => {
    renderAt('/definitely-not-a-page');

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  });
});
