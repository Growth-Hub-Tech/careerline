import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { recruiterApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { ADA_RESULT, CANDIDATE_REPORT, CANDIDATES } from '../test/fixtures/recruiter';
import { CandidateReport } from './CandidateReport';

vi.mock('../lib/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/api')>()),
  recruiterApi: { getCandidate: vi.fn(), getReport: vi.fn() },
}));

const setup = (address = '/candidates/601') =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <Routes>
        <Route path="/candidates/:candidateId" element={<CandidateReport />} />
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
    </MemoryRouter>,
  );

const notFinished = () =>
  new ApiError({ status: 404, code: 'not_found', message: 'No report yet.' });

beforeEach(() => {
  vi.mocked(recruiterApi.getCandidate).mockResolvedValue(CANDIDATES[0]);
  vi.mocked(recruiterApi.getReport).mockResolvedValue(CANDIDATE_REPORT);
});

describe('CandidateReport', () => {
  it('shows a loader while the report arrives', () => {
    vi.mocked(recruiterApi.getReport).mockReturnValue(new Promise(() => undefined));
    setup();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('asks for the candidate in the address', async () => {
    setup();

    await screen.findByRole('heading', { level: 1 });

    expect(recruiterApi.getCandidate).toHaveBeenCalledWith(601);
    expect(recruiterApi.getReport).toHaveBeenCalledWith(601);
  });

  it('names the candidate and the role', async () => {
    setup();

    expect(await screen.findByRole('heading', { level: 1, name: 'Ada Obi' })).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
  });

  it('shows the overall score', async () => {
    setup();

    expect((await screen.findByText('Overall score')).parentElement).toHaveTextContent('78%');
  });

  it('shows the recommendation exactly as sent', async () => {
    setup();

    const recommendation = await screen.findByRole('region', { name: 'Recommendation' });
    expect(recommendation).toHaveTextContent(CANDIDATE_REPORT.summary);
  });

  it('never shows a verdict or a hire button', async () => {
    setup();

    await screen.findByRole('heading', { level: 1 });

    expect(screen.queryByText(/strong fit/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /hire|reject/i })).not.toBeInTheDocument();
  });

  it('shows a card for each skill tested', async () => {
    setup();

    const card = await screen.findByRole('article', { name: ADA_RESULT.test_title });
    expect(card).toHaveTextContent('Mid level');
    expect(card).toHaveTextContent('78%');
  });

  it('always shows the disclaimer and the benchmark note', async () => {
    setup();

    expect(await screen.findByText(/Decision support only/)).toBeInTheDocument();
    expect(screen.getByText(/CareerLine benchmark/)).toBeInTheDocument();
  });

  it('offers the PDF', async () => {
    setup();

    expect(await screen.findByRole('link', { name: 'Download PDF' })).toHaveAttribute(
      'href',
      CANDIDATE_REPORT.report_url,
    );
  });

  it('says the PDF is still being made and checks again on request', async () => {
    vi.mocked(recruiterApi.getReport)
      .mockResolvedValueOnce({ ...CANDIDATE_REPORT, report_url: null })
      .mockResolvedValue(CANDIDATE_REPORT);
    setup();

    expect(await screen.findByText('The PDF is being made.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Download PDF' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Check again' }));

    expect(await screen.findByRole('link', { name: 'Download PDF' })).toBeInTheDocument();
    expect(recruiterApi.getReport).toHaveBeenCalledTimes(2);
  });

  it('says when there is not enough evidence for a skill', async () => {
    vi.mocked(recruiterApi.getReport).mockResolvedValue({ ...CANDIDATE_REPORT, results: [] });
    setup();

    expect(
      await screen.findByText('Not enough evidence yet. No shared result to show.'),
    ).toBeInTheDocument();
  });

  it('says when the candidate has not finished', async () => {
    vi.mocked(recruiterApi.getCandidate).mockResolvedValue(CANDIDATES[1]);
    vi.mocked(recruiterApi.getReport).mockRejectedValue(notFinished());
    setup('/candidates/602');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Tunde Bello' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Tunde Bello has not finished the test yet, or has not shared the result.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to candidates' })).toHaveAttribute(
      'href',
      '/candidates',
    );
  });

  it('shows page not found for an unknown candidate', async () => {
    vi.mocked(recruiterApi.getCandidate).mockRejectedValue(notFinished());
    setup('/candidates/999');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Page not found' }),
    ).toBeInTheDocument();
  });

  it('shows what went wrong and tries again on request', async () => {
    vi.mocked(recruiterApi.getReport)
      .mockRejectedValueOnce(new ApiError({ status: 0, message: 'No connection.' }))
      .mockResolvedValue(CANDIDATE_REPORT);
    setup();

    expect(await screen.findByRole('alert')).toHaveTextContent('No connection.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(
      within(await screen.findByRole('region', { name: 'Recommendation' })).getByText(
        CANDIDATE_REPORT.summary,
      ),
    ).toBeInTheDocument();
  });
});
