import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { ROLES } from '../components/Auth';
import { getRoutes } from './index';

const Routes = () => useRoutes(getRoutes());

const chooseRole = async (title: RegExp) => {
  render(
    <MemoryRouter initialEntries={['/get-started']}>
      <Routes />
    </MemoryRouter>,
  );

  await userEvent.click(screen.getByRole('radio', { name: title }));
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
};

describe('role picker routing', () => {
  it('sends the beginner role to the dashboard', async () => {
    await chooseRole(/Discover your career path/);

    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Welcome Back' })).not.toBeInTheDocument();
  });

  it('keeps the other roles on sign-in until their areas exist', () => {
    const others = ROLES.filter((role) => role.key !== 'beginner');

    expect(others.map((role) => role.nextPath)).toEqual(others.map(() => '/sign-in'));
  });
});
