import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useRoutes } from 'react-router-dom';
import { ROLES } from '../components/Auth';
import { catalogApi } from '../lib/api';
import { USER_TYPE_LABELS, readRole, readSession, writeSession } from '../lib/session';
import { getRoutes } from './index';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  catalogApi: { listSkills: vi.fn(), listTests: vi.fn() },
}));

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

beforeEach(() => {
  vi.mocked(catalogApi.listSkills).mockReturnValue(new Promise(() => undefined));
  vi.mocked(catalogApi.listTests).mockReturnValue(new Promise(() => undefined));
});

describe('role picker routing', () => {
  it.each(ROLES)('takes someone who picks "$title" to their dashboard', async (role) => {
    await chooseRole(role.title);

    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByText(USER_TYPE_LABELS[role.key])).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Welcome Back' })).not.toBeInTheDocument();
  });

  it('keeps a real sign-in and only changes the user type', async () => {
    writeSession({
      token: 'real-token',
      user: { name: 'Ada Obi', email: 'ada@example.com', userType: 'beginner' },
    });

    await chooseRole('Validate talent');

    expect(screen.getByText('Recruiter')).toBeInTheDocument();
    expect(readRole('ada@example.com')).toBe('recruiter');
    expect(readSession()).toEqual({
      token: 'real-token',
      user: { name: 'Ada Obi', email: 'ada@example.com', userType: 'recruiter' },
    });
  });

  it('takes someone who picks "Test your skills" straight to the skill tests', async () => {
    await chooseRole('Test your skills');

    expect(screen.getByRole('link', { name: 'Skill tests' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
