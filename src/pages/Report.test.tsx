import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { resultsApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import {
  REPORT_FAILED,
  REPORT_GENERATING,
  REPORT_READY,
  RESULT_DETAIL,
} from '../test/fixtures/results';
import { Report } from './Report';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  resultsApi: { get: vi.fn(), getReport: vi.fn(), regenerateReport: vi.fn() },
}));

const setup = (address = '/reports/31') => {
  const onOpen = vi.fn();
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes>
        <Route path="/reports/:reportId" element={<Report onOpen={onOpen} pollInterval={0} />} />
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
    </MemoryRouter>,
  );
  return { onOpen };
};

const report = () => screen.findByRole('region', { name: 'CareerLine AI Skill Report' });

const download = async () =>
  userEvent.click(await screen.findByRole('button', { name: 'Download your report' }));

beforeEach(() => {
  vi.mocked(resultsApi.get).mockResolvedValue(RESULT_DETAIL);
  vi.mocked(resultsApi.getReport).mockResolvedValue(REPORT_READY);
  vi.mocked(resultsApi.regenerateReport).mockResolvedValue(REPORT_GENERATING);
});

describe('Report', () => {
  it('shows a loader while the result arrives', () => {
    vi.mocked(resultsApi.get).mockReturnValue(new Promise(() => undefined));

    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('asks for the result in the address', async () => {
    setup('/reports/44');

    await screen.findByRole('heading', { level: 1 });

    expect(resultsApi.get).toHaveBeenCalledWith(44);
  });

  it('says the results are ready with the overall score', async () => {
    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Your results are ready.' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Overall score').parentElement).toHaveTextContent('Overall score 81%');
  });

  it('sums up the strengths and where to grow', async () => {
    setup();

    const strengths = await screen.findByRole('region', { name: 'Your strengths' });
    const grow = screen.getByRole('region', { name: 'Where to grow' });

    expect(strengths).toHaveTextContent('Strong visual sensibility');
    expect(strengths).toHaveTextContent('Good user empathy');
    expect(grow).toHaveTextContent('Complex systems');
    expect(grow).toHaveTextContent('Documentation');
  });

  it('names the skill, date and level in the report', async () => {
    setup();

    const section = await report();

    expect(section).toHaveTextContent('Skill: Product Design');
    expect(section).toHaveTextContent('Date: 20 Oct 2026');
    expect(section).toHaveTextContent('Level: Mid');
    expect(section).not.toHaveTextContent('Confidence');
  });

  it('draws a bar with the score for each skill area', async () => {
    setup();
    const section = await report();

    const bars = within(section).getAllByRole('progressbar');
    expect(bars.map((bar) => bar.getAttribute('aria-valuenow'))).toEqual(['81', '64', '30']);
    expect(within(section).getByRole('progressbar', { name: 'UX Research' })).toBeInTheDocument();
    expect(section).toHaveTextContent('64%');
  });

  it('lists the strengths and weaknesses in the report', async () => {
    setup();
    const section = await report();

    const strengths = within(section).getByRole('list', { name: 'Strengths' });
    const weaknesses = within(section).getByRole('list', { name: 'Weaknesses' });

    expect(within(strengths).getAllByRole('listitem')).toHaveLength(2);
    expect(
      within(weaknesses)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual(['Complex systems', 'Documentation']);
  });

  it('always says the report is decision support only', async () => {
    setup();

    expect(await screen.findByText(/Decision support only\./)).toBeInTheDocument();
  });

  it('explains the benchmark and where the person stands', async () => {
    setup();

    expect(
      await screen.findByText(
        'Your answers are scored against the CareerLine benchmark for Product Design at the Mid level. You scored higher than 72% of people who took this test.',
      ),
    ).toBeInTheDocument();
  });

  it('keeps the benchmark note when there is no percentile yet', async () => {
    vi.mocked(resultsApi.get).mockResolvedValue({ ...RESULT_DETAIL, percentile: null });

    setup();

    expect(
      await screen.findByText(
        'Your answers are scored against the CareerLine benchmark for Product Design at the Mid level.',
      ),
    ).toBeInTheDocument();
  });

  it('opens the PDF when it is ready', async () => {
    const { onOpen } = setup();

    await download();

    expect(resultsApi.getReport).toHaveBeenCalledWith(31);
    expect(onOpen).toHaveBeenCalledWith(REPORT_READY.download_url);
  });

  it('waits while the PDF is being made, then opens it', async () => {
    vi.mocked(resultsApi.getReport)
      .mockResolvedValueOnce(REPORT_GENERATING)
      .mockResolvedValue(REPORT_READY);
    const { onOpen } = setup();

    await download();

    expect(await screen.findByRole('button', { name: 'Download your report' })).toBeEnabled();
    expect(resultsApi.getReport).toHaveBeenCalledTimes(2);
    expect(onOpen).toHaveBeenCalledWith(REPORT_READY.download_url);
  });

  it('shows that the PDF is being prepared', async () => {
    vi.mocked(resultsApi.getReport).mockReturnValue(new Promise(() => undefined));
    setup();

    await download();

    const button = screen.getByRole('button', { name: 'Preparing your report...' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('asks for a failed PDF to be made again', async () => {
    vi.mocked(resultsApi.getReport)
      .mockResolvedValueOnce(REPORT_FAILED)
      .mockResolvedValue(REPORT_READY);
    const { onOpen } = setup();

    await download();

    expect(await screen.findByRole('button', { name: 'Download your report' })).toBeEnabled();
    expect(resultsApi.regenerateReport).toHaveBeenCalledWith(31);
    expect(onOpen).toHaveBeenCalledWith(REPORT_READY.download_url);
  });

  it('says when the PDF could not be made', async () => {
    vi.mocked(resultsApi.getReport).mockResolvedValue(REPORT_FAILED);
    const { onOpen } = setup();

    await download();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We could not create your report. Try again in a few minutes.',
    );
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('says when the PDF is taking longer than usual', async () => {
    vi.mocked(resultsApi.getReport).mockResolvedValue(REPORT_GENERATING);
    setup();

    await download();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Your report is still being prepared. Try again in a minute.',
    );
  });

  it('says what went wrong when the PDF cannot be reached', async () => {
    vi.mocked(resultsApi.getReport).mockRejectedValue(
      new ApiError({ status: 0, code: 'network', message: 'No connection.' }),
    );
    setup();

    await download();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
  });

  it('sends an unknown result to page not found', async () => {
    vi.mocked(resultsApi.get).mockRejectedValue(
      new ApiError({ status: 404, code: 'not_found', message: 'Not found.' }),
    );

    setup();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeInTheDocument();
  });

  it('sends an address that is not a result id to page not found', () => {
    setup('/reports/abc');

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
    expect(resultsApi.get).not.toHaveBeenCalled();
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(resultsApi.get)
      .mockRejectedValueOnce(
        new ApiError({ status: 0, code: 'network', message: 'No connection.' }),
      )
      .mockResolvedValue(RESULT_DETAIL);

    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await report()).toBeInTheDocument();
  });
});
