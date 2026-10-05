import {
  LuCircleCheck,
  LuTriangleAlert,
  LuTrendingUp,
  LuSparkles,
  LuArrowRight,
} from 'react-icons/lu';
import { Section, SectionHeader } from '../Section';

const STRENGTHS = [
  { name: 'User Research & Synthesis', value: '88%' },
  { name: 'Interaction Design & Flows', value: '76%' },
  { name: 'Interactive Prototyping', value: '85%' },
] as const;

const GAPS = [
  { name: 'Product Strategy & Metrics', value: '61% (Gap)' },
  { name: 'Data-informed Design Loops', value: '59% (Gap)' },
] as const;

export const Diagnostic = () => (
  <Section bg="bg-amber-50">
    <SectionHeader
      center
      eyebrow="Prescriptive Intelligence"
      title="A score is useful."
      accent="Knowing what to do about it is better."
      lead="Raw data without direction creates paralysis. CareerLine AI automatically translates identified competency gaps into focused, time-bounded learning interventions."
    />

    <div className="mx-auto mt-10 max-w-[700px] rounded-3xl bg-white p-5 shadow-[0_12px_40px_rgba(53,37,205,0.10)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10.5px] font-semibold text-[#3525cd]">
            Assessment Evaluation Completed
          </p>
          <h3 className="font-heading mt-1 text-[20px] font-semibold text-[#141b34]">
            Skill Diagnostic Breakdown
          </h3>
          <p className="mt-1 text-[10.5px] text-[#5a6270]">
            Product Design Track • Senior Benchmark Target
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10.5px] text-[#5a6270]">Your Skill Score</p>
            <p className="font-heading text-[22px] font-bold text-[#141b34]">
              78 <span className="text-[12px] font-medium text-[#5a6270]">/100</span>
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4f46e5] text-white">
            <LuTrendingUp size={18} />
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-[#f7f7fd] p-3">
          <p className="font-heading flex items-center gap-2 px-1 text-[13px] font-medium text-[#141b34]">
            <LuCircleCheck size={15} className="text-[#3525cd]" />
            Verified Strengths
          </p>
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {STRENGTHS.map(({ name, value }) => (
              <li
                key={name}
                className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 text-[12px] text-[#141b34]"
              >
                {name}
                <span className="font-semibold text-[#3525cd]">{value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-[#f7f7fd] p-3">
          <p className="font-heading flex items-center gap-2 px-1 text-[13px] font-medium text-[#141b34]">
            <LuTriangleAlert size={15} className="text-[#b42318]" />
            Development Areas
          </p>
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {GAPS.map(({ name, value }) => (
              <li
                key={name}
                className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 text-[12px] text-[#141b34]"
              >
                {name}
                <span className="font-semibold text-[#b42318]">{value}</span>
              </li>
            ))}
            <li className="rounded-lg bg-[#fdeeee] px-3 py-2 text-[10.5px] leading-relaxed text-[#5a6270]">
              Addressing these two areas bridges the target Senior threshold (82 pts).
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 rounded-xl bg-[#3525cd] p-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium">
            <LuSparkles size={10} />
            Prescribed Targeted Action
          </span>
          <h4 className="font-heading mt-2 text-[18px] font-semibold">
            Product Strategy for Designers
          </h4>
          <p className="mt-1 max-w-[46ch] text-[11.5px] leading-relaxed text-white/75">
            4 targeted modules, 12 practical drills focused specifically on product metrics, OKR
            alignment, and unit economics.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-white px-4 text-[12px] font-semibold text-[#3525cd] transition-colors hover:bg-[#f1f2fc]"
        >
          View Recommendation
          <LuArrowRight size={13} />
        </button>
      </div>

      <p className="mt-4 text-center text-[10.5px] text-[#5a6270]">
        Recommendations are dynamically curated based on precise deficit vectors, saving ~40 hours
        of redundant study.
      </p>
    </div>
  </Section>
);
