import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { resultsApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { RESULT_SUMMARIES } from '../test/fixtures/results';
import { Reports } from './Reports';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  resultsApi: { list: vi.fn() },
}));

const setup = () =>
  render(
    <MemoryRouter>
      <Reports />
    </MemoryRouter>,
  );

const rows = async () =>
  within(await screen.findByRole('table', { name: 'Your past results' }))
    .getAllByRole('row')
    .slice(1);

beforeEach(() => {
  vi.mocked(resultsApi.list).mockResolvedValue([...RESULT_SUMMARIES]);
});

describe('Reports', () => {
  it('shows a loader while the results arrive', () => {
    vi.mocked(resultsApi.list).mockReturnValue(new Promise(() => undefined));

    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has a main heading', async () => {
    setup();

    expect(await screen.findByRole('heading', { level: 1, name: 'Reports' })).toBeInTheDocument();
  });

  it('lists past results with the newest first', async () => {
    setup();

    const [first, second] = await rows();

    expect(first).toHaveTextContent('Frontend Web Development');
    expect(second).toHaveTextContent('Product Design');
  });

  it('shows the level, score and date of each result', async () => {
    setup();

    const [first] = await rows();

    expect(first).toHaveTextContent('Junior');
    expect(first).toHaveTextContent('65%');
    expect(first).toHaveTextContent('27 Oct 2026');
  });

  it('links each result to its report', async () => {
    setup();

    expect(await screen.findByRole('link', { name: 'Product Design' })).toHaveAttribute(
      'href',
      '/reports/31',
    );
  });

  it('points to the tests when there are no results yet', async () => {
    vi.mocked(resultsApi.list).mockResolvedValue([]);

    setup();

    expect(await screen.findByText('No results yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Choose a test' })).toHaveAttribute('href', '/tests');
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(resultsApi.list)
      .mockRejectedValueOnce(
        new ApiError({ status: 0, code: 'network', message: 'No connection.' }),
      )
      .mockResolvedValue([...RESULT_SUMMARIES]);

    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await rows()).toHaveLength(2);
  });
});
