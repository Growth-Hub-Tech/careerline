import { PageContainer } from '../PageContainer';
import { MdOutlineRecommend, MdOutlineExplore } from 'react-icons/md';
import { AiOutlineGlobal } from 'react-icons/ai';
import { LuArrowUpRight, LuMapPin } from 'react-icons/lu';

const STEPS = ['Pick a path', 'Build skills', 'Land the role'] as const;

interface Reason {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly description: string;
}

const LIST_REASONS: readonly Reason[] = [
  {
    icon: <MdOutlineRecommend size={19} />,
    label: 'Personalized to you',
    description: 'Recommendations based on your skills, interests, and career direction.',
  },
  {
    icon: <MdOutlineExplore size={19} />,
    label: 'Know what comes next',
    description: 'Clear courses, resources, and guidance without the guesswork.',
  },
  {
    icon: <AiOutlineGlobal size={19} />,
    label: 'Built for opportunity',
    description: 'Develop skills relevant to both local and global opportunities.',
  },
];

export const WhyChooseUs = () => (
  <section className="relative w-full overflow-hidden bg-[#2e2757] py-24 lg:py-32">
    {/* Ambient glow */}
    <div className="pointer-events-none absolute -right-32 top-0 h-[420px] w-[420px] rounded-full bg-[#dda01a]/10 blur-[120px]" />

    <PageContainer>
      <div className="relative mx-auto w-full max-w-[1280px]">
        {/* Header */}
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-[650px]">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#dda01a]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#dda01a]" />
              Why CareerLine AI
            </span>

            <h2 className="mt-5 text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-white md:text-[52px] lg:text-[58px]">
              Your career path,
              <br />
              <span className="text-white/45">without the guesswork.</span>
            </h2>
          </div>

          <p className="max-w-[380px] text-[15px] leading-7 text-white/55 lg:pb-1">
            CareerLine AI helps you understand where you are, what to learn next, and where those
            skills can take you.
          </p>
        </div>

        {/* Main content */}
        <div className="mt-16 grid gap-5 lg:grid-cols-12">
          {/* Career path */}
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.045] p-7 lg:col-span-7 lg:p-10">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#dda01a]/[0.07] blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-[#dda01a]">
                  <LuMapPin size={19} />
                </div>

                <span className="text-xs font-medium uppercase tracking-[0.14em] text-white/30">
                  Your journey
                </span>
              </div>

              <h3 className="mt-8 text-2xl font-semibold tracking-tight text-white">
                A clearer way forward.
              </h3>

              <p className="mt-3 max-w-[430px] text-sm leading-6 text-white/50">
                Follow a structured path that connects what you learn to where you want your career
                to go.
              </p>

              {/* Steps */}
              <div className="mt-12">
                <div className="relative flex justify-between">
                  <div className="absolute left-3 right-3 top-3.5 h-px bg-white/10" />
                  <div className="absolute left-3 top-3.5 h-px w-[48%] bg-[#dda01a]" />

                  {STEPS.map((step, i) => (
                    <div key={step} className="relative z-10 flex flex-col gap-3">
                      <div
                        className={[
                          'flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-semibold',
                          i === 0
                            ? 'border-[#dda01a] bg-[#dda01a] text-[#2e2757]'
                            : 'border-white/15 bg-[#332c5c] text-white/45',
                        ].join(' ')}
                      >
                        {i + 1}
                      </div>

                      <span
                        className={['text-xs', i === 0 ? 'text-white' : 'text-white/40'].join(' ')}
                      >
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 flex items-center gap-2 text-xs font-medium text-[#dda01a]">
                <span>Start with where you are</span>
                <LuArrowUpRight size={14} />
              </div>
            </div>
          </div>

          {/* Reasons */}
          <div className="lg:col-span-5 lg:pl-8">
            <div className="divide-y divide-white/10 border-y border-white/10">
              {LIST_REASONS.map(({ icon, label, description }, index) => (
                <div key={label} className="group flex gap-5 py-7 first:pt-6 last:pb-6">
                  <span className="pt-1 text-xs font-medium text-white/20">0{index + 1}</span>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#dda01a] transition-colors group-hover:border-[#dda01a]/30">
                    {icon}
                  </div>

                  <div>
                    <h3 className="text-[15px] font-semibold text-white">{label}</h3>

                    <p className="mt-2 max-w-[330px] text-sm leading-6 text-white/45">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  </section>
);
