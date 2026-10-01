import { useState } from 'react';
import { LuCheck, LuInfo, LuSlidersHorizontal } from 'react-icons/lu';
import { CARD, Section, SectionHeader } from '../Section';

interface Group {
  readonly key: string;
  readonly label: string;
  readonly options: readonly string[];
  readonly defaults: readonly string[];
}

const GROUPS: readonly Group[] = [
  {
    key: 'interest',
    label: '1. Core Interest Profile',
    options: ['Human Systems', 'Visual Architecture', 'Data Logic', 'Business Growth'],
    defaults: ['Visual Architecture'],
  },
  {
    key: 'outcome',
    label: '2. Primary Outcome Target',
    options: ['Salary Acceleration', 'Remote Autonomy', 'Technical Leadership', 'Creative Mastery'],
    defaults: ['Remote Autonomy'],
  },
  {
    key: 'baseline',
    label: '3. Verified Existing Baseline',
    options: ['Basic Web', 'Analytical Thinking', 'Wireframing', 'Project Management'],
    defaults: ['Analytical Thinking', 'Wireframing'],
  },
  {
    key: 'time',
    label: '4. Weekly Time Commitment',
    options: ['10-15 hrs/wk', '20-30 hrs/wk', 'Flexible Nights'],
    defaults: ['10-15 hrs/wk'],
  },
  {
    key: 'resource',
    label: '5. Resource Framework',
    options: ['Self-Paced Bootstrapping', 'Employer Sponsored'],
    defaults: ['Self-Paced Bootstrapping'],
  },
];

const ALTERNATIVES = [
  {
    label: 'Alternative Path 02',
    title: 'Data Analytics',
    note: 'Strong quantitative alignment',
    score: '81%',
  },
  {
    label: 'Alternative Path 03',
    title: 'Product Management',
    note: 'High coordination capability',
    score: '74%',
  },
] as const;

const PANEL_STYLE = {
  padding: 20,
  backgroundColor: '#f3f4fd',
  borderRadius: 16,
} as const;

const BOX_STYLE = {
  padding: 16,
  backgroundColor: '#ffffff',
  borderRadius: 12,
} as const;

