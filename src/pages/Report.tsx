import { useCallback, useId, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { PageLoader } from '../components/Loader';
import { resultsApi, type ResultDetail, type SubskillScore } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { describeError } from '../lib/api/describeError';
import { formatDate } from '../lib/format';
import { useRequest } from '../lib/hooks/useRequest';
import { LEVEL_LABELS } from '../lib/tests/catalog';
import { waitForReport } from '../lib/tests/report';

const STILL_PREPARING = 'Your report is still being prepared. Try again in a minute.';
const NOT_CREATED = 'We could not create your report. Try again in a few minutes.';

const openUrl = (url: string) => window.location.assign(url);

const percent = (score: number) => `${Math.round(score)}%`;

const Arcs = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute -top-10 right-0 hidden h-[280px] w-[400px] overflow-hidden sm:block"
  >
    <span className="absolute top-[-140px] left-0 size-[420px] rounded-full bg-indigo-100" />
    <span className="absolute top-[-140px] left-[100px] size-[420px] rounded-full bg-amber-100" />
    <span className="absolute top-[-140px] left-[200px] size-[420px] rounded-full bg-emerald-100" />
  </div>
);

interface SummaryCardProps {
  readonly title: string;
  readonly items: readonly string[];
  readonly tone: 'teal' | 'orange';
}

const SummaryCard = ({ title, items, tone }: SummaryCardProps) => {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-lg bg-gray-100 p-6 text-[13px] leading-[1.5] text-slate-700"
    >
      <h2
        id={headingId}
        className={`text-[15px] font-semibold ${tone === 'teal' ? 'text-teal-700' : 'text-orange-700'}`}
      >
        {title}
      </h2>
      {items.length > 0 ? (
        items.map((item) => <p key={item}>{item}</p>)
      ) : (
        <p>Nothing stood out this time.</p>
      )}
    </section>
  );
};

interface DownloadReportProps {
  readonly resultId: number;
  readonly onOpen: (url: string) => void;
  readonly pollInterval: number;
}

const DownloadReport = ({ resultId, onOpen, pollInterval }: DownloadReportProps) => {
  const [isPreparing, setIsPreparing] = useState(false);
  const [message, setMessage] = useState<string>();
  const busy = useRef(false);

  const download = async () => {
    if (busy.current) return;
    busy.current = true;
    setIsPreparing(true);
    setMessage(undefined);

    try {
      const poll = () =>
        waitForReport(() => resultsApi.getReport(resultId), { interval: pollInterval });

      let report = await poll();
      if (report.status === 'failed') {
        await resultsApi.regenerateReport(resultId);
        report = await poll();
      }

      if (report.status === 'ready' && report.download_url) onOpen(report.download_url);
      else setMessage(report.status === 'generating' ? STILL_PREPARING : NOT_CREATED);
    } catch (error) {
      setMessage(describeError(error));
    } finally {
      busy.current = false;
      setIsPreparing(false);
    }
  };

  return (
    <div className="flex w-full max-w-[420px] flex-col items-center gap-3">
      {message && <Alert variant="error">{message}</Alert>}
      <Button
        variant="accent"
        fullWidth={false}
        isLoading={isPreparing}
        onClick={download}
        className="min-w-[260px] text-[14px]"
      >
        {isPreparing ? 'Preparing your report...' : 'Download your report'}
      </Button>
    </div>
  );
};

const SkillArea = ({ subskill }: { subskill: SubskillScore }) => {
  const labelId = useId();
  const score = Math.round(subskill.percentage_score);

  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-3 bg-slate-200 px-3 py-4 sm:grid-cols-[10rem_1fr_5rem] sm:px-2 sm:py-5">
      <span id={labelId} className="order-1 text-[15px] text-slate-950 sm:text-[17px]">
        {subskill.subskill_name}
      </span>
      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        className="order-3 col-span-2 h-6 w-full overflow-hidden rounded-lg bg-slate-50 sm:order-2 sm:col-span-1 sm:h-8"
      >
        <div className="h-full rounded-lg bg-teal-700" style={{ width: `${score}%` }} />
      </div>
      <span className="order-2 text-right text-[17px] font-semibold text-slate-950 sm:order-3 sm:text-[20px]">
        {score}%
      </span>
    </li>
  );
};

