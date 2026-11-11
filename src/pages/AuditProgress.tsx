import { useId } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { QueryState } from '../components/PageState';
import { ProgressBar } from '../components/ProgressBar';
import { StatusLabel } from '../components/StatusLabel';
import { Table, type TableColumn } from '../components/Table';
import type { Audit, Benchmark, MemberDelta, TeamMember } from '../lib/api';
import { describeError } from '../lib/api/describeError';
import { combineResults, organisationQueries, useRetestAudit } from '../lib/api/queries';
import { formatPoints } from '../lib/format';
import { AUDIT_STATUS, MEMBER_STATUS } from '../lib/organisation/labels';
import { LEVEL_LABELS } from '../lib/tests/catalog';

const percent = (score: number | null) => (score === null ? '—' : `${Math.round(score)}%`);

const LINK = 'font-medium text-indigo-700 underline hover:text-indigo-900';

const PEOPLE: readonly TableColumn<TeamMember>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (row) => (
      <Link to={`/team/members/${row.member_id}`} className={LINK}>
        {row.full_name}
      </Link>
    ),
  },
  { key: 'role', header: 'Role', render: (row) => row.role_title },
  { key: 'department', header: 'Department', render: (row) => row.department ?? '—' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <StatusLabel status={MEMBER_STATUS[row.status].tone}>
        {MEMBER_STATUS[row.status].label}
      </StatusLabel>
    ),
  },
  {
    key: 'level',
    header: 'Level',
    render: (row) => (row.latest_level ? LEVEL_LABELS[row.latest_level] : '—'),
  },
];

const BENCHMARKS: readonly TableColumn<Benchmark>[] = [
  { key: 'role', header: 'Role', render: (row) => row.role_title },
  { key: 'skill', header: 'Skill', render: (row) => row.skill_name },
  { key: 'target', header: 'Target level', render: (row) => LEVEL_LABELS[row.target_level] },
  {
    key: 'team',
    header: 'Team average',
    align: 'right',
    render: (row) => percent(row.team_average_score),
  },
  {
    key: 'industry',
    header: 'Industry average',
    align: 'right',
    render: (row) => percent(row.industry_average_score),
  },
  {
    key: 'meeting',
    header: 'At or above target',
    align: 'right',
    render: (row) => `${row.members_at_or_above_target} of ${row.members_tested}`,
  },
];

const CHANGES: readonly TableColumn<MemberDelta>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (row) => (
      <Link to={`/team/members/${row.member_id}`} className={LINK}>
        {row.full_name}
      </Link>
    ),
  },
  { key: 'skill', header: 'Skill', render: (row) => row.skill_name },
  { key: 'before', header: 'Before', align: 'right', render: (row) => percent(row.before_score) },
  { key: 'after', header: 'After', align: 'right', render: (row) => percent(row.after_score) },
  {
    key: 'change',
    header: 'Change',
    align: 'right',
    render: (row) => (row.score_delta === null ? '—' : formatPoints(Math.round(row.score_delta))),
  },
];

// A re-test's results next to the first audit's, person by person (its own loader and error,
// so the rest of the audit still shows when this part fails)
const RetestChanges = ({ auditId }: { auditId: number }) => {
  const headingId = useId();
  const deltas = useQuery(organisationQueries.auditDeltas(auditId));

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2 id={headingId} className="text-[20px] font-bold text-slate-800">
        Change since the first audit
      </h2>
      <QueryState query={deltas} loadingTitle="Loading the changes" loaderClassName="">
        {({ items }) => (
          <Table
            caption="Change since the first audit"
            columns={CHANGES}
            rows={items}
            getRowKey={(row) => `${row.member_id}-${row.skill_id}`}
            empty="Nobody has finished the re-test yet."
          />
        )}
      </QueryState>
    </section>
  );
};

const StatusCounts = ({ members }: { members: readonly TeamMember[] }) => {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h2 id={headingId} className="text-[20px] font-bold text-slate-800">
        Where people are
      </h2>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Object.entries(MEMBER_STATUS).map(([status, { label }]) => (
          <div key={status} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <dt className="text-[13px] text-slate-500">{label}</dt>
            <dd className="text-[24px] font-bold text-slate-900">
              {members.filter((item) => item.status === status).length}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

// The same people and tests again, compared with this audit. The API refuses a second re-test
// too soon (409, with the date it becomes possible), and the Alert shows its message.
const Retest = ({ audit }: { audit: Audit }) => {
  const navigate = useNavigate();
  const retest = useRetestAudit();

  const start = () =>
    retest.mutate(audit.audit_id, {
      onSuccess: (started) => navigate(`/team/audits/${started.audit_id}`),
    });

  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-indigo-50 p-5">
      <h2 className="text-[17px] font-semibold text-slate-900">Measure progress</h2>
      <p className="text-[14px] text-slate-700">
        Test the same roles again after training to see how much the team has moved.
      </p>
      {retest.isError && <Alert variant="error">{describeError(retest.error)}</Alert>}
      <Button
        fullWidth={false}
        className="self-start"
        isLoading={retest.isPending || retest.isSuccess}
        onClick={start}
      >
        Request a re-test
      </Button>
    </section>
  );
};

// The audit and the people in its roles
const AuditView = ({ audit, team }: { audit: Audit; team: readonly TeamMember[] }) => {
  const members = team.filter((item) => audit.role_ids.includes(item.role_id));

  return (
    <div className="flex w-full max-w-[1100px] flex-col gap-8 px-5 py-10 sm:px-20">
      <Link to="/team" className={`w-fit text-[14px] ${LINK}`}>
        Back to team audits
      </Link>
      <header className="flex flex-col gap-3">
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">{audit.name}</h1>
        <StatusLabel status={AUDIT_STATUS[audit.status].tone} className="w-fit">
          {AUDIT_STATUS[audit.status].label}
        </StatusLabel>
        <ProgressBar
          label="Tests finished"
          value={audit.members_completed}
          max={Math.max(audit.members_total, 1)}
          valueText={`${audit.members_completed} of ${audit.members_total} finished`}
          className="max-w-[480px]"
        />
        <p className="text-[14px] text-slate-600">
          {audit.members_completed} of {audit.members_total} finished
        </p>
      </header>

      {audit.status === 'completed' && <Retest audit={audit} />}

      {audit.baseline_audit_id != null && <RetestChanges auditId={audit.audit_id} />}

      <StatusCounts members={members} />

      <Table
        caption="People in this audit"
        columns={PEOPLE}
        rows={members}
        getRowKey={(row) => String(row.member_id)}
        empty="Nobody in these roles yet."
      />

      {audit.benchmarks.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-[20px] font-bold text-slate-800">Benchmarks</h2>
          <Table
            caption="Benchmarks"
            columns={BENCHMARKS}
            rows={audit.benchmarks}
            getRowKey={(row) => `${row.role_id}-${row.skill_id}`}
          />
        </section>
      )}
    </div>
  );
};

const AuditDetails = ({ id }: { id: number }) => {
  const details = useQueries({
    queries: [organisationQueries.audit(id), organisationQueries.members()],
    combine: combineResults,
  });

  return (
    <QueryState
      query={details}
      loadingTitle="Loading the audit"
      redirectOnNotFound
      errorClassName="mx-5 my-10 sm:mx-20"
    >
      {([audit, team]) => <AuditView audit={audit} team={team} />}
    </QueryState>
  );
};

export const AuditProgress = () => {
  const { auditId } = useParams();
  const id = Number(auditId);

  if (!Number.isInteger(id) || id <= 0) {
    return <Navigate to="/page-not-found" replace />;
  }

  return <AuditDetails key={id} id={id} />;
};
