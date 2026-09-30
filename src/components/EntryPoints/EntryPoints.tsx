import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuCompass, LuGauge, LuClipboardCheck, LuNetwork } from 'react-icons/lu';
import { CARD, Section, SectionHeader } from '../Section';

interface EntryPoint {
  readonly icon: ReactNode;
  readonly tile: string;
  readonly path: string;
  readonly audience: string;
  readonly title: string;
  readonly text: string;
  readonly cta: string;
  readonly to: string;
}

// Update the `to` routes if yours differ.
const ENTRY_POINTS: readonly EntryPoint[] = [
  {
    icon: <LuCompass size={18} />,
    tile: 'bg-[#e4e2ff] text-[#3525cd]',
    path: 'Path 01',
    audience: 'For Beginners & Changers',
    title: 'Discover your career path',
    text: 'Not sure which tech career is right for you? Answer questions about your interests, goals, strengths, available time, and circumstances to discover career paths that fit you.',
    cta: 'Find My Path',
    to: '/question',
  },
  {
    icon: <LuGauge size={18} />,
    tile: 'bg-[#eadcff] text-[#6d28d9]',
    path: 'Path 02',
    audience: 'For Independent Pros',
    title: 'Test your skills',
    text: 'Know your actual skill level. Take a role or skill-specific assessment and receive an objective report showing your strengths, development areas, and recommended next steps.',
    cta: 'Take a Test',
    to: '/beginner/sign-up',
  },
  {
    icon: <LuClipboardCheck size={18} />,
    tile: 'bg-[#e4e7ff] text-[#3525cd]',
    path: 'Path 03',
    audience: 'For Recruiters & TA',
    title: 'Validate talent',
    text: 'Make better-informed hiring decisions. Recruiters can assess candidates against role-specific requirements before making costly, high-stakes talent acquisition decisions.',
    cta: 'Test a Candidate',
    to: '/recruiter/sign-up',
  },
  {
    icon: <LuNetwork size={18} />,
    tile: 'bg-[#c9c8fb] text-[#3525cd]',
    path: 'Path 04',
    audience: 'For Engineering & HR Leaders',
    title: 'Audit your team',
    text: "Understand your team's capabilities. Organizations can assess their workforce, identify skill gaps, benchmark capabilities, and understand where development is needed.",
    cta: 'Audit My Team',
    to: '/organization/sign-up',
  },
];

export const EntryPoints = () => {
  const navigate = useNavigate();

  return (
    <Section id="how-it-works" bg="bg-[#f7f7fd]">
      <SectionHeader
        center
        eyebrow="Tailored Entry Points"
        title="Four paths to precision talent intelligence"
        lead="Select your lens to begin evaluating potential, validating expertise, or auditing organizational capabilities."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-start">
        {ENTRY_POINTS.map(({ icon, tile, path, audience, title, text, cta, to }) => (
          <div key={title} className={`flex flex-col p-5 ${CARD}`}>
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tile}`}>
                {icon}
              </span>
              <span className="rounded-full bg-[#eceefb] px-2.5 py-1 text-[10.5px] font-medium text-[#464555]">
                {path}
              </span>
            </div>
            <span className="mt-5 text-[10.5px] font-bold text-[#4f46e5]">{audience}</span>
            <h3 className="font-heading mt-1.5 text-[17px] font-semibold text-[#141b34]">
              {title}
            </h3>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[#5a6270]">{text}</p>
            <button
              type="button"
              onClick={() => navigate(to)}
              className="mt-5 flex h-10 w-full items-center justify-between rounded-lg bg-[#e8eaff] px-3 text-[12.5px] font-medium text-[#1f2a44] transition-colors hover:bg-[#dcdffc]"
            >
              {cta}
              <span aria-hidden="true">→</span>
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
};
