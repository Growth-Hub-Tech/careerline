import { useNavigate } from 'react-router-dom';
import { LuArrowUpRight, LuBadgeCheck, LuCompass, LuPuzzle, LuSearchCheck } from 'react-icons/lu';
import type { IconType } from 'react-icons';

interface PathOption {
  readonly key: string;
  readonly title: string;
  readonly description: string;
  readonly cta: string;
  readonly path: string;
  readonly tags: readonly string[];
  readonly icon: IconType;
  readonly iconWrap: string;
  readonly button: string;
}

const PATHS: readonly PathOption[] = [
  {
    key: 'explore',
    title: 'Discover your career path',
    description: 'Take a short assessment and get a ranked list of tech paths that fit you.',
    cta: 'Find My Path',
    path: '/sign-up',
    tags: ['beginners', 'career transition'],
    icon: LuCompass,
    iconWrap: 'bg-[#fbe4df] text-[#c9452b]',
    button: 'bg-[#cf5236] hover:bg-[#b94a30]',
  },
  {
    key: 'self-test',
    title: 'Test your skills',
    description: 'Take a skill test on your own and download a shareable report.',
    cta: 'Take a Test',
    path: '/sign-up',
    tags: ['Independent Professionals', 'Freelancers'],
    icon: LuPuzzle,
    iconWrap: 'bg-[#f8efc8] text-[#8a4a12]',
    button: 'bg-[#b87514] hover:bg-[#a16810]',
  },
  {
    key: 'hire',
    title: 'Validate talent',
    description: "Verify a candidate's real skill level before you make an offer.",
    cta: 'Test a Candidate',
    path: '/sign-up',
    tags: ['Recruiters', 'HRs', 'Hiring managers'],
    icon: LuSearchCheck,
    iconWrap: 'bg-[#e6e7f8] text-[#3f3fa8]',
    button: 'bg-[#6c5ccf] hover:bg-[#5a4bb8]',
  },
  {
    key: 'audit',
    title: 'Audit your team',
    description: 'Test your staff against the Global Standard for their roles and titles.',
    cta: 'Audit My Team',
    path: '/sign-up',
    tags: ['Team leads', 'HR Leaders', 'Founders', 'Managers'],
    icon: LuBadgeCheck,
    iconWrap: 'bg-[#d5f5e8] text-[#0f7a55]',
    button: 'bg-[#0f8f68] hover:bg-[#0c7a59]',
  },
];

export const PathOptions = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-[#2d2d39] py-12 sm:py-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="mx-auto max-w-[760px] text-center">
            <h2 className="font-heading text-[24px] leading-[1.25] font-bold text-white sm:text-[32px] lg:text-[36px]">
              Get Guidance for Career Path or Measure Skill Level, at a Global Standard.
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-[#e6e7f2] sm:mt-5 sm:text-[15px]">
              CareerLine AI tells you which career path fits you, tells organizations how their team
              measures up, and tells recruiters whether a candidate is truly ready.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4">
            {PATHS.map(
              ({ key, title, description, cta, path, tags, icon: Icon, iconWrap, button }) => (
                <div key={key} className="flex flex-col rounded-2xl bg-white p-5">
                  <span
                    className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl ${iconWrap}`}
                  >
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-4 text-center font-heading text-[20px] font-bold text-[#1f2230]">
                    {title}
                  </h3>
                  <p className="mt-3 text-center text-[13px] leading-relaxed text-[#5a6278]">
                    {description}
                  </p>

                  <div className="mt-5 flex items-center gap-3 text-[11px] text-[#5a6278]">
                    <span className="h-px flex-1 bg-[#e3e5ee]" />
                    for
                    <span className="h-px flex-1 bg-[#e3e5ee]" />
                  </div>

                  <ul className="mt-4 flex flex-1 flex-wrap content-start justify-center gap-2">
                    {tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-full bg-[#eef0f5] px-3 py-1 text-[12px] font-medium text-[#2f3347]"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => navigate(path)}
                    className={`mt-6 flex h-11 w-full items-center justify-between rounded-full px-4 text-[14px] font-medium text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C5CCF] ${button}`}
                  >
                    {cta}
                    <LuArrowUpRight size={16} />
                  </button>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
