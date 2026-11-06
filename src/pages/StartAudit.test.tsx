import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { organisationsApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { AUDIT, MEMBERS, member, ORGANISATION } from '../test/fixtures/organisation';
import { StartAudit } from './StartAudit';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  organisationsApi: { me: vi.fn(), listMembers: vi.fn(), startAudit: vi.fn() },
}));

const setup = () =>
  render(
    <MemoryRouter initialEntries={['/team/audits/new']}>
      <Routes>
        <Route path="/team/audits/new" element={<StartAudit />} />
        <Route path="/team/audits/:auditId" element={<h1>Audit progress page</h1>} />
      </Routes>
    </MemoryRouter>,
  );

const send = () => screen.findByRole('button', { name: /^Send invitations/ });

beforeEach(() => {
  vi.mocked(organisationsApi.me).mockResolvedValue(ORGANISATION);
  vi.mocked(organisationsApi.listMembers).mockResolvedValue([...MEMBERS]);
  vi.mocked(organisationsApi.startAudit).mockResolvedValue(AUDIT);
});

describe('StartAudit', () => {
  it('offers each role on the staff list with how many people hold it', async () => {
    setup();

    expect(
      await screen.findByRole('checkbox', { name: 'Frontend Developer (2 people)' }),
    ).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Backend Developer (1 person)' })).toBeChecked();
  });

  it('starts the audit and sends the invitations', async () => {
    setup();

    await userEvent.type(await screen.findByLabelText('Audit name'), 'Q4 engineering audit');
    await userEvent.click(screen.getByRole('checkbox', { name: 'Backend Developer (1 person)' }));
    await userEvent.click(await send());

    expect(organisationsApi.startAudit).toHaveBeenCalledWith(41, {
      name: 'Q4 engineering audit',
      role_ids: [1],
      send_invitations: true,
    });
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Audit progress page' }),
    ).toBeInTheDocument();
  });

  it('counts the people who will be invited', async () => {
    setup();

    expect(await send()).toHaveAccessibleName('Send invitations to 3 people');
  });

  it('needs a name and at least one role', async () => {
    setup();

    await userEvent.click(await screen.findByRole('checkbox', { name: /Frontend/ }));
    await userEvent.click(screen.getByRole('checkbox', { name: /Backend/ }));

    expect(await send()).toBeDisabled();
    await userEvent.type(screen.getByLabelText('Audit name'), 'Q4');
    expect(await send()).toBeDisabled();
  });

  it('blocks sending when there are not enough seats', async () => {
    vi.mocked(organisationsApi.listMembers).mockResolvedValue(
      Array.from({ length: 51 }, (_, index) => member(index + 1)),
    );
    setup();

    await userEvent.type(await screen.findByLabelText('Audit name'), 'Big audit');

    expect(await send()).toBeDisabled();
    expect(screen.getByText('You need 51 seats but have 50.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Buy seats' })).toHaveAttribute(
      'href',
      '/pricing?return=%2Fteam%2Faudits%2Fnew',
    );
  });

  it('asks for a staff list first when there is none', async () => {
    vi.mocked(organisationsApi.listMembers).mockResolvedValue([]);
    setup();

    expect(
      await screen.findByText('Upload your staff list before you start an audit.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Upload staff list' })).toHaveAttribute(
      'href',
      '/team/import',
    );
  });

  it('says why the audit could not start', async () => {
    vi.mocked(organisationsApi.startAudit).mockRejectedValue(
      new ApiError({ status: 402, code: 'payment_required', message: 'Not enough seats.' }),
    );
    setup();

    await userEvent.type(await screen.findByLabelText('Audit name'), 'Q4');
    await userEvent.click(await send());

    expect(await screen.findByRole('alert')).toHaveTextContent('Not enough seats.');
  });
});
