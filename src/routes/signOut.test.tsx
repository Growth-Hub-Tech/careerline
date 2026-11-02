import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { readSession } from '../lib/session';
import { signInAs } from '../test/session';
import { getRoutes } from './index';

const Routes = () => useRoutes(getRoutes());

const setup = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes />
    </MemoryRouter>,
  );

describe('signing out', () => {
  it('forgets the session and goes to the sign-in page', async () => {
    signInAs('recruiter');
    setup();

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome Back' })).toBeInTheDocument();
    expect(readSession()).toBeNull();
  });

  it('keeps the app closed afterwards', async () => {
    signInAs('beginner');
    setup();

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
  });
});