const NamedList = ({ title, items }: { title: string; items: readonly string[] }) => {
  const headingId = useId();

  return (
    <div className="flex flex-col gap-4">
      <h3 id={headingId} className="text-[18px] font-semibold text-slate-950 sm:text-[20px]">
        {title}
      </h3>
      <ul
        aria-labelledby={headingId}
        className="flex list-disc flex-col gap-1 pl-6 text-[16px] font-semibold text-slate-950 sm:text-[20px]"
      >
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

const SkillReport = ({ result }: { result: ResultDetail }) => {
  const headingId = useId();
  const level = LEVEL_LABELS[result.level];

  return (
    <section aria-labelledby={headingId} className="flex w-full max-w-[1100px] flex-col gap-6">
      <div className="flex flex-col gap-6 bg-white p-5 sm:max-w-[900px] sm:p-12">
        <h2 id={headingId} className="text-[24px] font-bold text-slate-950 sm:text-[32px]">
          CareerLine AI Skill Report
        </h2>
        <div className="grid gap-3 text-[17px] font-semibold text-slate-950 sm:grid-cols-2 sm:text-[22px]">
          <p>Skill: {result.skill_name}</p>
          <p>Date: {formatDate(result.completed_at)}</p>
          <p>Level: {level}</p>
        </div>

        {result.subskills.length > 0 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-[17px] font-semibold text-slate-950">Skill Areas</h3>
            <ul className="flex flex-col gap-3">
              {result.subskills.map((subskill) => (
                <SkillArea key={subskill.subskill_id} subskill={subskill} />
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <NamedList title="Strengths" items={result.strengths} />
        <NamedList title="Weaknesses" items={result.gaps} />
      </div>
    </section>
  );
};

const describeBenchmark = ({ skill_name, level, percentile }: ResultDetail) => {
  const benchmark = `Your answers are scored against the CareerLine benchmark for ${skill_name} at the ${LEVEL_LABELS[level]} level.`;
  return percentile === null
    ? benchmark
    : `${benchmark} You scored higher than ${percentile}% of people who took this test.`;
};

interface ResultDetailsProps {
  readonly id: number;
  readonly onOpen: (url: string) => void;
  readonly pollInterval: number;
}

const ResultDetails = ({ id, onOpen, pollInterval }: ResultDetailsProps) => {
  const load = useCallback(() => resultsApi.get(id), [id]);
  const { state, retry } = useRequest(load);

  if (state.status === 'loading') {
    return <PageLoader title="Loading your results" className="flex-1" />;
  }

  if (state.status === 'error') {
    if (state.error instanceof ApiError && state.error.status === 404) {
      return <Navigate to="/page-not-found" replace />;
    }

    return (
      <div className="flex w-full max-w-[480px] flex-col gap-4 px-5 py-8 sm:px-8">
        <Alert variant="error">{describeError(state.error)}</Alert>
        <Button fullWidth={false} onClick={retry}>
          Try again
        </Button>
      </div>
    );
  }

  const result = state.data;

  return (
    <div className="relative flex w-full flex-col items-center gap-16 overflow-hidden px-5 py-16 sm:px-20">
      <Arcs />

      <div className="relative flex w-full flex-col items-center gap-10">
        <h1 className="text-center text-[28px] font-bold text-slate-700">
          Your results are ready.
        </h1>
        <p className="flex size-[180px] items-center justify-center rounded-full bg-teal-400 text-[36px] font-bold text-teal-900">
          <span className="sr-only">Overall score </span>
          <span>{percent(result.percentage_score)}</span>
        </p>
        <div className="grid w-full max-w-[680px] gap-10 sm:grid-cols-2">
          <SummaryCard title="Your strengths" items={result.strengths} tone="teal" />
          <SummaryCard title="Where to grow" items={result.gaps} tone="orange" />
        </div>
        <DownloadReport resultId={result.result_id} onOpen={onOpen} pollInterval={pollInterval} />
      </div>

      <SkillReport result={result} />

      <div className="flex w-full max-w-[1100px] flex-col gap-2 text-[13px] leading-[1.55] text-slate-600">
        <p>
          <strong className="font-semibold text-slate-800">Decision support only.</strong> Use this
          report alongside other evidence, such as interviews and work samples. It should not be the
          only reason for a hiring or career decision.
        </p>
        <p>{describeBenchmark(result)}</p>
      </div>
    </div>
  );
};

interface ReportProps {
  readonly onOpen?: (url: string) => void;
  readonly pollInterval?: number;
}

export const Report = ({ onOpen = openUrl, pollInterval = 3000 }: ReportProps) => {
  const { reportId } = useParams();
  const id = Number(reportId);

  if (!Number.isInteger(id) || id <= 0) {
    return <Navigate to="/page-not-found" replace />;
  }

  return <ResultDetails key={id} id={id} onOpen={onOpen} pollInterval={pollInterval} />;
};
