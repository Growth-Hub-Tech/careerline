import { useId } from 'react';
import { Link } from 'react-router-dom';
import { PRIMARY_ACTION, SECONDARY_ACTION } from '../components/ErrorPage';
import { PageLoader } from '../components/Loader';
import { LoadFailed } from '../components/PageState';
import { StatusLabel } from '../components/StatusLabel';
import { Table, type TableColumn } from '../components/Table';
import { organisationsApi, type AuditSummary, type Organisation } from '../lib/api';
import { formatDate } from '../lib/format';
import { useRequest } from '../lib/hooks/useRequest';
import { AUDIT_STATUS } from '../lib/organisation/labels';

const load = async () => {
  const organisation = await organisationsApi.me();
  const audits = await organisationsApi.listAudits(organisation.organisation_id);
  return { organisation, audits };
};

const LINK = 'font-medium text-indigo-700 underline hover:text-indigo-900';

const COLUMNS: readonly TableColumn<AuditSummary>[] = [
  {
    key: 'name',
    header: 'Audit',
    render: (row) => (
      <Link to={`/team/audits/${row.audit_id}`} className={LINK}>
        {row.name}
      </Link>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <StatusLabel status={AUDIT_STATUS[row.status].tone}>
        {AUDIT_STATUS[row.status].label}
      </StatusLabel>
    ),
  },
  {
    key: 'progress',
    header: 'Progress',
    render: (row) => `${row.members_completed} of ${row.members_total} finished`,
  },
  {
    key: 'started',
    header: 'Started',
    render: (row) => (row.started_at ? formatDate(row.started_at) : 'Not started'),
  },
];

const Seats = ({ organisation }: { organisation: Organisation }) => {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-slate-200 bg-white px-5 py-4"
    >
      <h2 id={headingId} className="sr-only">
        Seats
      </h2>
      <p className="text-[15px] font-medium text-slate-800">
        {organisation.seats_used} of {organisation.seats_total} seats used
      </p>
      <p className="text-[13px] text-slate-500">Seats are sold in blocks of at least 50.</p>
      <Link to={`/pricing?return=${encodeURIComponent('/team')}`} className={LINK}>
        Buy seats
      </Link>
    </section>
  );
};

export const TeamAudits = () => {
  const { state, retry } = useRequest(load);

  let content;
  if (state.status === 'loading') {
    content = <PageLoader title="Loading your audits" className="flex-1" />;
  } else if (state.status === 'error') {
    content = <LoadFailed error={state.error} onRetry={retry} />;
  } else {
    const { organisation, audits } = state.data;
    content = (
      <>
        <Seats organisation={organisation} />
        <div className="flex flex-wrap gap-3">
          <Link to="/team/audits/new" className={`${PRIMARY_ACTION} w-fit`}>
            Start an audit
          </Link>
          <Link to="/team/import" className={`${SECONDARY_ACTION} w-fit`}>
            Upload staff list
          </Link>
          <Link to="/team/heatmap" className={`${SECONDARY_ACTION} w-fit`}>
            See the heatmap
          </Link>
        </div>
        {audits.length === 0 ? (
          <p className="text-[15px] text-slate-600">No audits yet.</p>
        ) : (
          <Table
            caption="Audits"
            columns={COLUMNS}
            rows={audits}
            getRowKey={(row) => String(row.audit_id)}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex w-full max-w-[1100px] flex-col gap-8 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">Team audits</h1>
        <p className="max-w-[60ch] text-[15px] text-slate-600">
          Test your staff against the skills their roles need and follow each audit to the end.
        </p>
      </header>
      {content}
    </div>
  );
};
