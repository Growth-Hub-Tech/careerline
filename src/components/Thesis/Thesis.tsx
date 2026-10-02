import type { ReactNode } from 'react';
import { LuLightbulb, LuTrendingUp, LuRoute } from 'react-icons/lu';
import { Section, SectionHeader } from '../Section';

interface Pillar {
  readonly icon: ReactNode;
  readonly title: string;
  readonly text: string;
}

const PILLARS: readonly Pillar[] = [
  {
    icon: <LuLightbulb size={18} />,
    title: 'Empirical Diagnostics',
    text: 'Measure applied reasoning and contextual skills rather than static keyword matching or self-reported lists.',
  },
  {
    icon: <LuTrendingUp size={18} />,
    title: 'Standardized Benchmarks',
    text: 'Calibrate capability against verified real-world industry benchmarks, not subjective resume exaggerations.',
  },
  {
    icon: <LuRoute size={18} />,
    title: 'Prescriptive Pathways',
    text: 'Every identified delta connects directly to vetted modules to transform identified gaps into verified competence.',
  },
];

const LEAD = (
  <>
    <span className="lg:block">
      A job title doesn't always tell the whole story. A CV doesn't always show what someone can
      actually do.
    </span>{' '}
    <span className="lg:block">
      And a personality quiz shouldn't decide someone's entire career. CareerLine AI brings together
      career discovery,
    </span>{' '}
    <span className="lg:block">
      skill assessment, benchmarking, and actionable recommendations to help people and
      organizations make better-informed
    </span>{' '}
    <span className="lg:block">decisions about talent.</span>
  </>
);

export const Thesis = () => (
  <Section>
    <SectionHeader
      center
      eyebrow="The CareerLine AI Thesis"
      title="Your career deserves more than guesswork."
      leadClassName="max-w-[62ch] lg:max-w-none"
      lead={LEAD}
    />

    <div className="mx-auto mt-10 grid max-w-250 gap-4 md:grid-cols-3">
      {PILLARS.map(({ icon, title, text }) => (
        <div key={title} className="rounded-2xl bg-[#f7f7fd] p-5">
          <span className="text-[#4f46e5]">{icon}</span>
          <h3 className="font-heading mt-2 text-[15px] font-semibold text-[#141b34]">{title}</h3>
          <p className="mt-2 text-[12.5px] leading-relaxed text-[#5a6270]">{text}</p>
        </div>
      ))}
    </div>
  </Section>
);
