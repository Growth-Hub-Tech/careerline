import { useCallback, useId, type ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { DecisionNote } from '../components/DecisionNote';
import { PRIMARY_ACTION } from '../components/ErrorPage';
import { PageLoader } from '../components/Loader';
import { LoadFailed } from '../components/PageState';
import { recruiterApi, type CandidateTestResult } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { formatDate } from '../lib/format';
import { useRequest } from '../lib/hooks/useRequest';
import { LEVEL_LABELS } from '../lib/tests/catalog';

const isStatus = (error: unknown, ...statuses: number[]) =>
  error instanceof ApiError && statuses.includes(error.status);

const percent = (score: number) => `${Math.round(score)}%`;

const BACK_LINK =
  'w-fit text-[14px] font-medium text-indigo-700 underline hover:text-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';

const SkillCard = ({ result }: { result: CandidateTestResult }) => {
  const headingId = useId();

  return (
    <article
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5"
    >
      <h3 id={headingId} className="text-[17px] font-bold text-slate-800">
        {result.test_title}
      </h3>
      <dl className="grid grid-cols-2 gap-2 text-[14px]">
        <dt className="text-slate-500">Score</dt>
        <dd className="font-semibold text-slate-900">{percent(result.percentage_score)}</dd>
        <dt className="text-slate-500">Level</dt>
        <dd className="font-semibold text-slate-900">{LEVEL_LABELS[result.level]} level</dd>
        <dt className="text-slate-500">Finished</dt>
        <dd className="text-slate-900">{formatDate(result.completed_at)}</dd>
      </dl>
    </article>
  );
};

const Section = ({ title, children }: { title: string; children: ReactNode }) => {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2 id={headingId} className="text-[20px] font-bold text-slate-800">
        {title}
      </h2>
      {children}
    </section>
  );
};

const loadReport = async (id: number) => {
  const [candidate, report] = await Promise.all([
    recruiterApi.getCandidate(id),
    recruiterApi.getReport(id).catch((error: unknown) => {
      if (isStatus(error, 404, 409)) return null;
      throw error;
    }),
  ]);
  return { candidate, report };
};

const CandidateDetails = ({ id }: { id: number }) => {
  const load = useCallback(() => loadReport(id), [id]);
  const { state, retry } = useRequest(load);

  if (state.status === 'loading') {
    return <PageLoader title="Loading the report" className="flex-1" />;
  }

  if (state.status === 'error') {
    if (isStatus(state.error, 404)) return <Navigate to="/page-not-found" replace />;

    return <LoadFailed error={state.error} onRetry={retry} className="px-5 py-8 sm:px-8" />;
  }

  const { candidate, report } = state.data;
  const results = report?.results ?? [];
  const overall =
    results.length > 0
      ? results.reduce((sum, result) => sum + result.percentage_score, 0) / results.length
      : null;

  return (
    <div className="flex w-full max-w-[1100px] flex-col gap-8 px-5 py-10 sm:px-20">
      <Link to="/candidates" className={BACK_LINK}>
        Back to candidates
      </Link>
      <header className="flex flex-col gap-1">
        <p className="text-[14px] font-medium text-slate-500">Candidate report</p>
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">
          {candidate.full_name}
        </h1>
        {(report?.role_title ?? candidate.role_title) && (
          <p className="text-[16px] text-slate-600">{report?.role_title ?? candidate.role_title}</p>
        )}
      </header>

      {!report ? (
        <p className="text-[15px] text-slate-600">
          {candidate.full_name} has not finished the test yet, or has not shared the result.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-6">
            {overall !== null && (
              <p className="flex flex-col">
                <span className="text-[14px] text-slate-500">Overall score</span>
                <span className="text-[36px] font-bold text-slate-900">{percent(overall)}</span>
              </p>
            )}
            {report.report_url ? (
              <a href={report.report_url} className={`${PRIMARY_ACTION} w-fit`}>
                Download PDF
              </a>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[15px] text-slate-600">The PDF is being made.</p>
                <Button variant="transparent" border="solid" fullWidth={false} onClick={retry}>
                  Check again
                </Button>
              </div>
            )}
          </div>

          <Section title="Recommendation">
            <p className="max-w-[70ch] text-[16px] leading-[1.6] text-slate-800">
              {report.summary}
            </p>
          </Section>

          <Section title="Skills tested">
            {results.length === 0 ? (
              <p className="text-[15px] text-slate-600">
                Not enough evidence yet. No shared result to show.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((result) => (
                  <SkillCard key={result.result_id} result={result} />
                ))}
              </div>
            )}
          </Section>
        </>
      )}

      <DecisionNote benchmark="Scores are measured against the CareerLine benchmark for each skill and level, not against other candidates." />
    </div>
  );
};

export const CandidateReport = () => {
  const { candidateId } = useParams();
  const id = Number(candidateId);

  if (!Number.isInteger(id) || id <= 0) {
    return <Navigate to="/page-not-found" replace />;
  }

  return <CandidateDetails key={id} id={id} />;
};
