import { useState } from 'react';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { PageLoader } from '../components/Loader';
import { LoadFailed } from '../components/PageState';
import { Select } from '../components/Select';
import { Table, type TableColumn } from '../components/Table';
import {
  organisationsApi,
  rolesApi,
  type LevelName,
  type RoleSummary,
  type Target,
  type Targets,
} from '../lib/api';
import { describeError } from '../lib/api/describeError';
import { formatDate } from '../lib/format';
import { useRequest } from '../lib/hooks/useRequest';
import { LEVEL_ORDER } from '../lib/organisation/levels';
import { LEVEL_LABELS } from '../lib/tests/catalog';

interface DraftRow {
  readonly role_id: number;
  readonly role_title: string;
  readonly skill_id: number;
  readonly skill_name: string;
  readonly target_level: LevelName;
  readonly due_date: string | null;
}

const load = async () => {
  const organisation = await organisationsApi.me();
  const [targets, roles] = await Promise.all([
    organisationsApi.getTargets(organisation.organisation_id),
    rolesApi.list(),
  ]);
  return { organisationId: organisation.organisation_id, targets, roles };
};

const COLUMNS: readonly TableColumn<Target>[] = [
  { key: 'role', header: 'Role', render: (row) => row.role_title },
  { key: 'skill', header: 'Skill', render: (row) => row.skill_name },
  { key: 'level', header: 'Target level', render: (row) => LEVEL_LABELS[row.target_level] },
  { key: 'due', header: 'Due', render: (row) => (row.due_date ? formatDate(row.due_date) : '—') },
  {
    key: 'meeting',
    header: 'Meeting it',
    render: (row) => `${row.members_meeting} of ${row.members_total} people`,
  },
];

const LEVEL_OPTIONS = LEVEL_ORDER.map((level) => ({ value: level, label: LEVEL_LABELS[level] }));

const nameOf = (row: DraftRow) => `${row.role_title}: ${row.skill_name}`;

interface DraftProps {
  readonly organisationId: number;
  readonly targets: Targets;
  readonly roles: readonly RoleSummary[];
  readonly onSaved: (targets: Targets) => void;
  readonly onDiscard: () => void;
}

const Draft = ({ organisationId, targets, roles, onSaved, onDiscard }: DraftProps) => {
  const [rows, setRows] = useState<readonly DraftRow[]>(targets.items);
  const [suggestFor, setSuggestFor] = useState(String(roles[0]?.role_id ?? ''));
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  const update = (index: number, change: Partial<DraftRow>) =>
    setRows((current) => current.map((row, at) => (at === index ? { ...row, ...change } : row)));

  const suggest = async () => {
    setError(undefined);
    try {
      const role = await rolesApi.get(Number(suggestFor));
      setRows((current) => [
        ...current,
        ...role.skills
          .filter(
            (skill) =>
              !current.some(
                (row) => row.role_id === role.role_id && row.skill_id === skill.skill_id,
              ),
          )
          .map((skill) => ({
            role_id: role.role_id,
            role_title: role.title,
            skill_id: skill.skill_id,
            skill_name: skill.skill_name,
            target_level: skill.target_level,
            due_date: null,
          })),
      ]);
    } catch (suggestError) {
      setError(describeError(suggestError));
    }
  };

  const save = async () => {
    setIsSaving(true);
    setError(undefined);
    try {
      onSaved(
        await organisationsApi.setTargets(
          organisationId,
          rows.map(({ role_id, skill_id, target_level, due_date }) => ({
            role_id,
            skill_id,
            target_level,
            due_date,
          })),
        ),
      );
    } catch (saveError) {
      setError(describeError(saveError));
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {error && <Alert variant="error">{error}</Alert>}
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-64">
          <Select
            label="Suggest targets for"
            options={roles.map((role) => ({ value: String(role.role_id), label: role.title }))}
            value={suggestFor}
            onChange={(event) => setSuggestFor(event.target.value)}
          />
        </div>
        <Button variant="transparent" border="solid" fullWidth={false} onClick={suggest}>
          Add suggestions
        </Button>
      </div>
      <p className="text-[13px] text-slate-600">
        Suggestions use the level each role needs at its mid title. Change any level before you
        approve.
      </p>

      <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full border-collapse text-[14px]">
          <caption className="sr-only">Draft targets</caption>
          <thead className="bg-gray-50 text-left text-[13px] text-slate-700">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">
                Role and skill
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Target level
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Due
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.role_id}-${row.skill_id}`} className="border-t border-slate-100">
                <td className="px-4 py-3 text-slate-800">{nameOf(row)}</td>
                <td className="px-4 py-3">
                  <label className="sr-only" htmlFor={`level-${index}`}>
                    Target level for {nameOf(row)}
                  </label>
                  <select
                    id={`level-${index}`}
                    value={row.target_level}
                    onChange={(event) =>
                      update(index, { target_level: event.target.value as LevelName })
                    }
                    className="h-10 rounded-lg border border-slate-200 bg-white px-2"
                  >
                    {LEVEL_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <label className="sr-only" htmlFor={`due-${index}`}>
                    Due date for {nameOf(row)}
                  </label>
                  <input
                    id={`due-${index}`}
                    type="date"
                    value={row.due_date ?? ''}
                    onChange={(event) => update(index, { due_date: event.target.value || null })}
                    className="h-10 rounded-lg border border-slate-200 bg-white px-2"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    aria-label={`Remove ${nameOf(row)}`}
                    onClick={() => setRows((current) => current.filter((_, at) => at !== index))}
                    className="font-medium text-red-700 underline hover:text-red-900"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button fullWidth={false} isLoading={isSaving} onClick={save}>
          Approve and save
        </Button>
        <Button variant="transparent" border="solid" fullWidth={false} onClick={onDiscard}>
          Discard draft
        </Button>
      </div>
    </div>
  );
};

interface TargetsViewProps {
  readonly organisationId: number;
  readonly initial: Targets;
  readonly roles: readonly RoleSummary[];
}

const TargetsView = ({ organisationId, initial, roles }: TargetsViewProps) => {
  const [targets, setTargets] = useState(initial);
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <Draft
        organisationId={organisationId}
        targets={targets}
        roles={roles}
        onSaved={(saved) => {
          setTargets(saved);
          setIsEditing(false);
        }}
        onDiscard={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {targets.items.length === 0 ? (
        <p className="text-[15px] text-slate-600">No targets yet.</p>
      ) : (
        <Table
          caption="Targets"
          columns={COLUMNS}
          rows={targets.items}
          getRowKey={(row) => `${row.role_id}-${row.skill_id}`}
        />
      )}
      <Button fullWidth={false} className="self-start" onClick={() => setIsEditing(true)}>
        Edit targets
      </Button>
    </div>
  );
};

export const CompanyTargets = () => {
  const { state, retry } = useRequest(load);

  let content;
  if (state.status === 'loading') {
    content = <PageLoader title="Loading your targets" className="flex-1" />;
  } else if (state.status === 'error') {
    content = <LoadFailed error={state.error} onRetry={retry} />;
  } else {
    content = (
      <TargetsView
        organisationId={state.data.organisationId}
        initial={state.data.targets}
        roles={state.data.roles}
      />
    );
  }

  return (
    <div className="flex w-full max-w-[1100px] flex-col gap-8 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">Company targets</h1>
        <p className="max-w-[60ch] text-[15px] text-slate-600">
          Set the level each role should reach in each skill, and by when.
        </p>
      </header>
      {content}
    </div>
  );
};
