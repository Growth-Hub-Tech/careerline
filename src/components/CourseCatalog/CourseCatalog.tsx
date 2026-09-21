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
import { PageContainer } from '../PageContainer';

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
    <section className="w-full bg-[#f1f2fc] py-20 lg:py-24">
      <PageContainer>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-[560px]">
            <span className="text-[12px] font-semibold tracking-[0.14em] text-[#063ccd] uppercase">
              Course catalog clusters
            </span>
            <h2 className="mt-3 text-[28px] leading-[1.2] font-bold tracking-tight text-[#1f2a44] lg:text-[32px]">
              What do you want to grow into?
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#5a6270]">
              Explore deeply researched tracks across emerging tech disciplines and core business
              strategy functions.
            </p>
          </div>

          <div className="w-[333.91px] h-[48px]  flex justify-center items-center shrink-0 gap-1 rounded-[12px] bg-[#E2E7FF] p-[6px]">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  aria-pressed={isActive}
                  className={`rounded-lg px-[20px] py-[8px] w-[146px] h-[36px] text-[14px] font-semibold transition-all duration-200 ${
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

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TECH_TRACKS.map(({ icon, count, title, description }) => (
            <div
              key={title}
              className="flex flex-col rounded-2xl bg-white p-6 transition-shadow hover:shadow-[0_8px_24px_rgba(6,60,205,0.08)]"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#063ccd]/10 text-[#063ccd]">
                  {icon}
                </span>
                <span className="rounded-full bg-[#EAEDFF] px-2.5 py-1 text-[12px] font-medium w-[89px] flex justify-center items-center h-[24px] text-[#464555]">
                  {count}
                </span>
              </div>

              <h3 className="mt-5 text-[17px] font-bold tracking-tight text-[#1f2a44]">{title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[#6b7280]">{description}</p>

              <button
                type="button"
                className="mt-5 flex items-center gap-1.5 text-[13px] font-semibold text-[#423B74] hover:underline"
              >
                Explore Path <LuArrowRight size={14} />
              </button>
            </div>
          ))}

          <div className="flex flex-col justify-between rounded-2xl bg-[#423b74] p-6 text-white">
            <div>
              <span className="text-[11px] font-semibold tracking-[0.14em] text-white/70 uppercase">
                Unsure what fits?
              </span>
              <h3 className="mt-3 text-[19px] leading-snug font-bold tracking-tight">
                Let our algorithm match you
              </h3>
              <p className="mt-3 text-[13px] leading-relaxed text-white/75">
                Take 3 minutes to test your problem-solving style and find your ideal technical
                balance.
              </p>
            </div>

            <button
              type="button"
              className="mt-6 h-[40px] w-full rounded-[12px] bg-white text-[14px] font-bold text-[#423b74] hover:bg-[#f1f2f6]"
            >
              Take Assessment →
            </button>
          </div>
        </div>
      </PageContainer>
    </section>
  );
};
