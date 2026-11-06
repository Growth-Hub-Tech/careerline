import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PageLoader } from '../components/Loader';
import { LoadFailed } from '../components/PageState';
import { useRequest } from '../lib/hooks/useRequest';
import { useSession } from '../lib/session';
import { loadTasks } from '../lib/tasks/loadTasks';

export const Tasks = () => {
  const { session } = useSession();
  const userType = session?.user.userType ?? 'self-test';
  const load = useCallback(() => loadTasks(userType), [userType]);
  const { state, retry } = useRequest(load);

  let content;
  if (state.status === 'loading') {
    content = <PageLoader title="Loading your tasks" className="flex-1" />;
  } else if (state.status === 'error') {
    content = <LoadFailed error={state.error} onRetry={retry} />;
  } else if (state.data.length === 0) {
    content = <p className="text-[15px] text-slate-600">Nothing to do right now.</p>;
  } else {
    content = (
      <ul aria-label="Your tasks" className="flex flex-col gap-3">
        {state.data.map((task) => (
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
  }

  return (
    <div className="flex w-full max-w-[900px] flex-col gap-8 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">Tasks</h1>
        <p className="text-[15px] text-slate-600">What to do next, worked out from your account.</p>
      </header>
      {content}
    </div>
  );
};
