import { Link, Outlet } from 'react-router-dom';
import { LuX } from 'react-icons/lu';
import { FlowHeader } from '../../components/FlowHeader';

export const TestFrame = () => (
  <div className="flex min-h-dvh flex-col bg-indigo-200">
    <FlowHeader label="Skill test" />

    <main className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
      <div className="flex w-full max-w-[960px] flex-col gap-4">
        <Link
          to="/dashboard"
          className="inline-flex w-fit items-center gap-2 rounded-md text-[14px] font-medium text-indigo-800 transition-colors hover:text-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <LuX size={16} aria-hidden="true" />
          Exit test
        </Link>
        <Outlet />
      </div>
    </main>
  </div>
);
