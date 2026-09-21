import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  LuPalette,
  LuCode,
  LuDatabase,
  LuBrainCircuit,
  LuShieldCheck,
  LuClipboardList,
  LuTrendingUp,
  LuArrowRight,
} from 'react-icons/lu';

interface Track {
  readonly icon: ReactNode;
  readonly count: string;
  readonly title: string;
  readonly description: string;
}

const TECH_TRACKS: readonly Track[] = [
  {
    icon: <LuPalette size={18} />,
    count: '14 Courses',
    title: 'Product Design',
    description:
      'Master user experience research, UI architecture, design systems, and rapid Figma prototyping.',
  },
  {
    icon: <LuCode size={18} />,
    count: '22 Courses',
    title: 'Software Development',
    description:
      'Full-stack engineering fundamentals, modern React/TypeScript frameworks, and cloud deployment pipelines.',
  },
  {
    icon: <LuDatabase size={18} />,
    count: '18 Courses',
    title: 'Data & Analytics',
    description:
      'SQL, Python data manipulation, statistical modeling, and executive dashboard storytelling.',
  },
  {
    icon: <LuBrainCircuit size={18} />,
    count: '16 Courses',
    title: 'Artificial Intelligence',
    description:
      'LLM integrations, prompt engineering, fine-tuning workflows, and generative AI agents.',
  },
  {
    icon: <LuShieldCheck size={18} />,
    count: '11 Courses',
    title: 'Cybersecurity',
    description:
      'Network defense, ethical hacking, vulnerability discovery, and incident governance systems.',
  },
  {
    icon: <LuClipboardList size={18} />,
    count: '19 Courses',
    title: 'Product Management',
    description:
      'Customer discovery, roadmap prioritization, cross-functional squad leadership, and metrics.',
  },
  {
    icon: <LuTrendingUp size={18} />,
    count: '15 Courses',
    title: 'Growth & MarTech',
    description:
      'Attribution modeling, programmatic conversion rate optimization, automated funnels, and retention.',
  },
];

const TABS = ['Tech Tracks (7)', 'Business Tracks (7)'] as const;

export const CourseCatalog = () => {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>(TABS[0]);

  return (
    <section className="w-full bg-[#f1f2fc] py-14 sm:py-16 lg:py-24">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[560px]">
            <span className="text-[11px] font-semibold tracking-[0.14em] text-[#063ccd] uppercase sm:text-[12px]">
              Course catalog clusters
            </span>

            <h2 className="mt-3 text-[26px] leading-[1.2] font-bold tracking-tight text-[#1f2a44] sm:text-[30px] lg:text-[32px]">
              What do you want to grow into?
            </h2>

            <p className="mt-3 max-w-[520px] text-[14px] leading-relaxed text-[#5a6270] sm:text-[15px]">
              Explore deeply researched tracks across emerging tech disciplines and core business
              strategy functions.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex w-[333px] h-[48px] items-center gap-1 rounded-[12px] bg-[#E2E7FF] p-1.5 sm:max-w-[334px]">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  aria-pressed={isActive}
                  className={`h-9 min-w-0 flex-1 rounded-lg px-2 text-[12px] font-semibold transition-all duration-200 sm:px-3 sm:text-[14px] ${
                    isActive
                      ? 'bg-white text-[#3525cd] shadow-[0_2px_8px_rgba(53,37,205,0.10)]'
                      : 'text-[#464555] hover:text-[#1f2a44]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tracks */}
        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {TECH_TRACKS.map(({ icon, count, title, description }) => (
            <div
              key={title}
              className="flex min-w-0 flex-col rounded-2xl bg-white p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(6,60,205,0.08)] sm:p-6"
            >
              {/* Icon + Course Count */}
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#063ccd]/10 text-[#063ccd]">
                  {icon}
                </span>

                <span className="shrink-0 rounded-full bg-[#EAEDFF] px-3 py-1.5 text-[11px] font-medium text-[#464555] sm:px-3.5 sm:text-[12px]">
                  {count}
                </span>
              </div>

              {/* Title */}
              <h3 className="mt-5 text-[16px] font-bold tracking-tight text-[#1f2a44] sm:text-[17px]">
                {title}
              </h3>

              {/* Description */}
              <p className="mt-2 text-[13px] leading-relaxed text-[#6b7280]">{description}</p>

              {/* Explore */}
              <button
                type="button"
                className="mt-5 inline-flex min-h-[40px] items-center gap-1.5 self-start rounded-lg px-2 text-[13px] font-semibold text-[#423B74] transition-colors hover:bg-[#423B74]/5 hover:underline"
              >
                Explore Path
                <LuArrowRight size={14} />
              </button>
            </div>
          ))}

          {/* Assessment Card */}
          <div className="flex min-h-[260px] flex-col justify-between rounded-2xl bg-[#423b74] p-5 text-white sm:p-6">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.14em] text-white/70 uppercase sm:text-[11px]">
                Unsure what fits?
              </span>

              <h3 className="mt-3 text-[18px] leading-snug font-bold tracking-tight sm:text-[19px]">
                Let our algorithm match you
              </h3>

              <p className="mt-3 text-[13px] leading-relaxed text-white/75">
                Take 3 minutes to test your problem-solving style and find your ideal technical
                balance.
              </p>
            </div>

            <button
              type="button"
              className="mt-6 h-10 w-full rounded-[12px] bg-white text-[13px] font-bold text-[#423b74] transition-colors hover:bg-[#f1f2f6] sm:text-[14px]"
            >
              Take Assessment →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
