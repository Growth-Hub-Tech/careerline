import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beginnerApi, type BeginnerPath } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { PATH } from '../test/fixtures/beginner';
import { AssessmentResults } from './AssessmentResults';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  beginnerApi: { getIntake: vi.fn(), submitIntake: vi.fn(), getRecommendations: vi.fn() },
}));

const setup = (path: BeginnerPath | null = PATH) =>
  render(
    <MemoryRouter
      initialEntries={[{ pathname: '/assessment/results', state: path ? { path } : undefined }]}
    >
      <AssessmentResults />
    </MemoryRouter>,
  );

const items = () =>
  within(screen.getByRole('list', { name: 'Recommended career paths' })).getAllByRole('listitem');

describe('AssessmentResults', () => {
  it('congratulates the person', () => {
    setup();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Congratulations... You have successfully completed your test',
      }),
    ).toBeInTheDocument();
  });

  it('introduces the ranked paths', () => {
    setup();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Here are your top 3 recommended career paths',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'These paths are ranked based on your personality, your goals, your available time, and your financial capacity.',
      ),
    ).toBeInTheDocument();
  });

  it('lists the paths in the order the API ranked them', () => {
    const shuffled = { ...PATH, recommendations: [...PATH.recommendations].reverse() };

    setup(shuffled);

    expect(items().map((item) => within(item).getByRole('heading').textContent)).toEqual([
      'Product Design',
      'Data Analysis',
      'Software Engineering',
    ]);
  });

  it('shows the reason and the match for each path', () => {
    setup();

    expect(within(items()[0]).getByText(PATH.recommendations[0].reasons[0])).toBeInTheDocument();
    expect(within(items()[0]).getByText('92% match')).toBeInTheDocument();
    expect(within(items()[1]).getByText('84% match')).toBeInTheDocument();
  });

  it('highlights only the top match and draws each score as a bar', () => {
    setup();

    expect(items()[0]).toHaveAttribute('data-top', 'true');
    expect(items()[1]).toHaveAttribute('data-top', 'false');
    const bar = screen.getByRole('progressbar', { name: 'Data Analysis' });
    expect(bar).toHaveAttribute('aria-valuenow', '84');
    expect(bar).toHaveAttribute('data-variant', 'teal');
  });

  it('starts learning with the programme of the top match', () => {
    setup();

    expect(screen.getByRole('link', { name: 'Start Learning' })).toHaveAttribute(
      'href',
      '/programmes/5',
    );
  });

  it('has no Start Learning when the top match has no programme yet', () => {
    const [first, ...rest] = PATH.recommendations;
    setup({ ...PATH, recommendations: [{ ...first, programme: null }, ...rest] });

    expect(screen.queryByRole('link', { name: 'Start Learning' })).not.toBeInTheDocument();
  });

  it('downloads the report from the Download PDF Report button', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined);
    setup();

    await userEvent.click(screen.getByRole('button', { name: 'Download PDF Report' }));

    expect(print).toHaveBeenCalledTimes(1);
    print.mockRestore();
  });

  it('loads the saved results when opened without any', async () => {
    vi.mocked(beginnerApi.getRecommendations).mockResolvedValue(PATH);

    setup(null);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(beginnerApi.getRecommendations).toHaveBeenCalledTimes(1);
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(beginnerApi.getRecommendations)
      .mockRejectedValueOnce(new ApiError({ status: 404, message: 'No results yet.' }))
      .mockResolvedValue(PATH);
    setup(null);

    expect(await screen.findByRole('alert')).toHaveTextContent('No results yet.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
  });
});
