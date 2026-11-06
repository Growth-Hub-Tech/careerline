import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { PageLoader } from '../components/Loader';
import { LoadFailed } from '../components/PageState';
import { Select } from '../components/Select';
import {
  organisationsApi,
  type AuditSummary,
  type Heatmap,
  type HeatmapCell,
  type HeatmapGrouping,
} from '../lib/api';
import { useRequest } from '../lib/hooks/useRequest';
import { LEVEL_LABELS } from '../lib/tests/catalog';
import { heatmapCsv, heatmapScore as score } from '../lib/organisation/heatmapCsv';

const GROUPINGS: readonly { value: HeatmapGrouping; label: string; column: string }[] = [
  { value: 'member', label: 'Person', column: 'Person' },
  { value: 'department', label: 'Department', column: 'Department' },
  { value: 'role', label: 'Role', column: 'Role' },
];

const BANDS: Record<HeatmapCell['band'], { label: string; className: string }> = {
  strong: { label: 'Strong', className: 'bg-[#0072B2] text-white' },
  developing: { label: 'Developing', className: 'bg-[#56B4E9] text-slate-950' },
  weak: { label: 'Weak', className: 'bg-[#E69F00] text-slate-950' },
  not_tested: { label: 'Not tested', className: 'bg-slate-100 text-slate-500' },
};

const downloadFile = (name: string, text: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
};

const Cell = ({ cell }: { cell: HeatmapCell | undefined }) => {
  const band = BANDS[cell?.band ?? 'not_tested'];

  return (
    <td className="border border-white p-0">
      <span
        className={`flex min-h-14 min-w-28 flex-col items-center justify-center px-2 py-2 text-center ${band.className}`}
      >
        {cell && cell.average_score !== null ? (
          <>
            <span className="text-[18px] font-bold">{score(cell)}</span>
            <span className="text-[11px]">
              {band.label}
              {cell.level ? ` · ${LEVEL_LABELS[cell.level]}` : ''}
            </span>
          </>
        ) : (
          <span className="text-[12px]">Not tested</span>
        )}
      </span>
    </td>
  );
};

const Grid = ({ heatmap, column }: { heatmap: Heatmap; column: string }) => (
  <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
    <table className="w-full border-collapse text-[14px]">
      <caption className="sr-only">Team heatmap</caption>
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-4 py-3 text-left text-[13px] font-semibold text-slate-700">
            {column}
          </th>
          {heatmap.skills.map((skill) => (
            <th
              key={skill.skill_id}
              scope="col"
              className="px-2 py-3 text-center text-[13px] font-semibold text-slate-700"
            >
              {skill.skill_name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {heatmap.rows.map((row) => (
          <tr key={row.key}>
            <th scope="row" className="px-4 py-2 text-left font-medium text-slate-800">
              {heatmap.group_by === 'member' ? (
                <Link
                  to={`/team/members/${row.key}`}
                  className="text-indigo-700 underline hover:text-indigo-900"
                >
                  {row.label}
                </Link>
              ) : (
                <>
                  {row.label}
                  <span className="block text-[12px] font-normal text-slate-500">
                    {row.members} {row.members === 1 ? 'person' : 'people'}
                  </span>
                </>
              )}
            </th>
            {heatmap.skills.map((skill) => (
              <Cell
                key={skill.skill_id}
                cell={row.cells.find((item) => item.skill_id === skill.skill_id)}
              />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Legend = () => (
  <div className="flex flex-col gap-2 text-[13px] text-slate-600">
    <ul className="flex flex-wrap gap-4">
      {Object.entries(BANDS).map(([band, { label, className }]) => (
        <li key={band} className="flex items-center gap-2">
          <span aria-hidden="true" className={`size-4 rounded ${className}`} />
          {label}
        </li>
      ))}
    </ul>
    <p>
      Each number is the average test score from 0 to 100, measured against the CareerLine benchmark
      for that skill. Not tested means nobody in this group has taken that skill’s test yet.
    </p>
  </div>
);

interface HeatmapViewProps {
  readonly organisationId: number;
  readonly audits: readonly AuditSummary[];
  readonly onDownload: (name: string, text: string) => void;
}

const HeatmapView = ({ organisationId, audits, onDownload }: HeatmapViewProps) => {
  const [groupBy, setGroupBy] = useState<HeatmapGrouping>('member');
  const [auditId, setAuditId] = useState<number>();
  const load = useCallback(
    () => organisationsApi.heatmap(organisationId, groupBy, auditId),
    [organisationId, groupBy, auditId],
  );
  const { state, retry } = useRequest(load);
  const column = GROUPINGS.find((item) => item.value === groupBy)?.column ?? 'Group';

  let content;
  if (state.status === 'loading') {
    content = <PageLoader title="Loading the heatmap" className="flex-1" />;
  } else if (state.status === 'error') {
    content = <LoadFailed error={state.error} onRetry={retry} />;
  } else if (state.data.rows.length === 0) {
    content = (
      <p className="text-[15px] text-slate-600">
        No results yet. Start an audit to fill the heatmap.
      </p>
    );
  } else {
    const heatmap = state.data;
    content = (
      <>
        <Grid heatmap={heatmap} column={column} />
        <Legend />
        <Button
          variant="transparent"
          border="solid"
          fullWidth={false}
          className="self-start"
          onClick={() => onDownload('team-heatmap.csv', heatmapCsv(heatmap, column))}
        >
          Download CSV
        </Button>
      </>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:max-w-[560px] sm:grid-cols-2">
        <Select
          label="Group by"
          options={GROUPINGS}
          value={groupBy}
          onChange={(event) => setGroupBy(event.target.value as HeatmapGrouping)}
        />
        <Select
          label="Audit"
          options={[
            { value: '', label: 'All results' },
            ...audits.map((audit) => ({ value: String(audit.audit_id), label: audit.name })),
          ]}
          value={auditId === undefined ? '' : String(auditId)}
          onChange={(event) =>
            setAuditId(event.target.value === '' ? undefined : Number(event.target.value))
          }
        />
      </div>
      {content}
    </>
  );
};

const load = async () => {
  const organisation = await organisationsApi.me();
  const audits = await organisationsApi.listAudits(organisation.organisation_id);
  return { organisation, audits };
};

interface TeamHeatmapProps {
  readonly onDownload?: (name: string, text: string) => void;
}

export const TeamHeatmap = ({ onDownload = downloadFile }: TeamHeatmapProps) => {
  const { state, retry } = useRequest(load);

  let content;
  if (state.status === 'loading') {
    content = <PageLoader title="Loading the heatmap" className="flex-1" />;
  } else if (state.status === 'error') {
    content = <LoadFailed error={state.error} onRetry={retry} />;
  } else {
    content = (
      <HeatmapView
        organisationId={state.data.organisation.organisation_id}
        audits={state.data.audits}
        onDownload={onDownload}
      />
    );
  }

  return (
    <div className="flex w-full max-w-[1200px] flex-col gap-6 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">Capability heatmap</h1>
        <p className="max-w-[60ch] text-[15px] text-slate-600">
          See how your team measures up, skill by skill.
        </p>
      </header>
      {content}
    </div>
  );
};
