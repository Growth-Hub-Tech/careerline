import { CARD, Section, SectionHeader } from '../Section';

const PHASES = [
  {
    phase: 'Phase 1: Diagnose',
    title: 'CareerLine AI',
    text: 'Discover paths. Assess skills. Identify gaps. Recommend precise next steps. We establish the objective baseline for what is true.',
    output: 'Output: Verified Diagnostic Dossier',
  },
  {
    phase: 'Phase 2: Develop',
    title: 'Incubate / Growth Hub',
    text: 'Build skills. Complete training. Gain practical, mentor-led project experience directly targeted at identified diagnostic deficits.',
    output: 'Output: Executed Project Portfolio',
  },
  {
    phase: 'Phase 3: Apply',
    title: 'AuxHR',
    text: 'Connect verified talent with opportunities. Support structured hiring. Track organizational capability and retention over time.',
    output: 'Output: Verified Placement & Retention',
  },
] as const;

export const Ecosystem = () => (
  <Section bg="bg-terracotta-50">
    <SectionHeader
      eyebrow="The Connected Talent Ecosystem"
      title="From discovery to development."
      lead={
        <>
          CareerLine AI answers <em>&ldquo;where are you now?&rdquo;</em> and helps determine{' '}
          <em>&ldquo;what should happen next?&rdquo;</em> by operating seamlessly alongside
          specialized development and recruitment engines.
        </>
      }
    />

    <div className="mt-10 grid gap-4 md:grid-cols-3">
      {PHASES.map(({ phase, title, text, output }) => (
        <div key={title} className={`flex flex-col p-5 ${CARD}`}>
          <p className="flex items-center gap-2 text-[10.5px] font-bold tracking-wide text-[#3525cd] uppercase">
            <span className="h-2 w-2 rounded-full bg-[#4f46e5]" />
            {phase}
          </p>
          <h3 className="font-heading mt-3 text-[18px] font-semibold text-[#141b34]">{title}</h3>
          <p className="mt-2 text-[12px] leading-relaxed text-[#5a6270]">{text}</p>
          <div className="mt-auto pt-5">
            <p className="rounded-lg bg-[#f7f7fd] px-3 py-2.5 text-[11px] font-semibold text-[#141b34]">
              {output}
            </p>
          </div>
        </div>
      ))}
    </div>
  </Section>
);
