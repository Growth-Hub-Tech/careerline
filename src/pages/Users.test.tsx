import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { accountsApi, organisationsApi, type OrganisationUser } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { account } from '../test/fixtures/account';
import { Users } from './Users';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  accountsApi: { me: vi.fn() },
  organisationsApi: {
    listUsers: vi.fn(),
    addUser: vi.fn(),
    changeRole: vi.fn(),
    removeUser: vi.fn(),
  },
}));

const user = (id: number, name: string, role: OrganisationUser['role']): OrganisationUser => ({
  learner_id: id,
  full_name: name,
  email: `${name.split(' ')[0].toLowerCase()}@kora.example`,
  role,
  added_at: '2026-10-01T09:00:00Z',
});

const USERS = [user(1, 'Ngozi Okafor', 'owner'), user(2, 'Bayo Ade', 'recruiter')];

const setup = () =>
  render(
    <MemoryRouter>
      <Users />
    </MemoryRouter>,
  );

const table = () => screen.findByRole('table', { name: 'People with access' });

beforeEach(() => {
  vi.mocked(accountsApi.me).mockResolvedValue(
    account({
      account_type: 'organisation_admin',
      organisation_id: 41,
      organisation_role: 'owner',
    }),
  );
  vi.mocked(organisationsApi.listUsers).mockResolvedValue({ items: [...USERS], total: 2 });
  vi.mocked(organisationsApi.addUser).mockResolvedValue(user(3, 'Chidi Eze', 'admin'));
  vi.mocked(organisationsApi.changeRole).mockResolvedValue(user(2, 'Bayo Ade', 'admin'));
  vi.mocked(organisationsApi.removeUser).mockResolvedValue({ status: 'accepted' });
});

describe('Users', () => {
  it('shows a loader while the people arrive', () => {
    vi.mocked(organisationsApi.listUsers).mockReturnValue(new Promise(() => undefined));
    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('lists everyone with access and their role', async () => {
    setup();

    const rows = within(await table())
      .getAllByRole('row')
      .slice(1);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Ngozi Okafor');
    expect(screen.getByLabelText('Role for Bayo Ade')).toHaveValue('recruiter');
    expect(organisationsApi.listUsers).toHaveBeenCalledWith(41);
  });

  it('adds someone who already has an account', async () => {
    setup();

    await userEvent.type(await screen.findByLabelText('Email'), 'chidi@kora.example');
    await userEvent.selectOptions(screen.getByLabelText('Role'), 'admin');
    await userEvent.click(screen.getByRole('button', { name: 'Add person' }));

    expect(organisationsApi.addUser).toHaveBeenCalledWith(41, 'chidi@kora.example', 'admin');
    expect(
      await screen.findByText('Chidi Eze can now sign in to this organisation.'),
    ).toBeInTheDocument();
    expect(within(await table()).getAllByRole('row')).toHaveLength(4);
  });

  it('explains that people must sign up first', async () => {
    vi.mocked(organisationsApi.addUser).mockRejectedValue(
      new ApiError({ status: 404, code: 'not_found', message: 'Not found.' }),
    );
    setup();

    await userEvent.type(await screen.findByLabelText('Email'), 'new@kora.example');
    await userEvent.click(screen.getByRole('button', { name: 'Add person' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'There is no account with that email. Ask them to sign up first, then add them.',
    );
  });

  it('changes a role straight away', async () => {
    setup();

    await userEvent.selectOptions(await screen.findByLabelText('Role for Bayo Ade'), 'admin');

    expect(organisationsApi.changeRole).toHaveBeenCalledWith(41, 2, 'admin');
    expect(await screen.findByText('Bayo Ade is now an admin.')).toBeInTheDocument();
  });

  it('keeps the old role and says why a change failed', async () => {
    vi.mocked(organisationsApi.changeRole).mockRejectedValue(
      new ApiError({ status: 409, code: 'conflict', message: 'The last owner cannot be changed.' }),
    );
    setup();

    await userEvent.selectOptions(await screen.findByLabelText('Role for Ngozi Okafor'), 'admin');

    expect(await screen.findByRole('alert')).toHaveTextContent('The last owner cannot be changed.');
    expect(screen.getByLabelText('Role for Ngozi Okafor')).toHaveValue('owner');
  });

  it('removes someone after asking first', async () => {
    setup();

    await userEvent.click(await screen.findByRole('button', { name: 'Remove Bayo Ade' }));
    const dialog = screen.getByRole('dialog', { name: 'Remove Bayo Ade?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Remove' }));

    expect(organisationsApi.removeUser).toHaveBeenCalledWith(41, 2);
    expect(within(await table()).getAllByRole('row')).toHaveLength(2);
  });

  it('lets a recruiter see the list but not change it', async () => {
    vi.mocked(accountsApi.me).mockResolvedValue(
      account({ organisation_id: 41, organisation_role: 'recruiter' }),
    );
    setup();

    await table();

    expect(
      screen.getByText('Only owners and admins can change who has access.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add person' })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Role for Bayo Ade')).not.toBeInTheDocument();
  });

  it('says when the account is not part of an organisation', async () => {
    vi.mocked(accountsApi.me).mockResolvedValue(account());
    setup();

    expect(
      await screen.findByText('Your account is not part of an organisation yet.'),
    ).toBeInTheDocument();
    expect(organisationsApi.listUsers).not.toHaveBeenCalled();
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(organisationsApi.listUsers)
      .mockRejectedValueOnce(new ApiError({ status: 0, message: 'No connection.' }))
      .mockResolvedValue({ items: [...USERS], total: 2 });
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await table()).toBeInTheDocument();
  });
});
