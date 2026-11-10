import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { organisationsApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { AUDITS, HEATMAP, ORGANISATION } from '../test/fixtures/organisation';
import { TeamHeatmap } from './TeamHeatmap';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  organisationsApi: { me: vi.fn(), listAudits: vi.fn(), heatmap: vi.fn() },
}));

const onDownload = vi.fn();

const setup = () =>
  render(
    <MemoryRouter>
      <TeamHeatmap onDownload={onDownload} />
    </MemoryRouter>,
  );

const grid = () => screen.findByRole('table', { name: 'Team heatmap' });

beforeEach(() => {
  vi.mocked(organisationsApi.me).mockResolvedValue(ORGANISATION);
  vi.mocked(organisationsApi.listAudits).mockResolvedValue([...AUDITS]);
  vi.mocked(organisationsApi.heatmap).mockResolvedValue(HEATMAP);
});

describe('TeamHeatmap', () => {
  it('shows a loader while the heatmap arrives', () => {
    vi.mocked(organisationsApi.heatmap).mockReturnValue(new Promise(() => undefined));
    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows people by skills with a number in every filled cell', async () => {
    setup();

    const table = await grid();
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((cell) => cell.textContent),
    ).toEqual(['Person', 'Frontend Web Development', 'Backend Development']);
    const [ada, tunde] = within(table).getAllByRole('row').slice(1);
    expect(within(ada).getAllByRole('cell')[0]).toHaveTextContent('78');
    expect(within(ada).getAllByRole('cell')[0]).toHaveTextContent('Strong');
    expect(within(tunde).getAllByRole('cell')[0]).toHaveTextContent('41');
    expect(within(tunde).getAllByRole('cell')[0]).toHaveTextContent('Weak');
  });

  it('explains an empty cell', async () => {
    setup();

    const [ada] = within(await grid())
      .getAllByRole('row')
      .slice(1);
    expect(within(ada).getAllByRole('cell')[1]).toHaveTextContent('Not tested');
    expect(screen.getByText(/Not tested means nobody in this group has taken/)).toBeInTheDocument();
  });

  it('says what the numbers are measured against', async () => {
    setup();

    expect(await screen.findByText(/against the CareerLine benchmark/)).toBeInTheDocument();
  });

  it('links each person to their report', async () => {
    setup();

    expect(await screen.findByRole('link', { name: 'Ada Obi' })).toHaveAttribute(
      'href',
      '/team/members/1',
    );
  });

  it('groups by department or role and filters by audit', async () => {
    setup();

    await grid();
    await userEvent.selectOptions(screen.getByLabelText('Group by'), 'department');
    await userEvent.selectOptions(screen.getByLabelText('Audit'), '3');

    expect(organisationsApi.heatmap).toHaveBeenNthCalledWith(1, 41, 'member', undefined);
    expect(organisationsApi.heatmap).toHaveBeenNthCalledWith(2, 41, 'department', undefined);
    expect(organisationsApi.heatmap).toHaveBeenLastCalledWith(41, 'department', 3);
  });

  it('downloads the grid as a CSV file', async () => {
    setup();

    await grid();
    await userEvent.click(screen.getByRole('button', { name: 'Download CSV' }));

    expect(onDownload).toHaveBeenCalledWith(
      'team-heatmap.csv',
      'Person,Frontend Web Development,Backend Development\nAda Obi,78,\nTunde Bello,41,55\n',
    );
  });

  it('says when nobody has been tested yet', async () => {
    vi.mocked(organisationsApi.heatmap).mockResolvedValue({ ...HEATMAP, rows: [] });
    setup();

    expect(
      await screen.findByText('No results yet. Start an audit to fill the heatmap.'),
    ).toBeInTheDocument();
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(organisationsApi.heatmap)
      .mockRejectedValueOnce(new ApiError({ status: 0, message: 'No connection.' }))
      .mockResolvedValue(HEATMAP);
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await grid()).toBeInTheDocument();
  });

  it('draws a 50-person heatmap quickly', async () => {
    const skills = Array.from({ length: 10 }, (_, index) => ({
      skill_id: index + 1,
      skill_name: `Skill ${index + 1}`,
    }));
    vi.mocked(organisationsApi.heatmap).mockResolvedValue({
      ...HEATMAP,
      skills,
      rows: Array.from({ length: 50 }, (_, person) => ({
        key: String(person + 1),
        label: `Person ${person + 1}`,
        members: 1,
        cells: skills.map(({ skill_id }) => ({
          skill_id,
          average_score: (person * 7 + skill_id * 3) % 100,
          level: 'JUNIOR' as const,
          members_tested: 1,
          band: 'developing' as const,
        })),
      })),
    });
    const started = performance.now();
    setup();

    const rows = within(await grid())
      .getAllByRole('row')
      .slice(1);
    const took = performance.now() - started;

    expect(rows).toHaveLength(50);
    expect(within(rows[49]).getAllByRole('cell')).toHaveLength(10);
    expect(took).toBeLessThan(3000);
  });
});
