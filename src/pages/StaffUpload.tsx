import { useState, type ChangeEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { SECONDARY_ACTION } from '../components/ErrorPage';
import { QueryState } from '../components/PageState';
import { Table, type TableColumn } from '../components/Table';
import type { RoleSummary, TeamMemberCreate } from '../lib/api';
import { describeError } from '../lib/api/describeError';
import { roleQueries, useUploadRoster } from '../lib/api/queries';
import {
  readStaffList,
  STAFF_LIST_TEMPLATE,
  type StaffList,
  type StaffRow,
} from '../lib/organisation/staffList';

const TEMPLATE_HREF = `data:text/csv;charset=utf-8,${encodeURIComponent(STAFF_LIST_TEMPLATE)}`;

const COLUMNS: readonly TableColumn<StaffRow>[] = [
  { key: 'line', header: 'Row', render: (row) => row.line },
  { key: 'name', header: 'Name', render: (row) => row.values[0] },
  { key: 'email', header: 'Email', render: (row) => row.values[1] },
  { key: 'department', header: 'Department', render: (row) => row.values[2] },
  { key: 'role', header: 'Role', render: (row) => row.values[3] },
  {
    key: 'problems',
    header: 'Problems',
    render: (row) =>
      row.errors.length === 0 ? (
        <span className="text-teal-700">Ready</span>
      ) : (
        <ul className="flex flex-col gap-1 text-red-700">
          {row.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ),
  },
];

const people = (count: number) => `${count} ${count === 1 ? 'person' : 'people'}`;

const Uploader = ({ roles }: { roles: readonly RoleSummary[] }) => {
  const uploadRoster = useUploadRoster();
  const [list, setList] = useState<StaffList>();

  const members = (list?.rows ?? [])
    .map((row) => row.member)
    .filter((item): item is TeamMemberCreate => item !== null);
  const broken = (list?.rows ?? []).filter((row) => row.errors.length > 0).length;

  const choose = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    uploadRoster.reset();
    if (!file) return;
    setList(readStaffList(await file.text(), roles));
  };

  const upload = () => uploadRoster.mutate(members, { onSuccess: () => setList(undefined) });

  const result = uploadRoster.data;
  if (result) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="success">
          Added {result.added} and updated {result.updated}. Your team now has{' '}
          {people(result.members_total)}.
        </Alert>
        <Link to="/team" className={`${SECONDARY_ACTION} w-fit`}>
          Back to team audits
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="staff-list" className="text-[14px] font-medium text-slate-800">
          Staff list (CSV file)
        </label>
        <input
          id="staff-list"
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => void choose(event)}
          className="text-[14px] text-slate-700 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:font-medium file:text-indigo-800"
        />
      </div>

      {uploadRoster.isError && <Alert variant="error">{describeError(uploadRoster.error)}</Alert>}
      {list?.problem && <Alert variant="error">{list.problem}</Alert>}

      {list && list.rows.length > 0 && (
        <>
          {broken > 0 ? (
            <Alert variant="error">
              {broken} {broken === 1 ? 'row needs' : 'rows need'} fixing before you can upload.
            </Alert>
          ) : (
            <p className="text-[15px] text-slate-700">{people(members.length)} ready to upload.</p>
          )}
          <Table
            caption="Staff list preview"
            columns={COLUMNS}
            rows={list.rows}
            getRowKey={(row) => String(row.line)}
          />
          {broken === 0 && (
            <Button
              fullWidth={false}
              className="self-start"
              isLoading={uploadRoster.isPending}
              onClick={upload}
            >
              Upload {people(members.length)}
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export const StaffUpload = () => {
  const roles = useQuery(roleQueries.list());

  return (
    <div className="flex w-full max-w-[1100px] flex-col gap-8 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-3">
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">Upload staff list</h1>
        <p className="max-w-[65ch] text-[15px] text-slate-600">
          Fill in one row per person: name, work email, department and role. We check every row
          before anything is uploaded.
        </p>
        <a
          href={TEMPLATE_HREF}
          download="staff-list-template.csv"
          className="w-fit font-medium text-indigo-700 underline hover:text-indigo-900"
        >
          Download the template
        </a>
      </header>
      <QueryState query={roles} loadingTitle="Loading">
        {(list) => <Uploader roles={list} />}
      </QueryState>
    </div>
  );
};
