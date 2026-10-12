import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuChevronDown } from 'react-icons/lu';

interface Intent {
  readonly label: string;
  readonly path: string;
}

const INTENTS: readonly Intent[] = [
  { label: 'test myself', path: '/self-test' },
  { label: 'discover my career path', path: '/beginner/sign-up' },
  { label: 'test a candidate', path: '/recruiter/sign-up' },
  { label: 'audit my team', path: '/organization/sign-up' },
];

const CONTINUE_PATH = '/question';

export const HeroCard = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex w-full max-w-[864px] flex-col items-center gap-6 rounded-3xl bg-indigo-200 px-5 py-12 sm:px-10 lg:min-h-[608px] lg:justify-center lg:px-[88px]">
      <h1 className="text-center font-heading text-[28px] leading-[1.25] font-bold text-slate-950 sm:text-[36px]">
        Discover the right career path, assess talents, validate capabilities
      </h1>

      <div className="mt-4 flex w-full overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <span className="flex items-center px-4 text-[20px] text-gray-700 sm:px-12 sm:text-[32px]">
          I want to
        </span>
        <div className="relative flex-1 border-l border-slate-100">
          <select
            value={selected}
            onChange={(e) => setSelected(Number(e.target.value))}
            aria-label="What do you want to do"
            className="h-[72px] w-full appearance-none bg-transparent pr-12 pl-4 text-[20px] text-indigo-800 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 sm:h-[94px] sm:pl-12 sm:text-[32px]"
          >
            {INTENTS.map(({ label }, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
          <LuChevronDown
            size={22}
            className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-slate-950"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate(INTENTS[selected].path)}
        className="h-[66px] w-full rounded-full bg-slate-950 text-[18px] font-semibold text-white transition-colors hover:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Start Testing
      </button>

      <button
        type="button"
        onClick={() => navigate(CONTINUE_PATH)}
        className="text-[17px] text-slate-950 hover:underline"
      >
        Or continue from where you stopped
      </button>
    </div>
  );
};
