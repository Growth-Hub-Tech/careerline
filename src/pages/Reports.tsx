import { useId } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { QueryState } from '../components/PageState';
import { Table, type TableColumn } from '../components/Table';
import type { ResultSummary } from '../lib/api';
import { profileQueries, resultQueries } from '../lib/api/queries';
import { formatDate } from '../lib/format';
import { LEVEL_LABELS } from '../lib/tests/catalog';

const SkillLevels = () => {
  const headingId = useId();
  const { data: profile } = useQuery(profileQueries.skills());

  if (!profile || profile.skills.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2 id={headingId} className="text-[20px] font-bold text-slate-800">
        Your skill levels
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {profile.skills.map((skill) => (
          <li
            key={skill.skill_id}
            className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <span className="text-[15px] font-semibold text-slate-900">{skill.skill_name}</span>
            <span className="text-[14px] text-slate-700">
              {LEVEL_LABELS[skill.level]} · {Math.round(skill.percentage_score)}%
            </span>
            <span className="text-[13px] text-slate-500">
              Confirmed {formatDate(skill.confirmed_at)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

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

const ResultList = ({ results }: { results: readonly ResultSummary[] }) => (
  <div className="flex w-full max-w-[1100px] flex-col gap-8 px-5 py-10 sm:px-20">
    <header className="flex flex-col gap-2">
      <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">Reports</h1>
      <p className="text-[15px] text-slate-600">
        Every skill test you have finished, newest first.
      </p>
    </header>

    <SkillLevels />

    {results.length === 0 ? (
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
        rows={newestFirst(results)}
        getRowKey={(result) => String(result.result_id)}
      />
    )}
  </div>
);

export const Reports = () => {
  const results = useQuery(resultQueries.list());

  return (
    <QueryState
      query={results}
      loadingTitle="Loading your results"
      errorClassName="px-5 py-8 sm:px-8"
    >
      {(list) => <ResultList results={list} />}
    </QueryState>
  );
};
