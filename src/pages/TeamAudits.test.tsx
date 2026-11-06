import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { organisationsApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { AUDITS, ORGANISATION } from '../test/fixtures/organisation';
import { TeamAudits } from './TeamAudits';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  organisationsApi: { me: vi.fn(), listAudits: vi.fn() },
}));

const setup = () =>
  render(
    <MemoryRouter>
      <TeamAudits />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.mocked(organisationsApi.me).mockResolvedValue(ORGANISATION);
  vi.mocked(organisationsApi.listAudits).mockResolvedValue([...AUDITS]);
});

describe('TeamAudits', () => {
  it('shows a loader while the audits arrive', () => {
    vi.mocked(organisationsApi.listAudits).mockReturnValue(new Promise(() => undefined));
    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows the seat balance with a way to buy more', async () => {
    setup();

    const seats = await screen.findByRole('region', { name: 'Seats' });
    expect(seats).toHaveTextContent('8 of 50 seats used');
    expect(seats).toHaveTextContent('Seats are sold in blocks of at least 50.');
    expect(within(seats).getByRole('link', { name: 'Buy seats' })).toHaveAttribute(
      'href',
      '/pricing?return=%2Fteam',
    );
  });

  it('links to the staff list upload', async () => {
    setup();

    expect(await screen.findByRole('link', { name: 'Upload staff list' })).toHaveAttribute(
      'href',
      '/team/import',
    );
  });

  it('lists the audits with their progress', async () => {
    setup();

    const table = await screen.findByRole('table', { name: 'Audits' });
    const [row] = within(table).getAllByRole('row').slice(1);
    expect(within(row).getByRole('link', { name: 'Q4 engineering audit' })).toHaveAttribute(
      'href',
      '/team/audits/3',
    );
    expect(row).toHaveTextContent('In progress');
    expect(row).toHaveTextContent('3 of 8 finished');
  });

  it('says when there are no audits yet', async () => {
    vi.mocked(organisationsApi.listAudits).mockResolvedValue([]);
    setup();

    expect(await screen.findByText('No audits yet.')).toBeInTheDocument();
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(organisationsApi.me)
      .mockRejectedValueOnce(new ApiError({ status: 0, message: 'No connection.' }))
      .mockResolvedValue(ORGANISATION);
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('table', { name: 'Audits' })).toBeInTheDocument();
  });
});
