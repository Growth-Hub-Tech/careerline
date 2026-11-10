import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { organisationsApi, rolesApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { ORGANISATION, ROLES, roleWithSkills, TARGETS } from '../test/fixtures/organisation';
import { CompanyTargets } from './CompanyTargets';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  organisationsApi: { me: vi.fn(), getTargets: vi.fn(), setTargets: vi.fn() },
  rolesApi: { list: vi.fn(), get: vi.fn() },
}));

const setup = () =>
  render(
    <MemoryRouter>
      <CompanyTargets />
    </MemoryRouter>,
  );

const draftRows = () =>
  within(screen.getByRole('table', { name: 'Draft targets' }))
    .getAllByRole('row')
    .slice(1);

beforeEach(() => {
  vi.mocked(organisationsApi.me).mockResolvedValue(ORGANISATION);
  vi.mocked(organisationsApi.getTargets).mockResolvedValue(TARGETS);
  vi.mocked(organisationsApi.setTargets).mockImplementation(async (_id, items) => ({
    organisation_id: 41,
    items: items.map((item) => ({
      ...TARGETS.items[0],
      ...item,
      role_title: ROLES[item.role_id - 1].title,
      skill_name: `Skill ${item.skill_id}`,
    })),
  }));
  vi.mocked(rolesApi.list).mockResolvedValue([...ROLES]);
  vi.mocked(rolesApi.get).mockImplementation(async (roleId) => roleWithSkills(roleId));
});

describe('CompanyTargets', () => {
  it('lists the targets with how many people meet them', async () => {
    setup();

    const [row] = within(await screen.findByRole('table', { name: 'Targets' }))
      .getAllByRole('row')
      .slice(1);
    expect(row).toHaveTextContent('Frontend Developer');
    expect(row).toHaveTextContent('Frontend Web Development');
    expect(row).toHaveTextContent('Mid');
    expect(row).toHaveTextContent('1 of 3 people');
  });

  it('says when there are no targets yet', async () => {
    vi.mocked(organisationsApi.getTargets).mockResolvedValue({ organisation_id: 41, items: [] });
    setup();

    expect(await screen.findByText('No targets yet.')).toBeInTheDocument();
  });

  it('edits a draft and saves it only when approved', async () => {
    setup();

    await userEvent.click(await screen.findByRole('button', { name: 'Edit targets' }));
    await userEvent.selectOptions(
      screen.getByLabelText('Target level for Frontend Developer: Frontend Web Development'),
      'ADVANCED',
    );
    expect(organisationsApi.setTargets).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Approve and save' }));

    expect(organisationsApi.setTargets).toHaveBeenCalledWith(41, [
      { role_id: 1, skill_id: 1, target_level: 'ADVANCED', due_date: '2026-12-31' },
    ]);
    expect(await screen.findByRole('table', { name: 'Targets' })).toHaveTextContent('Advanced');
  });

  it('adds the suggested levels for a role to the draft', async () => {
    setup();

    await userEvent.click(await screen.findByRole('button', { name: 'Edit targets' }));
    await userEvent.selectOptions(screen.getByLabelText('Suggest targets for'), '2');
    await userEvent.click(screen.getByRole('button', { name: 'Add suggestions' }));

    expect(rolesApi.get).toHaveBeenCalledWith(2);
    expect(await screen.findAllByRole('row')).toHaveLength(4);
    expect(draftRows()[1]).toHaveTextContent('Backend Developer');
    expect(
      screen.getByLabelText('Target level for Backend Developer: Backend Development'),
    ).toHaveValue('MID');
  });

  it('removes a row from the draft', async () => {
    setup();

    await userEvent.click(await screen.findByRole('button', { name: 'Edit targets' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Frontend Developer: Frontend Web Development' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Approve and save' }));

    expect(organisationsApi.setTargets).toHaveBeenCalledWith(41, []);
  });

  it('throws the draft away on request', async () => {
    setup();

    await userEvent.click(await screen.findByRole('button', { name: 'Edit targets' }));
    await userEvent.click(screen.getByRole('button', { name: 'Discard draft' }));

    expect(await screen.findByRole('table', { name: 'Targets' })).toBeInTheDocument();
    expect(organisationsApi.setTargets).not.toHaveBeenCalled();
  });

  it('keeps the draft and says why saving failed', async () => {
    vi.mocked(organisationsApi.setTargets).mockRejectedValue(
      new ApiError({ status: 0, message: 'No connection.' }),
    );
    setup();

    await userEvent.click(await screen.findByRole('button', { name: 'Edit targets' }));
    await userEvent.click(screen.getByRole('button', { name: 'Approve and save' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    expect(screen.getByRole('table', { name: 'Draft targets' })).toBeInTheDocument();
  });
});
