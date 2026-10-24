import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import type { UserType } from '../lib/session';
import { signInAs } from '../test/session';
import { getRoutes } from './index';

const Routes = () => useRoutes(getRoutes());

const renderAt = (address: string) =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes />
    </MemoryRouter>,
  );

const menu = () => within(screen.getByRole('navigation', { name: 'Main' }));

const MENUS: readonly [UserType, string, string][] = [
  ['beginner', 'Assessment', 'Candidates'],
  ['self-test', 'Skill tests', 'Team'],
  ['recruiter', 'Candidates', 'Skill tests'],
  ['organization', 'Team', 'Candidates'],
];

describe('session routes', () => {
  it('sends a signed-out visitor from the dashboard to sign in', () => {
    renderAt('/dashboard');

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome Back' })).toBeInTheDocument();
  });

  it('keeps a signed-out visitor out of every app page', () => {
    renderAt('/candidates');

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome Back' })).toBeInTheDocument();
  });

  it.each(MENUS)('shows %s its own menu', (userType, shown, hidden) => {
    signInAs(userType);

    renderAt('/dashboard');

    expect(menu().getByRole('link', { name: shown })).toBeInTheDocument();
    expect(menu().queryByRole('link', { name: hidden })).not.toBeInTheDocument();
  });

  it('shows the signed-in role in the header', () => {
    signInAs('recruiter');

    renderAt('/dashboard');

    expect(screen.getByText('Recruiter')).toBeInTheDocument();
  });

  it.each([
    ['beginner', '/candidates'],
    ['recruiter', '/team/heatmap'],
    ['organization', '/tests'],
    ['self-test', '/assessment'],
  ] as const)('sends %s away from %s', (userType, address) => {
    signInAs(userType);

    renderAt(address);

    expect(
      screen.getByRole('heading', { level: 1, name: "You don't have access to this page" }),
    ).toBeInTheDocument();
  });

  it('puts a self-test inside the full-screen frame', () => {
    signInAs('self-test');

    renderAt('/tests/abc');

    expect(screen.getByRole('heading', { level: 1, name: 'Skill test' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Exit test' })).toBeInTheDocument();
  });
});
