import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { catalogApi, invitationsApi, paymentsApi, recruiterApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { CREDITS } from '../test/fixtures/payments';
import { CANDIDATES, candidate, INVITATIONS, invitation } from '../test/fixtures/recruiter';
import { TESTS } from '../test/fixtures/tests';
import { Candidates } from './Candidates';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  recruiterApi: { listCandidates: vi.fn(), addCandidate: vi.fn() },
  invitationsApi: { list: vi.fn(), send: vi.fn(), revoke: vi.fn() },
  catalogApi: { listTests: vi.fn() },
  paymentsApi: { credits: vi.fn() },
}));

const setup = () =>
  render(
    <MemoryRouter>
      <Candidates />
    </MemoryRouter>,
  );

const sentTable = () => screen.findByRole('table', { name: 'Tests sent' });

const fillForm = async (name = 'Chidi Eze', email = 'chidi@example.com') => {
  await userEvent.type(await screen.findByLabelText('Full name'), name);
  await userEvent.type(screen.getByLabelText('Email'), email);
  await userEvent.selectOptions(screen.getByLabelText('Test'), 'Backend Development');
  await userEvent.selectOptions(screen.getByLabelText('Link works for'), '14');
};

beforeEach(() => {
  vi.mocked(recruiterApi.listCandidates).mockResolvedValue([...CANDIDATES]);
  vi.mocked(invitationsApi.list).mockResolvedValue([...INVITATIONS]);
  vi.mocked(catalogApi.listTests).mockResolvedValue([...TESTS.items]);
  vi.mocked(paymentsApi.credits).mockResolvedValue(CREDITS);
  vi.mocked(recruiterApi.addCandidate).mockResolvedValue(
    candidate(603, { full_name: 'Chidi Eze', email: 'chidi@example.com' }),
  );
  vi.mocked(invitationsApi.send).mockResolvedValue(
    invitation(3, { full_name: 'Chidi Eze', email: 'chidi@example.com', candidate_id: 603 }),
  );
});

describe('Candidates', () => {
  it('shows a loader while the candidates arrive', () => {
    vi.mocked(invitationsApi.list).mockReturnValue(new Promise(() => undefined));
    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows the credit balance with a way to buy more', async () => {
    setup();

    const credits = await screen.findByRole('region', { name: 'Your credits' });
    expect(credits).toHaveTextContent('You have 3 credits');
    expect(within(credits).getByRole('link', { name: 'Buy credits' })).toHaveAttribute(
      'href',
      '/pricing?return=%2Fcandidates',
    );
  });

  it('lists every test sent with its status', async () => {
    setup();

    const rows = within(await sentTable())
      .getAllByRole('row')
      .slice(1);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Ada Obi');
    expect(rows[0]).toHaveTextContent('Frontend Web Development');
    expect(rows[0]).toHaveTextContent('Completed');
    expect(rows[1]).toHaveTextContent('Tunde Bello');
    expect(rows[1]).toHaveTextContent('Sent');
  });

  it('links a finished test to the candidate report', async () => {
    setup();

    const [finished] = within(await sentTable())
      .getAllByRole('row')
      .slice(1);
    expect(within(finished).getByRole('link', { name: 'View report' })).toHaveAttribute(
      'href',
      '/candidates/601',
    );
  });

  it('filters the tests sent by status', async () => {
    setup();

    await sentTable();
    await userEvent.selectOptions(screen.getByLabelText('Show'), 'sent');

    const rows = within(await sentTable())
      .getAllByRole('row')
      .slice(1);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent('Tunde Bello');
  });

  it('says when no test has been sent yet', async () => {
    vi.mocked(invitationsApi.list).mockResolvedValue([]);
    setup();

    expect(await screen.findByText('No tests sent yet.')).toBeInTheDocument();
  });

  it('cancels a test after asking first', async () => {
    vi.mocked(invitationsApi.revoke).mockResolvedValue(
      invitation(2, { full_name: 'Tunde Bello', status: 'revoked' }),
    );
    setup();

    const rows = within(await sentTable())
      .getAllByRole('row')
      .slice(1);
    expect(within(rows[0]).queryByRole('button', { name: 'Cancel test' })).not.toBeInTheDocument();
    await userEvent.click(within(rows[1]).getByRole('button', { name: 'Cancel test' }));

    const dialog = screen.getByRole('dialog', { name: 'Cancel this test?' });
    expect(dialog).toHaveTextContent('Tunde Bello');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel test' }));

    expect(invitationsApi.revoke).toHaveBeenCalledWith(2);
    await waitFor(() =>
      expect(within(screen.getByRole('table')).getAllByRole('row')[2]).toHaveTextContent(
        'Cancelled',
      ),
    );
  });

  it('asks for a name, a valid email and a test', async () => {
    setup();

    await userEvent.click(await screen.findByRole('button', { name: 'Send test' }));

    expect(await screen.findByText('Enter the candidate’s name')).toBeInTheDocument();
    expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Pick the test to send')).toBeInTheDocument();
    expect(recruiterApi.addCandidate).not.toHaveBeenCalled();
  });

  it('adds the candidate and sends them the test', async () => {
    setup();

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Send test' }));

    expect(recruiterApi.addCandidate).toHaveBeenCalledWith({
      full_name: 'Chidi Eze',
      email: 'chidi@example.com',
      role_id: 102,
    });
    expect(invitationsApi.send).toHaveBeenCalledWith({
      kind: 'candidate',
      full_name: 'Chidi Eze',
      email: 'chidi@example.com',
      test_id: 202,
      candidate_id: 603,
      expires_in_days: 14,
    });
    expect(await screen.findByText('Test sent to Chidi Eze.')).toBeInTheDocument();
    expect(within(await sentTable()).getAllByRole('row')).toHaveLength(4);
  });

  it('sends a new test to someone already on the shortlist', async () => {
    setup();

    await fillForm('Tunde Bello', 'tunde@example.com');
    await userEvent.click(screen.getByRole('button', { name: 'Send test' }));

    await screen.findByText('Test sent to Tunde Bello.');
    expect(recruiterApi.addCandidate).not.toHaveBeenCalled();
    expect(invitationsApi.send).toHaveBeenCalledWith(
      expect.objectContaining({ candidate_id: 602 }),
    );
  });

  it('says why the test could not be sent', async () => {
    vi.mocked(invitationsApi.send).mockRejectedValue(
      new ApiError({ status: 402, code: 'payment_required', message: 'Not enough credits.' }),
    );
    setup();

    await fillForm();
    await userEvent.click(screen.getByRole('button', { name: 'Send test' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Not enough credits.');
  });

  it('stops adding people once the shortlist holds 25 candidates', async () => {
    vi.mocked(recruiterApi.listCandidates).mockResolvedValue(
      Array.from({ length: 25 }, (_, index) => candidate(700 + index)),
    );
    setup();

    expect(
      await screen.findByText('Your shortlist is full. It holds up to 25 candidates.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send test' })).toBeDisabled();
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(invitationsApi.list)
      .mockRejectedValueOnce(new ApiError({ status: 0, message: 'No connection.' }))
      .mockResolvedValue([...INVITATIONS]);
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await sentTable()).toBeInTheDocument();
  });
});
