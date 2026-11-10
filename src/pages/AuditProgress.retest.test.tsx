import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { organisationsApi, type AuditDeltas } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { AUDIT, MEMBERS, ORGANISATION } from '../test/fixtures/organisation';
import { AuditProgress } from './AuditProgress';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  organisationsApi: {
    me: vi.fn(),
    getAudit: vi.fn(),
    listMembers: vi.fn(),
    retestAudit: vi.fn(),
    auditDeltas: vi.fn(),
  },
}));

const RETEST = {
  ...AUDIT,
  audit_id: 4,
  name: 'Q4 engineering audit (re-test)',
  baseline_audit_id: 3,
};

const DELTAS: AuditDeltas = {
  audit_id: 4,
  baseline_audit_id: 3,
  items: [
    {
      member_id: 11,
      full_name: 'Ada Obi',
      role_id: 1,
      skill_id: 1,
      skill_name: 'Frontend Web Development',
      before_score: 55,
      before_level: 'JUNIOR',
      after_score: 67.4,
      after_level: 'MID',
      score_delta: 12.4,
    },
    {
      member_id: 12,
      full_name: 'Bola Ade',
      role_id: 1,
      skill_id: 1,
      skill_name: 'Frontend Web Development',
      before_score: 70,
      before_level: 'MID',
      after_score: null,
      after_level: null,
      score_delta: null,
    },
  ],
};

const setup = (path = '/team/audits/3') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/team/audits/:auditId" element={<AuditProgress />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.mocked(organisationsApi.me).mockResolvedValue(ORGANISATION);
  vi.mocked(organisationsApi.listMembers).mockResolvedValue([...MEMBERS]);
  vi.mocked(organisationsApi.auditDeltas).mockResolvedValue(DELTAS);
});

describe('AuditProgress re-test', () => {
  it('offers no re-test while the audit is still running', async () => {
    vi.mocked(organisationsApi.getAudit).mockResolvedValue(AUDIT);
    setup();

    await screen.findByRole('heading', { level: 1 });

    expect(screen.queryByRole('button', { name: 'Request a re-test' })).not.toBeInTheDocument();
    expect(organisationsApi.auditDeltas).not.toHaveBeenCalled();
  });

  it('re-tests the audit itself and opens the re-test', async () => {
    vi.mocked(organisationsApi.getAudit)
      .mockResolvedValueOnce({ ...AUDIT, status: 'completed' })
      .mockResolvedValue(RETEST);
    vi.mocked(organisationsApi.retestAudit).mockResolvedValue(RETEST);
    setup();

    await userEvent.click(await screen.findByRole('button', { name: 'Request a re-test' }));

    expect(organisationsApi.retestAudit).toHaveBeenCalledWith(41, 3);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Q4 engineering audit (re-test)' }),
    ).toBeInTheDocument();
  });

  it('shows when a re-test is too soon and lets the person try later', async () => {
    vi.mocked(organisationsApi.getAudit).mockResolvedValue({ ...AUDIT, status: 'completed' });
    vi.mocked(organisationsApi.retestAudit).mockRejectedValue(
      new ApiError({
        status: 409,
        code: 'retest_too_soon',
        message: 'Too soon to re-test this audit: try again on 24 Nov 2026',
      }),
    );
    setup();

    const button = await screen.findByRole('button', { name: 'Request a re-test' });
    await userEvent.click(button);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too soon to re-test this audit: try again on 24 Nov 2026',
    );
    expect(button).toBeEnabled();
  });

  it("shows each person's score before and after the re-test", async () => {
    vi.mocked(organisationsApi.getAudit).mockResolvedValue(RETEST);
    setup('/team/audits/4');

    const table = await screen.findByRole('table', { name: 'Change since the first audit' });
    const [, ada, bola] = within(table).getAllByRole('row');

    expect(organisationsApi.auditDeltas).toHaveBeenCalledWith(41, 4);
    expect(ada).toHaveTextContent('Ada Obi');
    expect(ada).toHaveTextContent('55%');
    expect(ada).toHaveTextContent('67%');
    expect(ada).toHaveTextContent('+12 points');
    // not finished yet: no after score and no change
    expect(within(bola).getAllByText('—')).toHaveLength(2);
  });

  it('keeps the rest of the audit when the changes cannot be loaded, and retries', async () => {
    vi.mocked(organisationsApi.getAudit).mockResolvedValue(RETEST);
    vi.mocked(organisationsApi.auditDeltas)
      .mockRejectedValueOnce(new ApiError({ status: 500, message: 'Server error' }))
      .mockResolvedValue(DELTAS);
    setup('/team/audits/4');

    await userEvent.click(await screen.findByRole('button', { name: 'Try again' }));

    expect(screen.getByRole('table', { name: 'People in this audit' })).toBeInTheDocument();
    expect(
      await screen.findByRole('table', { name: 'Change since the first audit' }),
    ).toBeInTheDocument();
  });
});
