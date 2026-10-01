import { LuCheck, LuMicroscope } from 'react-icons/lu';
import { ArrowButton, CARD, Section, SectionHeader } from '../Section';

type Tone = 'good' | 'gap';

interface Skill {
  readonly name: string;
  readonly standard: number;
  readonly score: number;
  readonly status: string;
  readonly tone: Tone;
}

const SKILLS: readonly Skill[] = [
  { name: 'UX Research', standard: 78, score: 82, status: 'Exceeds (82%)', tone: 'good' },
  { name: 'Interaction Design', standard: 80, score: 76, status: 'Developing (76%)', tone: 'good' },
  { name: 'Visual Design', standard: 75, score: 88, status: 'Strong (88%)', tone: 'good' },
  {
    name: 'Product Strategy',
    standard: 82,
    score: 61,
    status: 'Gap Identified (61%)',
    tone: 'gap',
  },
];

const FEATURES = [
  { title: 'Scenario-based problem solving:', text: 'Live prompts assessing contextual judgment.' },
  {
    title: 'Peer calibrated grading:',
    text: 'Standardized scoring verified against top 10% practitioners.',
  },
  { title: 'Anti-cheating telemetry:', text: 'Real-time behavioral integrity monitoring.' },
] as const;

export const TestEngine = () => (
  <Section id="for-organizations" bg="bg-[#fafaff]">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <SectionHeader
        eyebrow="Universal Test Engine"
        title="Don't just say you're good at something."
        accent="Measure it."
        accentClass="text-[#6d3fd6]"
        lead="CareerLine AI's Universal Test Engine assesses practical skills against defined standards for specific roles and skill areas."
      />
      <div className="text-[11px] text-[#464555] lg:text-right">
        <p className="tracking-wide uppercase">Engine Version 4.2</p>
        <p className="mt-1 font-semibold text-[#1f2a44]">1,240+ Calibrated Standards Active</p>
      </div>
    </div>

    <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,4.5fr)] lg:items-start">
      {/* Assessment card */}
      <div className={`p-5 sm:p-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-heading flex items-center gap-2 text-[17px] font-semibold text-[#141b34]">
              <span className="h-2 w-2 rounded-full bg-[#6d3fd6]" />
              Product Design Assessment
            </h3>
            <p className="mt-1 text-[11px] text-[#5a6270]">
              Practical Simulation #408 • Evaluated under calibrated role constraints
            </p>
          </div>
          <span className="rounded-full bg-[#e8eaff] px-3 py-1 text-[10.5px] font-medium text-[#464555]">
            Mid-Senior Standard
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {SKILLS.map(({ name, standard, score, status, tone }) => (
            <div key={name} className="rounded-lg bg-[#f7f7fd] px-3 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-heading text-[13px] font-medium text-[#141b34]">{name}</span>
                <span className="flex items-center gap-2 text-[10.5px] text-[#5a6270]">
                  Standard: {standard}%
                  <span
                    className={`rounded px-1.5 py-0.5 font-semibold ${
                      tone === 'gap' ? 'bg-[#fde2e2] text-[#b42318]' : 'bg-[#e0e3fb] text-[#3525cd]'
                    }`}
                  >
                    {status}
                  </span>
                </span>
              </div>
              <div
                className="relative mt-2 h-2 w-full rounded-full bg-[#e3e6f7]"
                role="img"
                aria-label={`${name}: scored ${score}%, standard ${standard}%`}
              >
                <div
                  className={`h-full rounded-full ${tone === 'gap' ? 'bg-[#b91c1c]' : 'bg-[#4f46e5]'}`}
                  style={{ width: `${score}%` }}
                />
                <span
                  className="absolute -top-0.5 h-3 w-0.5 bg-[#1f2a44]"
                  style={{ left: `${standard}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-lg bg-[#eceefb] p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <p className="font-heading text-[22px] font-bold text-[#141b34]">
              78 <span className="text-[12px] font-medium text-[#5a6270]">/100</span>
            </p>
            <div>
              <p className="text-[11px] font-semibold text-[#141b34]">Composite Readiness Score</p>
              <p className="text-[10.5px] text-[#5a6270]">
                Senior Role Benchmark Requirement: 82 / 100 (-4 delta)
              </p>
            </div>
          </div>
          <ArrowButton variant="solid" className="h-10 text-[12px] [&>svg]:hidden">
            Download Audit Dossier
          </ArrowButton>
        </div>
      </div>

      {/* Side column */}
      <div className="flex flex-col gap-4">
        <div className={`p-5 ${CARD}`}>
          <h3 className="font-heading flex items-center gap-2 text-[14px] font-semibold text-[#141b34]">
            <LuMicroscope size={16} className="text-[#3525cd]" />
            Simulation Architecture
          </h3>
          <p className="mt-2 text-[12px] leading-relaxed text-[#5a6270]">
            CareerLine AI tests practical scenarios rather than multiple-choice trivia. Every
            candidate executes realistic workflows:
          </p>
          <ul className="mt-3 flex flex-col gap-2.5">
            {FEATURES.map(({ title, text }) => (
              <li
                key={title}
                className="flex items-start gap-2 text-[11.5px] leading-relaxed text-[#464555]"
              >
                <LuCheck size={12} className="mt-1 shrink-0 text-[#3525cd]" />
                <span>
                  <strong className="font-semibold text-[#141b34]">{title}</strong> {text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-[#e8eaff] p-4">
          <p className="text-[10.5px] font-bold tracking-[0.06em] text-[#3525cd] uppercase">
            Standardized Role Taxonomy
          </p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#5a6270]">
            Every role is benchmarked across 24 discrete competencies mapped directly to Fortune 500
            tech matrices.
          </p>
        </div>
      </div>
    </div>
  </Section>
);
