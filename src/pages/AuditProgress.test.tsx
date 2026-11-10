import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { organisationsApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { AUDIT, MEMBERS, member, ORGANISATION } from '../test/fixtures/organisation';
import { AuditProgress } from './AuditProgress';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  organisationsApi: { me: vi.fn(), getAudit: vi.fn(), listMembers: vi.fn() },
}));

const setup = (address = '/team/audits/3') =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes>
        <Route path="/team/audits/:auditId" element={<AuditProgress />} />
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.mocked(organisationsApi.me).mockResolvedValue(ORGANISATION);
  vi.mocked(organisationsApi.getAudit).mockResolvedValue(AUDIT);
  vi.mocked(organisationsApi.listMembers).mockResolvedValue([
    ...MEMBERS,
    member(9, { full_name: 'Out of scope', role_id: 7, role_title: 'Designer' }),
  ]);
});

describe('AuditProgress', () => {
  it('shows a loader while the audit arrives', () => {
    vi.mocked(organisationsApi.getAudit).mockReturnValue(new Promise(() => undefined));
    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('names the audit and shows how far it has got', async () => {
    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Q4 engineering audit' }),
    ).toBeInTheDocument();
    expect(organisationsApi.getAudit).toHaveBeenCalledWith(41, 3);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
    expect(screen.getByText('3 of 8 finished')).toBeInTheDocument();
  });

  it('counts people by status', async () => {
    setup();

    const counts = await screen.findByRole('region', { name: 'Where people are' });
    expect(within(counts).getByText('Completed').nextSibling).toHaveTextContent('1');
    expect(within(counts).getByText('In progress').nextSibling).toHaveTextContent('1');
    expect(within(counts).getByText('Not invited').nextSibling).toHaveTextContent('1');
  });

  it('lists the people in the audit roles only', async () => {
    setup();

    const rows = within(await screen.findByRole('table', { name: 'People in this audit' }))
      .getAllByRole('row')
      .slice(1);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent('Ada Obi');
    expect(rows[0]).toHaveTextContent('Mid');
    expect(screen.queryByText('Out of scope')).not.toBeInTheDocument();
  });

  it('compares each role against its target and the industry', async () => {
    setup();

    const [row] = within(await screen.findByRole('table', { name: 'Benchmarks' }))
      .getAllByRole('row')
      .slice(1);
    expect(row).toHaveTextContent('Frontend Developer');
    expect(row).toHaveTextContent('Mid');
    expect(row).toHaveTextContent('65%');
    expect(row).toHaveTextContent('61%');
    expect(row).toHaveTextContent('2 of 3');
  });

  it('shows page not found for an unknown audit', async () => {
    vi.mocked(organisationsApi.getAudit).mockRejectedValue(
      new ApiError({ status: 404, code: 'not_found', message: 'Not found.' }),
    );
    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeInTheDocument();
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(organisationsApi.getAudit)
      .mockRejectedValueOnce(new ApiError({ status: 0, message: 'No connection.' }))
      .mockResolvedValue(AUDIT);
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'Q4 engineering audit',
    );
  });
});
