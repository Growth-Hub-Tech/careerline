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

describe('route map', () => {
  beforeEach(() => signInAs());

  it.each([
    ['/how-it-works', 'How it works'],
    ['/for-individuals', 'For individuals'],
    ['/for-organizations', 'For organizations'],
    ['/for-recruiters', 'For recruiters'],
    ['/help', 'Help Center'],
    ['/privacy', 'Privacy policy'],
    ['/terms', 'Terms of service'],
  ])('serves %s as a real page', (path, title) => {
    renderAt(path);

    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(screen.queryByText('Coming soon')).not.toBeInTheDocument();
  });

  it('shows the marketing footer on public pages only', () => {
    const { unmount } = renderAt('/how-it-works');
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
