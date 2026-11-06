import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { organisationsApi, programmesApi, rolesApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { PROGRAMME } from '../test/fixtures/beginner';
import {
  HEATMAP,
  MEMBERS,
  ORGANISATION,
  roleWithSkills,
  TARGETS,
} from '../test/fixtures/organisation';
import { EmployeeReport } from './EmployeeReport';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  organisationsApi: { me: vi.fn(), listMembers: vi.fn(), heatmap: vi.fn(), getTargets: vi.fn() },
  rolesApi: { get: vi.fn() },
  programmesApi: { listForRole: vi.fn() },
}));

const setup = (address = '/team/members/2') =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes>
        <Route path="/team/members/:memberId" element={<EmployeeReport />} />
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
    </MemoryRouter>,
  );

const skillRows = async () =>
  within(await screen.findByRole('table', { name: 'Skills against standards' }))
    .getAllByRole('row')
    .slice(1);

beforeEach(() => {
  vi.mocked(organisationsApi.me).mockResolvedValue(ORGANISATION);
  vi.mocked(organisationsApi.listMembers).mockResolvedValue([...MEMBERS]);
  vi.mocked(organisationsApi.heatmap).mockResolvedValue(HEATMAP);
  vi.mocked(organisationsApi.getTargets).mockResolvedValue(TARGETS);
  vi.mocked(rolesApi.get).mockResolvedValue(roleWithSkills(1));
  vi.mocked(programmesApi.listForRole).mockResolvedValue([PROGRAMME]);
});

describe('EmployeeReport', () => {
  it('shows a loader while the report arrives', () => {
    vi.mocked(organisationsApi.heatmap).mockReturnValue(new Promise(() => undefined));
    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('names the person, their role and department', async () => {
    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Tunde Bello' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer · Engineering')).toBeInTheDocument();
    expect(rolesApi.get).toHaveBeenCalledWith(1);
    expect(organisationsApi.heatmap).toHaveBeenCalledWith(41, 'member');
  });

  it('sets each skill against the role standard and the company target side by side', async () => {
    setup();

    const [frontend, backend] = await skillRows();
    const cells = (row: HTMLElement) =>
      within(row)
        .getAllByRole('cell')
        .map((cell) => cell.textContent);
    expect(cells(frontend)).toEqual(['Junior (41)', 'Mid: 1 level below', 'Mid: 1 level below']);
    expect(cells(backend)).toEqual(['Junior (55)', 'Junior: meets it', 'No target set']);
  });

  it('says when a skill has not been tested', async () => {
    vi.mocked(organisationsApi.heatmap).mockResolvedValue({ ...HEATMAP, rows: [] });
    setup();

    const [frontend] = await skillRows();
    expect(within(frontend).getAllByRole('cell')[0]).toHaveTextContent('Not tested yet');
  });

  it('suggests programmes for the role', async () => {
    setup();

    expect(await screen.findByRole('heading', { name: PROGRAMME.name })).toBeInTheDocument();
    expect(programmesApi.listForRole).toHaveBeenCalledWith(1);
  });

  it('always shows the decision note', async () => {
    setup();

    expect(await screen.findByText(/Decision support only/)).toBeInTheDocument();
  });

  it('shows page not found for someone outside the team', async () => {
    setup('/team/members/99');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeInTheDocument();
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(organisationsApi.listMembers)
      .mockRejectedValueOnce(new ApiError({ status: 0, message: 'No connection.' }))
      .mockResolvedValue([...MEMBERS]);
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Tunde Bello' }),
    ).toBeInTheDocument();
  });
});
