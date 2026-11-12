import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { SECONDARY_ACTION } from '../components/ErrorPage';
import { QueryState } from '../components/PageState';
import { StatusLabel } from '../components/StatusLabel';
import { Table, type TableColumn } from '../components/Table';
import type { AssessmentSummary, Organisation, Role, TeamMember } from '../lib/api';
import { describeError } from '../lib/api/describeError';
import {
  catalogQueries,
  combineResults,
  organisationQueries,
  roleQueries,
  useStartAudit,
} from '../lib/api/queries';
import { MEMBER_STATUS } from '../lib/organisation/labels';
import { assignedTestTitle, auditFor, pageCount, pageOf } from '../lib/organisation/assignments';

const PAGE_SIZE = 20;

const people = (count: number) => `${count} ${count === 1 ? 'person' : 'people'}`;

interface ReviewProps {
  readonly organisation: Organisation;
  readonly members: readonly TeamMember[];
  readonly roles: ReadonlyMap<number, Role>;
  readonly tests: readonly AssessmentSummary[];
}

const Review = ({ organisation, members, roles, tests }: ReviewProps) => {
  const navigate = useNavigate();
  const startAudit = useStartAudit();
  const [page, setPage] = useState(1);
  const [assigned, setAssigned] = useState<ReadonlySet<number>>(new Set());

  const testFor = (person: TeamMember) => assignedTestTitle(roles.get(person.role_id), tests);
  const assignable = members.filter(
    (person) => person.status === 'not_invited' && testFor(person) !== null,
  );
  const pages = pageCount(members.length, PAGE_SIZE);
  const hasSeats = assigned.size <= organisation.seats_total;

  const toggle = (memberId: number) =>
    setAssigned((current) => {
      const next = new Set(current);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });

  const send = () =>
    startAudit.mutate(auditFor(members, assigned, new Date()), {
      onSuccess: (audit) => navigate(`/team/audits/${audit.audit_id}`),
    });

  const columns: readonly TableColumn<TeamMember>[] = [
    { key: 'name', header: 'Employee’s name', render: (person) => person.full_name },
    { key: 'role', header: 'Role', render: (person) => person.role_title },
    {
      key: 'test',
      header: 'Assigned test',
      render: (person) =>
        testFor(person) ?? <span className="text-slate-500">No test for this role yet</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (person) => {
        if (person.status !== 'not_invited') {
          const status = MEMBER_STATUS[person.status];
          return <StatusLabel status={status.tone}>{status.label}</StatusLabel>;
        }
        if (testFor(person) === null) return null;
        const isAssigned = assigned.has(person.member_id);
        return (
          <button
            type="button"
            aria-pressed={isAssigned}
            aria-label={`${isAssigned ? 'Assigned' : 'Assign test'}: ${person.full_name}`}
            onClick={() => toggle(person.member_id)}
            className={`rounded-full border px-3 py-1 text-[13px] font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
              isAssigned
                ? 'border-teal-700 bg-teal-700 text-white hover:bg-teal-800'
                : 'border-slate-300 text-slate-700 hover:border-teal-700 hover:text-teal-800'
            }`}
          >
            {isAssigned ? 'Assigned' : 'Assign test'}
          </button>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {startAudit.isError && <Alert variant="error">{describeError(startAudit.error)}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="transparent"
          border="solid"
          fullWidth={false}
          disabled={assignable.length === 0}
          onClick={() => setAssigned(new Set(assignable.map((person) => person.member_id)))}
        >
          Assign everyone
        </Button>
        <nav aria-label="Pages" className="flex items-center gap-2">
          <Button
            variant="transparent"
            border="solid"
            fullWidth={false}
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <p className="min-w-24 rounded-lg border border-teal-300 px-4 py-2.5 text-center text-[15px] text-slate-800">
            {page} of {pages}
          </p>
          <Button
            variant="transparent"
            border="solid"
            fullWidth={false}
            disabled={page === pages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </nav>
      </div>

      <Table
        caption="Staff, their roles and tests"
        columns={columns}
        rows={pageOf(members, page, PAGE_SIZE)}
        getRowKey={(person) => String(person.member_id)}
      />

      {!hasSeats && (
        <Alert variant="warning">
          <span className="flex flex-wrap gap-x-2">
            <span>
              You need {assigned.size} seats but have {organisation.seats_total}.
            </span>
            <Link
              to={`/pricing?return=${encodeURIComponent('/team/audits/new')}`}
              className="font-medium underline"
            >
              Buy seats
            </Link>
          </span>
        </Alert>
      )}

      <Button
        variant="teal"
        fullWidth={false}
        className="self-end px-8"
        disabled={assigned.size === 0 || !hasSeats}
        isLoading={startAudit.isPending || startAudit.isSuccess}
        onClick={send}
      >
        Send tests to {people(assigned.size)}
      </Button>
    </div>
  );
};

export const StartAudit = () => {
  const team = useQueries({
    queries: [organisationQueries.me(), organisationQueries.members(), catalogQueries.tests()],
    combine: combineResults,
  });
  const roleIds = [...new Set((team.data?.[1] ?? []).map((person) => person.role_id))];
  const roleDetails = useQueries({
    queries: roleIds.map((roleId) => roleQueries.detail(roleId)),
    combine: combineResults,
  });

  return (
    <div className="flex w-full max-w-[1200px] flex-col gap-8 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-[28px] leading-[1.25] font-bold text-slate-800">
          Review each person’s role and test
        </h1>
        <p className="max-w-[70ch] text-[15px] text-slate-600">
          CareerLine AI has matched each person to the test for their role. Confirm who should take
          it, then send the tests. Each person gets an email with a link.
        </p>
      </header>
      <QueryState query={team} loadingTitle="Loading your team">
        {([organisation, members, tests]) =>
          members.length === 0 ? (
            <div className="flex flex-col gap-4">
              <p className="text-[15px] text-slate-600">
                Upload your staff list before you start an audit.
              </p>
              <Link to="/team/import" className={`${SECONDARY_ACTION} w-fit`}>
                Upload staff list
              </Link>
            </div>
          ) : (
            <QueryState query={roleDetails} loadingTitle="Matching roles to tests">
              {(roles) => (
                <Review
                  organisation={organisation}
                  members={members}
                  roles={new Map(roles.map((role) => [role.role_id, role]))}
                  tests={tests}
                />
              )}
            </QueryState>
          )
        }
      </QueryState>
    </div>
  );
};
