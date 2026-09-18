import type { ReactNode } from 'react';
import {
  HiOutlineCpuChip,
  HiOutlineChartBar,
  HiOutlineUserGroup,
  HiOutlineRocketLaunch,
  HiOutlineShieldCheck,
} from 'react-icons/hi2';

const ICON_SIZE = 20;

const CONTAINER = 'mx-auto w-full max-w-[1200px] px-6 lg:px-8';

interface Reason {
  readonly label: string;
  readonly description: string;
  readonly icon: ReactNode;
}

const REASONS: readonly Reason[] = [
  {
    label: 'One engine, four doors',
    description:
      'A beginner, an HR lead, a recruiter and a professional all run on the same test. Nothing to stitch together.',
    icon: <HiOutlineCpuChip size={ICON_SIZE} aria-hidden="true" />,
  },
  {
    label: 'Matched to your real constraints',
    description:
      'Your time and budget count as much as your interests, so the path you get is one you can finish.',
    icon: <HiOutlineUserGroup size={ICON_SIZE} aria-hidden="true" />,
  },
  {
    label: 'Measured against the role',
    description:
      'Scores are benchmarked against what the role genuinely requires, not graded against whoever else took the test.',
    icon: <HiOutlineChartBar size={ICON_SIZE} aria-hidden="true" />,
  },
  {
    label: 'The loop closes itself',
    description:
      'Every gap arrives with the specific programme that closes it, then a re-test to prove it worked.',
    icon: <HiOutlineRocketLaunch size={ICON_SIZE} aria-hidden="true" />,
  },
  {
    label: 'Built for decisions that matter',
    description:
      'Scoring is calibrated for bias, and every result stays a decision-support input — never an automatic pass or fail.',
    icon: <HiOutlineShieldCheck size={ICON_SIZE} aria-hidden="true" />,
  },
] as const;

export const WhyChooseUs = () => (
  <section className="w-full bg-white py-20 lg:py-28">
    <div className={CONTAINER}>
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 className="text-[34px] leading-[1.15] font-bold tracking-tight text-[#1f2a44] lg:text-[38px]">
              Diagnosis and guidance, not another quiz
            </h2>
            <p className="mt-5 max-w-[40ch] text-[15px] leading-relaxed text-[#6b7280]">
              What path genuinely fits this person, how their skill compares to the standard, and
              what to do next.
            </p>

            <div aria-hidden="true" className="mt-8 h-px w-16 bg-[#4a3f8c]/30" />

            <p className="mt-6 max-w-[38ch] text-[13px] leading-relaxed text-[#9ca3af]">
              One shared skill profile per person, readable by AuxHR and Incubate without
              re-entering anything.
            </p>
          </div>
        </div>

        <ul className="lg:col-span-8">
          {REASONS.map(({ label, description, icon }, index) => (
            <li
              key={label}
              className="flex items-start gap-4 border-t border-[#e6e7ee] py-7 last:border-b sm:gap-6"
            >
              <span
                aria-hidden="true"
                className="w-6 shrink-0 pt-2.5 text-[13px] font-semibold text-[#c4c7d2] tabular-nums"
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f4f3f9] text-[#4a3f8c]"
              >
                {icon}
              </span>

              <div className="min-w-0 pt-1">
                <h3 className="text-[18px] leading-snug font-semibold tracking-tight text-[#1f2a44]">
                  {label}
                </h3>
                <p className="mt-1.5 max-w-[52ch] text-sm leading-relaxed text-[#6b7280]">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);
