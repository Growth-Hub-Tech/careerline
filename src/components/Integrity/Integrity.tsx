import type { ReactNode } from 'react';
import { LuUserRound, LuUserCheck, LuUsers } from 'react-icons/lu';
import { CARD, Section, SectionHeader } from '../Section';

interface Principle {
  readonly icon: ReactNode;
  readonly title: string;
  readonly text: string;
}

const PRINCIPLES: readonly Principle[] = [
  {
    icon: <LuUserRound size={16} />,
    title: 'Career Choices',
    text: 'Individuals remain in control of their career decisions. Our scores reflect current capability alignment, never arbitrary limitations on what you can pursue.',
  },
  {
    icon: <LuUserCheck size={16} />,
    title: 'Hiring Decisions',
    text: 'Recruiters and employers remain responsible for hiring decisions. We provide unbiased signal, not automated rejection algorithms.',
  },
  {
    icon: <LuUsers size={16} />,
    title: 'Development Decisions',
    text: 'Organizations and professionals decide how to respond to identified gaps. We highlight the most efficient paths forward.',
  },
];

export const Integrity = () => (
  <Section bg="bg-[#FAF8FF]">
    <SectionHeader
      eyebrow="Algorithmic Integrity"
      title="AI should support decisions—not make them for you."
      lead="CareerLine AI provides recommendations, insights, and structured evidence. Important career, hiring, and workforce decisions remain with people."
    />

    <div className="mt-10 grid gap-4 md:grid-cols-3">
      {PRINCIPLES.map(({ icon, title, text }) => (
        <div key={title} className={`p-5 ${CARD}`}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e4e2ff] text-[#3525cd]">
            {icon}
          </span>
          <h3 className="font-heading mt-4 text-[14px] font-semibold text-[#141b34]">{title}</h3>
          <p className="mt-2 text-[12px] leading-relaxed text-[#5a6270]">{text}</p>
        </div>
      ))}
    </div>
  </Section>
);
