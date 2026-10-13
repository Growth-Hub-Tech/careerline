import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuChevronDown } from 'react-icons/lu';

interface Intent {
  readonly label: string;
  readonly path: string;
}

const INTENTS: readonly Intent[] = [
  { label: 'test myself', path: '/self-test/sign-up' },
  { label: 'discover my career path', path: '/beginner/sign-up' },
  { label: 'test a candidate', path: '/recruiter/sign-up' },
  { label: 'audit my team', path: '/organization/sign-up' },
];

const CONTINUE_PATH = '/question';

export const HeroCard = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex w-full max-w-[864px] flex-col items-center gap-5 rounded-3xl bg-indigo-200 px-4 py-8 sm:gap-6 sm:px-10 sm:py-12 lg:min-h-[608px] lg:justify-center xl:px-[88px]">
      <h1 className="text-center font-heading text-[26px] leading-[1.25] font-bold text-slate-950 sm:text-[32px] lg:text-[36px]">
        Discover the right career path, assess talents, validate capabilities
      </h1>

      <div className="@container w-full">
        <div className="mt-2 flex w-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white @lg:flex-row">
          <span className="flex items-center px-4 pt-4 text-[18px] text-gray-700 @lg:px-6 @lg:py-0 @lg:text-[24px] @2xl:px-12 @2xl:text-[28px]">
            I want to
          </span>
          <div className="relative flex-1 border-t border-slate-100 @lg:border-t-0 @lg:border-l">
            <select
              value={selected}
              onChange={(e) => setSelected(Number(e.target.value))}
              aria-label="What do you want to do"
              className="h-[60px] w-full appearance-none bg-transparent pr-12 pl-4 text-[18px] text-indigo-800 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 @lg:h-[80px] @lg:pl-6 @lg:text-[24px] @2xl:h-[94px] @2xl:pl-12 @2xl:text-[28px]"
            >
              {INTENTS.map(({ label }, index) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ))}
            </select>
            <LuChevronDown
              size={22}
              className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-950 @2xl:right-5"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate(INTENTS[selected].path)}
        className="h-14 w-full rounded-full bg-slate-950 text-[16px] font-semibold text-white transition-colors hover:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:h-[66px] sm:text-[18px]"
      >
        Start Testing
      </button>

      <button
        type="button"
        onClick={() => navigate(CONTINUE_PATH)}
        className="text-center text-[15px] text-slate-950 hover:underline sm:text-[17px]"
      >
        Or continue from where you stopped
      </button>
    </div>
  );
};
