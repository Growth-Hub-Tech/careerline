import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { organisationsApi } from '../lib/api';
import { AUDIT, MEMBERS, ORGANISATION } from '../test/fixtures/organisation';
import { AuditProgress } from './AuditProgress';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  organisationsApi: { me: vi.fn(), getAudit: vi.fn(), listMembers: vi.fn(), startAudit: vi.fn() },
}));

const setup = () =>
  render(
    <MemoryRouter initialEntries={['/team/audits/3']}>
      <Routes>
        <Route path="/team/audits/:auditId" element={<AuditProgress />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.mocked(organisationsApi.me).mockResolvedValue(ORGANISATION);
  vi.mocked(organisationsApi.listMembers).mockResolvedValue([...MEMBERS]);
});

describe('AuditProgress re-test', () => {
  it('offers no re-test while the audit is still running', async () => {
    vi.mocked(organisationsApi.getAudit).mockResolvedValue(AUDIT);
    setup();

    await screen.findByRole('heading', { level: 1 });

    expect(screen.queryByRole('button', { name: 'Request a re-test' })).not.toBeInTheDocument();
  });

  it('starts a re-test of the same roles once the audit is complete', async () => {
    vi.mocked(organisationsApi.getAudit)
      .mockResolvedValueOnce({ ...AUDIT, status: 'completed' })
      .mockResolvedValue({ ...AUDIT, audit_id: 4, name: 'Q4 engineering audit (re-test)' });
    vi.mocked(organisationsApi.startAudit).mockResolvedValue({
      ...AUDIT,
      audit_id: 4,
      name: 'Q4 engineering audit (re-test)',
    });
    setup();

    await userEvent.click(await screen.findByRole('button', { name: 'Request a re-test' }));

    expect(organisationsApi.startAudit).toHaveBeenCalledWith(41, {
      name: 'Q4 engineering audit (re-test)',
      role_ids: [1, 2],
      send_invitations: true,
    });
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Q4 engineering audit (re-test)' }),
    ).toBeInTheDocument();
  });
});
