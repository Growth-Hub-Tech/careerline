import { useQueries, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { QueryState } from '../components/PageState';
import { hasStatus } from '../lib/api/ApiError';
import {
  beginnerQueries,
  combineResults,
  organisationQueries,
  recruiterQueries,
  resultQueries,
} from '../lib/api/queries';
import {
  beginnerTasks,
  organisationTasks,
  professionalTasks,
  recruiterTasks,
  type Task,
} from '../lib/tasks/buildTasks';
import { useCurrentUser, type UserType } from '../lib/user';

const LOADING = 'Loading your tasks';

const TaskList = ({ tasks }: { tasks: readonly Task[] }) =>
  tasks.length === 0 ? (
    <p className="text-[15px] text-slate-600">Nothing to do right now.</p>
  ) : (
    <ul aria-label="Your tasks" className="flex flex-col gap-3">
      {tasks.map((task) => (
        <li
          key={task.id}
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="text-[15px] text-slate-800">
            {task.waiting && <span className="sr-only">Waiting: </span>}
            {task.text}
          </span>
          <Link
            to={task.to}
            className="shrink-0 font-medium text-indigo-700 underline hover:text-indigo-900"
          >
            {task.action}
          </Link>
        </li>
      ))}
    </ul>
  );

// Each list reads the same cached data as the pages it links to

const BeginnerTasks = () => {
  const path = useQuery(beginnerQueries.recommendations());

  // No career paths yet (404) is a task in itself, not a failure
  if (path.isError && hasStatus(path.error, 404)) return <TaskList tasks={beginnerTasks(null)} />;

  return (
    <QueryState query={path} loadingTitle={LOADING}>
      {(data) => <TaskList tasks={beginnerTasks(data)} />}
    </QueryState>
  );
};

const ProfessionalTasks = () => {
  const results = useQuery(resultQueries.list());

  return (
    <QueryState query={results} loadingTitle={LOADING}>
      {(list) => <TaskList tasks={professionalTasks(list)} />}
    </QueryState>
  );
};

const RecruiterTasks = () => {
  const invitations = useQuery(recruiterQueries.invitations());

  return (
    <QueryState query={invitations} loadingTitle={LOADING}>
      {(list) => <TaskList tasks={recruiterTasks(list)} />}
    </QueryState>
  );
};

const OrganisationTasks = () => {
  const team = useQueries({
    queries: [organisationQueries.audits(), organisationQueries.members()],
    combine: combineResults,
  });

  return (
    <QueryState query={team} loadingTitle={LOADING}>
      {([audits, members]) => <TaskList tasks={organisationTasks(audits, members)} />}
    </QueryState>
  );
};

const TASKS_FOR: Record<UserType, () => React.JSX.Element> = {
  beginner: BeginnerTasks,
  'self-test': ProfessionalTasks,
  recruiter: RecruiterTasks,
  organization: OrganisationTasks,
};

export const Tasks = () => {
  const { userType } = useCurrentUser();
  const UserTasks = TASKS_FOR[userType];

  return (
    <div className="flex w-full max-w-[900px] flex-col gap-8 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">Tasks</h1>
        <p className="text-[15px] text-slate-600">What to do next, worked out from your account.</p>
      </header>
      <UserTasks />
    </div>
  );
};
