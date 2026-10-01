import { LuArrowRight } from 'react-icons/lu';
import { Section, SectionHeader } from '../Section';

const STEPS = [
  { title: 'ASSESS', text: 'Simulate real tasks' },
  { title: 'IDENTIFY GAP', text: 'Pinpoint deficits' },
  { title: 'RECOMMEND', text: 'Curate roadmaps' },
  { title: 'DEVELOP', text: 'Targeted training' },
  { title: 'RETEST', text: 'Validate growth' },
  { title: 'MEASURE', text: 'Quantify delta' },
] as const;

export const Calibration = () => (
  <Section bg="bg-white">
    <SectionHeader
      center
      eyebrow="Continuous Calibration"
      title="Don't stop at identifying the gap."
      lead="CareerLine AI connects assessment results with specific development recommendations and allows progress to be measured over time."
    />

    <ol className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {STEPS.map(({ title, text }, i) => {
        const last = i === STEPS.length - 1;
        return (
          <li key={title} className="rounded-xl bg-[#f7f7fd] px-3 py-4 text-center">
            <span
              className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold ${
                last ? 'bg-[#3525cd] text-white' : 'bg-[#e4e2ff] text-[#3525cd]'
              }`}
            >
              {i + 1}
            </span>
            <p className="font-heading mt-2 text-[11.5px] font-semibold tracking-wide text-[#141b34]">
              {title}
            </p>
            <p className="mt-1 text-[10.5px] text-[#5a6270]">{text}</p>
          </li>
        );
      })}
    </ol>

    <div className="mx-auto mt-8 max-w-150 rounded-3xl bg-[#e8eaff] p-4 sm:p-5">
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-bold tracking-[0.06em] text-[#3525cd] uppercase">
          Quantified Longitudinal Impact
        </span>
        <span className="text-[#5a6270]">Cohort ID: #PD-Delta-2026</span>
      </div>

      <div className="mt-3 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-xl bg-white p-4 text-center">
          <p className="text-[10.5px] font-semibold text-[#141b34]">Before Training</p>
          <p className="font-heading mt-1 text-[26px] font-bold text-[#141b34]">
            72 <span className="text-[12px] font-medium text-[#5a6270]">/100</span>
          </p>
          <p className="text-[10.5px] text-[#b42318]">Below Role Standard (80)</p>
        </div>

        <div className="flex flex-col items-center px-2 text-center">
          <LuArrowRight size={16} className="rotate-90 text-[#3525cd] sm:rotate-0" />
          <p className="mt-1 text-[10.5px] font-semibold text-[#141b34]">Recommended Development</p>
          <p className="text-[10.5px] text-[#5a6270]">Product Strategy Programme</p>
        </div>

        <div className="rounded-xl bg-white p-4 text-center">
          <p className="text-[10.5px] font-semibold text-[#3525cd]">After 4-Week Cycle</p>
          <p className="font-heading mt-1 text-[26px] font-bold text-[#3525cd]">
            86 <span className="text-[12px] font-medium text-[#5a6270]">/100</span>
          </p>
          <p className="text-[10.5px] font-semibold text-[#3525cd]">
            +14 point verified improvement
          </p>
        </div>
      </div>

      <p className="mt-3 text-center text-[10px] text-[#5a6270]">
        Illustrative example based on actual cohort longitudinal validation metrics.
      </p>
    </div>
  </Section>
);
