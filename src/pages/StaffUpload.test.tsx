import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { organisationsApi, rolesApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { ORGANISATION, ROLES } from '../test/fixtures/organisation';
import { StaffUpload } from './StaffUpload';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  organisationsApi: { me: vi.fn(), uploadRoster: vi.fn() },
  rolesApi: { list: vi.fn() },
}));

const GOOD = `full_name,email,department,role
Ada Obi,ada@kora.example,Engineering,Frontend Developer
Kemi Ade,kemi@kora.example,,Backend Developer`;

const BAD = `full_name,email,department,role
Ada Obi,ada@kora.example,Engineering,Frontend Developer
,broken,,Chef`;

const setup = () =>
  render(
    <MemoryRouter>
      <StaffUpload />
    </MemoryRouter>,
  );

const choose = async (text: string) =>
  userEvent.upload(
    await screen.findByLabelText('Staff list (CSV file)'),
    new File([text], 'staff.csv', { type: 'text/csv' }),
  );

beforeEach(() => {
  vi.mocked(organisationsApi.me).mockResolvedValue(ORGANISATION);
  vi.mocked(rolesApi.list).mockResolvedValue([...ROLES]);
  vi.mocked(organisationsApi.uploadRoster).mockResolvedValue({
    added: 1,
    updated: 1,
    members_total: 9,
  });
});

describe('StaffUpload', () => {
  it('offers the template to download', async () => {
    setup();

    const link = await screen.findByRole('link', { name: 'Download the template' });
    expect(link).toHaveAttribute('download', 'staff-list-template.csv');
    expect(decodeURIComponent(link.getAttribute('href') ?? '')).toContain(
      'full_name,email,department,role',
    );
  });

  it('previews a good file and uploads it', async () => {
    setup();

    await choose(GOOD);

    const rows = within(await screen.findByRole('table', { name: 'Staff list preview' }))
      .getAllByRole('row')
      .slice(1);
    expect(rows).toHaveLength(2);
    expect(screen.getByText('2 people ready to upload.')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Upload 2 people' }));

    expect(organisationsApi.uploadRoster).toHaveBeenCalledWith(41, [
      { full_name: 'Ada Obi', email: 'ada@kora.example', department: 'Engineering', role_id: 1 },
      { full_name: 'Kemi Ade', email: 'kemi@kora.example', department: null, role_id: 2 },
    ]);
    expect(
      await screen.findByText('Added 1 and updated 1. Your team now has 9 people.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to team audits' })).toHaveAttribute(
      'href',
      '/team',
    );
  });

  it('shows the problems in each row and blocks the upload', async () => {
    setup();

    await choose(BAD);

    const rows = within(await screen.findByRole('table', { name: 'Staff list preview' }))
      .getAllByRole('row')
      .slice(1);
    expect(rows[1]).toHaveTextContent('Name is missing');
    expect(rows[1]).toHaveTextContent('Email is not valid');
    expect(rows[1]).toHaveTextContent('Role "Chef" is not one of our roles');
    expect(screen.getByRole('alert')).toHaveTextContent(
      '1 row needs fixing before you can upload.',
    );
    expect(screen.queryByRole('button', { name: /^Upload/ })).not.toBeInTheDocument();
  });

  it('says when the columns are wrong', async () => {
    setup();

    await choose('name,mail\nA,b');

    expect(await screen.findByRole('alert')).toHaveTextContent('The first row must be');
  });

  it('says why the upload failed', async () => {
    vi.mocked(organisationsApi.uploadRoster).mockRejectedValue(
      new ApiError({ status: 402, code: 'payment_required', message: 'Not enough seats.' }),
    );
    setup();

    await choose(GOOD);
    await userEvent.click(await screen.findByRole('button', { name: 'Upload 2 people' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Not enough seats.');
  });
});
