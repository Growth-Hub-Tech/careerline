import { Link } from 'react-router-dom';
import { PageContainer } from '../PageContainer';

interface Step {
  readonly step: string;
  readonly label: string;
  readonly description: string;
}

const STEPS: readonly Step[] = [
  {
    step: '01',
    label: 'Take the test',
    description: 'Answer questions about your skills, interests, time and budget.',
  },
  {
    step: '02',
    label: 'Get your ranked paths',
    description: 'See three career paths ranked by fit, with a clear reason for each.',
  },
  {
    step: '03',
    label: 'Close the gap',
    description: 'Get a specific programme and next step for your recommended path.',
  },
];

export const HowItWorks = () => (
  <section className="w-full bg-[#2e2757] py-20 lg:py-24">
    <PageContainer>
      <div className="mx-auto flex w-full max-w-[1280px] flex-col justify-between gap-16 lg:flex-row lg:items-center lg:gap-24">
        {/* Intro */}
        <div className="max-w-110 shrink-0">
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[#dda01a]">
            How it works
          </span>

          <h2 className="mt-4 text-[36px] font-bold leading-[1.08] tracking-tight text-white md:text-[44px]">
            From uncertainty to a clear career path.
          </h2>

          <p className="mt-5 max-w-[42ch] text-[15px] leading-7 text-white/60">
            A simple three-step process that helps you understand where you fit, why it fits, and
            what to do next.
          </p>

          <Link
            to="/beginner/sign-up"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-[#2e2757] transition-colors hover:bg-[#f1f2f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2e2757]"
          >
            Take the free test
          </Link>
        </div>

        {/* Steps */}
        <ol className="relative w-full max-w-[620px]">
          {/* Connecting line */}
          <span
            aria-hidden="true"
            className="absolute left-[27px] top-8 bottom-8 w-px bg-white/15"
          />

          {STEPS.map(({ step, label, description }) => (
            <li
              key={step}
              className="relative flex gap-6 border-b border-white/10 py-7 first:pt-0 last:border-0 last:pb-0"
            >
              {/* Number */}
              <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#2e2757] ring-1 ring-white/15">
                <span className="text-sm font-bold text-[#dda01a]">{step}</span>
              </div>

              {/* Content */}
              <div className="pt-1">
                <h3 className="text-[18px] font-semibold text-white">{label}</h3>

                <p className="mt-2 max-w-[48ch] text-sm leading-6 text-white/55">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </PageContainer>
  </section>
);
