import { useState } from 'react';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { PageLoader } from '../components/Loader';
import { LoadFailed } from '../components/PageState';
import { Select } from '../components/Select';
import { Table, type TableColumn } from '../components/Table';
import { TextField } from '../components/TextField';
import {
  accountsApi,
  organisationsApi,
  type OrganisationRole,
  type OrganisationUser,
} from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { describeError } from '../lib/api/describeError';
import { formatDate } from '../lib/format';
import { useRequest } from '../lib/hooks/useRequest';

const ROLES: readonly { value: OrganisationRole; label: string; article: string }[] = [
  { value: 'owner', label: 'Owner', article: 'an owner' },
  { value: 'admin', label: 'Admin', article: 'an admin' },
  { value: 'recruiter', label: 'Recruiter', article: 'a recruiter' },
];

const roleLabel = (role: OrganisationRole) => ROLES.find((item) => item.value === role)?.label;
const roleArticle = (role: OrganisationRole) =>
  ROLES.find((item) => item.value === role)?.article ?? role;

const describeAddError = (error: unknown) =>
  error instanceof ApiError && error.status === 404
    ? 'There is no account with that email. Ask them to sign up first, then add them.'
    : describeError(error);

const load = async () => {
  const account = await accountsApi.me();
  const organisationId = account.organisation_id ?? null;
  if (organisationId === null) return { account, organisationId, users: [] };
  const list = await organisationsApi.listUsers(organisationId);
  return { account, organisationId, users: list.items };
};

interface PeopleProps {
  readonly organisationId: number;
  readonly initial: readonly OrganisationUser[];
  readonly canManage: boolean;
}

const People = ({ organisationId, initial, canManage }: PeopleProps) => {
  const [users, setUsers] = useState(initial);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrganisationRole>('recruiter');
  const [isAdding, setIsAdding] = useState(false);
  const [removing, setRemoving] = useState<OrganisationUser | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();

  const replace = (updated: OrganisationUser) =>
    setUsers((current) =>
      current.map((item) => (item.learner_id === updated.learner_id ? updated : item)),
    );

  const add = async () => {
    setIsAdding(true);
    setError(undefined);
    setNotice(undefined);
    try {
      const added = await organisationsApi.addUser(organisationId, email.trim(), role);
      setUsers((current) => [...current, added]);
      setNotice(`${added.full_name} can now sign in to this organisation.`);
      setEmail('');
    } catch (addError) {
      setError(describeAddError(addError));
    }
    setIsAdding(false);
  };

  const change = async (person: OrganisationUser, next: OrganisationRole) => {
    setError(undefined);
    setNotice(undefined);
    try {
      replace(await organisationsApi.changeRole(organisationId, person.learner_id, next));
      setNotice(`${person.full_name} is now ${roleArticle(next)}.`);
    } catch (changeError) {
      setError(describeError(changeError));
    }
  };

  const remove = async () => {
    if (!removing) return;
    setIsRemoving(true);
    setError(undefined);
    try {
      await organisationsApi.removeUser(organisationId, removing.learner_id);
      setUsers((current) => current.filter((item) => item.learner_id !== removing.learner_id));
      setNotice(`${removing.full_name} no longer has access.`);
      setRemoving(null);
    } catch (removeError) {
      setError(describeError(removeError));
      setRemoving(null);
    }
    setIsRemoving(false);
  };

  const columns: TableColumn<OrganisationUser>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <span className="flex flex-col">
          <span className="font-medium">{row.full_name}</span>
          <span className="text-[13px] text-slate-500">{row.email}</span>
        </span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) =>
        canManage ? (
          <>
            <label className="sr-only" htmlFor={`role-${row.learner_id}`}>
              Role for {row.full_name}
            </label>
            <select
              id={`role-${row.learner_id}`}
              value={row.role}
              onChange={(event) => void change(row, event.target.value as OrganisationRole)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-2"
            >
              {ROLES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </>
        ) : (
          roleLabel(row.role)
        ),
    },
    { key: 'added', header: 'Added', render: (row) => formatDate(row.added_at) },
  ];

  if (canManage) {
    columns.push({
      key: 'remove',
      header: 'Remove',
      render: (row) => (
        <button
          type="button"
          aria-label={`Remove ${row.full_name}`}
          onClick={() => setRemoving(row)}
          className="font-medium text-red-700 underline hover:text-red-900"
        >
          Remove
        </button>
      ),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <Alert variant="error">{error}</Alert>}
      {notice && <Alert variant="success">{notice}</Alert>}

      {canManage ? (
        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-[20px] font-bold text-slate-800">Add a person</h2>
          <p className="text-[14px] text-slate-600">
            They need a CareerLine AI account first. Owners and admins can change users; recruiters
            can send tests.
          </p>
          <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Select
              label="Role"
              options={ROLES}
              value={role}
              onChange={(event) => setRole(event.target.value as OrganisationRole)}
            />
          </div>
          <Button
            fullWidth={false}
            className="self-start"
            disabled={!email.includes('@')}
            isLoading={isAdding}
            onClick={add}
          >
            Add person
          </Button>
        </section>
      ) : (
        <p className="text-[15px] text-slate-600">
          Only owners and admins can change who has access.
        </p>
      )}

      <Table
        caption="People with access"
        columns={columns}
        rows={users}
        getRowKey={(row) => String(row.learner_id)}
      />

      <Dialog
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title={`Remove ${removing?.full_name ?? ''}?`}
        description="Their own account stays. They lose access to this organisation."
        footer={
          <>
            <Button
              variant="transparent"
              border="solid"
              fullWidth={false}
              onClick={() => setRemoving(null)}
            >
              Keep
            </Button>
            <Button fullWidth={false} isLoading={isRemoving} onClick={remove}>
              Remove
            </Button>
          </>
        }
      />
    </div>
  );
};

export const Users = () => {
  const { state, retry } = useRequest(load);

  let content;
  if (state.status === 'loading') {
    content = <PageLoader title="Loading the people" className="flex-1" />;
  } else if (state.status === 'error') {
    content = <LoadFailed error={state.error} onRetry={retry} />;
  } else if (state.data.organisationId === null) {
    content = (
      <p className="text-[15px] text-slate-600">Your account is not part of an organisation yet.</p>
    );
  } else {
    const myRole = state.data.account.organisation_role;
    content = (
      <People
        organisationId={state.data.organisationId}
        initial={state.data.users}
        canManage={myRole === 'owner' || myRole === 'admin'}
      />
    );
  }

  return (
    <div className="flex w-full max-w-[1000px] flex-col gap-8 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">Users</h1>
        <p className="text-[15px] text-slate-600">People who can sign in to your organisation.</p>
      </header>
      {content}
    </div>
  );
};
