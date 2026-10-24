import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { ROLES } from '../components/Auth';
import { USER_TYPE_LABELS } from '../lib/session';
import { getRoutes } from './index';

const Routes = () => useRoutes(getRoutes());

const chooseRole = async (title: string) => {
  render(
    <MemoryRouter initialEntries={['/get-started']}>
      <Routes />
    </MemoryRouter>,
  );

  await userEvent.click(screen.getByRole('radio', { name: new RegExp(title) }));
  await userEvent.click(screen.getByRole('button', { name: 'Continue' }));
};

describe('role picker routing', () => {
  it.each(ROLES)('takes someone who picks "$title" to their dashboard', async (role) => {
    await chooseRole(role.title);

    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByText(USER_TYPE_LABELS[role.key])).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Welcome Back' })).not.toBeInTheDocument();
  });
});
