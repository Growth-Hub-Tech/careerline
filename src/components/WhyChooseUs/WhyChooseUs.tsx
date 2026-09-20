import { PageContainer } from '../PageContainer';
import { LuUsers, LuTarget, LuArrowUpRight, LuFileCheck } from 'react-icons/lu';

interface Reason {
  icon: React.ReactNode;
  title: string;
  body: string;
}

const REASONS: Reason[] = [
  {
    icon: <LuUsers size={20} />,
    title: 'One engine, every audience',
    body: 'Beginners, organizations, recruiters, and professionals all get tested against the same standard.',
  },
  {
    icon: <LuTarget size={20} />,
    title: 'Benchmarked, not guessed',
    body: 'Scored against the Global Standard for the role, not a generic aptitude test.',
  },
];

export const WhyChooseUs = () => (
  <section className="w-full bg-white py-20 lg:py-28">
    <PageContainer>
      <div className="mx-auto w-full max-w-[1200px] px-6 lg:px-8">
        {/* Header */}
        <span className="inline-flex items-center rounded-full border border-[#e6e6ef] px-4 py-1.5 text-xs font-medium tracking-wide text-[#6b7280]">
          WHY CHOOSE US
        </span>

        <h2 className="mt-5 text-[34px] font-bold leading-[1.15] tracking-tight text-[#1f2a44] lg:text-[42px]">
          Why <span className="text-[#4a3f8c]">CareerLine AI</span> is the right choice for you
        </h2>

        {/* Bento grid */}
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {REASONS.map((reason) => (
            <div key={reason.title} className="rounded-2xl bg-[#f7f7fb] p-7 lg:col-span-1">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e6e6ef] bg-white text-[#4a3f8c]">
                {reason.icon}
              </div>

              <h3 className="mt-6 text-[19px] font-bold tracking-tight text-[#1f2a44]">
                {reason.title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[#6b7280]">{reason.body}</p>
            </div>
          ))}

          {/* Dark CTA card, spans both rows on the right */}
          <div className="flex flex-col justify-between rounded-2xl bg-[#1f2a44] p-8 lg:col-start-3 lg:row-span-2 lg:row-start-1">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-[#dda01a]">
                <LuFileCheck size={20} />
              </div>

              <h3 className="mt-6 text-[19px] font-bold leading-snug tracking-tight text-white">
                Get your score
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-white/60">
                Take a role-specific test and get a scored report with strengths, weaknesses, and a
                clear next step.
              </p>
            </div>

            <button className="mt-8 inline-flex w-fit items-center gap-2.5 rounded-full bg-[#dda01a] px-7 py-3.5 text-[15px] font-semibold text-[#1f2a44]">
              Start free test
              <LuArrowUpRight size={18} />
            </button>
          </div>

          {/* Wide card, spans first two columns */}
          <div className="rounded-2xl bg-[#f7f7fb] p-7 lg:col-span-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e6e6ef] bg-white text-[#4a3f8c]">
              <LuArrowUpRight size={20} />
            </div>

            <h3 className="mt-6 text-[19px] font-bold tracking-tight text-[#1f2a44]">
              Every gap has a next step
            </h3>
            <p className="mt-3 max-w-[52ch] text-[14px] leading-relaxed text-[#6b7280]">
              A weakness comes with a matched Incubate programme or partner recommendation, not just
              a number.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  </section>
);
