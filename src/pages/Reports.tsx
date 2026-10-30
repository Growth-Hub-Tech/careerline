import { Link } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { PageLoader } from '../components/Loader';
import { Table, type TableColumn } from '../components/Table';
import { resultsApi, type ResultSummary } from '../lib/api';
import { describeError } from '../lib/api/describeError';
import { formatDate } from '../lib/format';
import { useRequest } from '../lib/hooks/useRequest';
import { LEVEL_LABELS } from '../lib/tests/catalog';

const load = () => resultsApi.list();

const LINK_CLASS =
  'rounded-md font-medium text-indigo-700 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';

const COLUMNS: readonly TableColumn<ResultSummary>[] = [
  {
    key: 'skill',
    header: 'Skill',
    render: (result) => (
      <Link to={`/reports/${result.result_id}`} className={LINK_CLASS}>
        {result.skill_name}
      </Link>
    ),
  },
  { key: 'level', header: 'Level', render: (result) => LEVEL_LABELS[result.level] },
  {
    key: 'score',
    header: 'Score',
    align: 'right',
    render: (result) => `${Math.round(result.percentage_score)}%`,
  },
  { key: 'date', header: 'Date', render: (result) => formatDate(result.completed_at) },
];

const newestFirst = (results: readonly ResultSummary[]) =>
  [...results].sort((a, b) => Date.parse(b.completed_at) - Date.parse(a.completed_at));

export const Reports = () => {
  const { state, retry } = useRequest(load);

  if (state.status === 'loading') {
    return <PageLoader title="Loading your results" className="flex-1" />;
  }

  if (state.status === 'error') {
    return (
      <div className="flex w-full max-w-[480px] flex-col gap-4 px-5 py-8 sm:px-8">
        <Alert variant="error">{describeError(state.error)}</Alert>
        <Button fullWidth={false} onClick={retry}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[1100px] flex-col gap-8 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">Reports</h1>
        <p className="text-[15px] text-slate-600">
          Every skill test you have finished, newest first.
        </p>
      </header>

      {state.data.length === 0 ? (
        <EmptyState
          title="No results yet"
          description="Take a skill test to see your score and report here."
          action={
            <Link
              to="/tests"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-4 text-[15px] font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Choose a test
            </Link>
          }
        />
      ) : (
        <Table
          caption="Your past results"
          columns={COLUMNS}
          rows={newestFirst(state.data)}
          getRowKey={(result) => String(result.result_id)}
        />
      )}
    </div>
  );
};