export const CareerDiscovery = () => {
  // Chips toggle so the demo feels alive; all groups are multi-select.
  const [selected, setSelected] = useState<Record<string, readonly string[]>>(() =>
    Object.fromEntries(GROUPS.map((g) => [g.key, g.defaults])),
  );

  const toggle = (key: string, option: string) =>
    setSelected((prev) => {
      const current = prev[key] ?? [];
      return {
        ...prev,
        [key]: current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option],
      };
    });

  const configured = GROUPS.filter((g) => (selected[g.key] ?? []).length > 0).length;

  return (
    <Section id="for-individuals" bg="bg-[#e5e8fa]">
      <SectionHeader
        eyebrow="Career Discovery Engine"
        title="Don't choose a career because it's trending."
        accent="Choose a path that makes sense for you."
        lead="Filter through the hype. CareerLine AI evaluates multiple vectors to match your cognitive profile, background, and constraints with high-viability career paths."
      />

      <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        {/* Intake */}
        <div className={`p-5 sm:p-6 ${CARD}`}>
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-[15px] font-semibold text-[#141b34]">
              Dimensional Intake Parameters
            </h3>
            <span className="text-[11px] font-semibold text-[#3525cd]">
              {configured} / 5 Configured
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            {GROUPS.map(({ key, label, options }) => (
              <div key={key}>
                <p className="text-[11.5px] font-medium text-[#3b4256]">{label}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {options.map((option) => {
                    const on = (selected[key] ?? []).includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(key, option)}
                        style={{
                          paddingLeft: on ? 14 : 10,
                          paddingRight: on ? 14 : 10,
                          paddingTop: 4,
                          paddingBottom: 4,
                        }}
                        className={`inline-flex items-center rounded-md text-[11px] font-medium transition-colors ${
                          on
                            ? 'gap-1.5 bg-[#3525cd] text-white'
                            : 'gap-1 bg-[#eceefb] text-[#464555] hover:bg-[#e0e3f8]'
                        }`}
                      >
                        {option}
                        {on && <LuCheck size={11} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg bg-[#eceefb] p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#3525cd]">
              <LuSlidersHorizontal size={12} />
              Dimensional Weighting Adjusted
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#5a6270]">
              Calculates likelihood matrices based on empirical market demand and peer transitions.
            </p>
          </div>
        </div>

        {/* Result */}
        <div className="flex flex-col gap-4">
          <div style={PANEL_STYLE} className="shadow-[0_4px_24px_rgba(53,37,205,0.06)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10.5px] font-bold tracking-[0.08em] text-[#3525cd] uppercase">
                  Top Recommendation
                </span>
                <h3 className="font-heading mt-1 text-[22px] font-semibold text-[#141b34]">
                  Product Design
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-[22px] font-bold text-[#3525cd]">92%</span>
                <span
                  style={{ padding: '4px 10px' }}
                  className="rounded-md bg-[#3525cd] text-[10.5px] font-semibold text-white"
                >
                  Optimal Fit
                </span>
              </div>
            </div>

            <div style={{ ...BOX_STYLE, marginTop: 16 }}>
              <p className="text-[10.5px] font-semibold text-[#5a6270]">Why it fits</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[#1f2a44]">
                High visual intuition combined with structured problem solving matches your
                analytical background and preference for remote autonomy.
              </p>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2" style={{ marginTop: 10 }}>
              <div style={BOX_STYLE}>
                <p className="text-[10.5px] font-semibold text-[#3525cd]">Relevant Strengths</p>
                <p className="mt-1 text-[12px] leading-relaxed text-[#5a6270]">
                  Empathy, prototyping, fast mental models.
                </p>
              </div>
              <div style={BOX_STYLE}>
                <p className="text-[10.5px] font-semibold text-[#5a6270]">Development Areas</p>
                <p className="mt-1 text-[12px] leading-relaxed text-[#5a6270]">
                  Quantitative metric tracking &amp; business case formulation.
                </p>
              </div>
            </div>

            <div
              style={{ ...BOX_STYLE, marginTop: 10 }}
              className="flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-[10.5px] font-semibold text-[#5a6270]">
                  Matched Learning Programme
                </p>
                <p className="font-heading mt-0.5 text-[13.5px] font-semibold text-[#141b34]">
                  Applied Interaction Architecture
                </p>
              </div>
              <span
                style={{ padding: '4px 10px' }}
                className="shrink-0 rounded-md bg-[#eceefb] text-[10.5px] font-semibold text-[#3525cd]"
              >
                12 Wks
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {ALTERNATIVES.map(({ label, title, note, score }) => (
              <div key={title} className={`flex items-center justify-between p-4 ${CARD}`}>
                <div>
                  <p className="text-[10.5px] text-[#5a6270]">{label}</p>
                  <p className="font-heading mt-1 text-[14px] font-semibold text-[#141b34]">
                    {title}
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-[#5a6270]">{note}</p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-[18px] font-bold text-[#3525cd]">{score}</p>
                  <p className="text-[10.5px] font-semibold text-[#464555]">Match</p>
                </div>
              </div>
            ))}
          </div>

          <p className="flex items-start gap-2 rounded-xl bg-[#dfe2fb] px-4 py-3 text-[11.5px] leading-relaxed text-[#464555]">
            <LuInfo size={14} className="mt-0.5 shrink-0 text-[#3525cd]" />
            <span>
              <strong className="font-semibold">Guidance, not destiny:</strong> CareerLine AI
              recommendations highlight alignment vectors and probability paths—never an absolute
              mandate. The decisions remain in your control.
            </span>
          </p>
        </div>
      </div>
    </Section>
  );
};
