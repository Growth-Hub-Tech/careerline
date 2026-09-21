import type { ReactNode } from 'react';
import { LuX, LuCheck } from 'react-icons/lu';
import { PageContainer } from '../PageContainer';

interface Row {
  readonly text: string;
}

const WITHOUT_ROWS: readonly Row[] = [
  { text: 'Endless searching through Reddit threads & course marketplaces.' },
  { text: 'Analysis paralysis from hundreds of overlapping course titles.' },
  { text: 'Conflicting recommendations that ignore your background.' },
  { text: 'Unclear career trajectories and 40% course dropout rates.' },
];

const WITH_ROWS: readonly Row[] = [
  { text: 'Personalized, algorithmic recommendations based on 12 data dimensions.' },
  { text: 'Clear, prioritized learning roadmap tailored to your weekly availability.' },
  { text: 'Honest translation of your existing transferable strengths.' },
  { text: 'High-conviction next steps with verified job market demand.' },
];

const RowItem = ({ icon, text }: { icon: ReactNode; text: string }) => (
  <li className="flex items-start gap-3">
    <span className="mt-0.5 shrink-0">{icon}</span>
    <span className="text-[14px] leading-relaxed text-[#4b5364]">{text}</span>
  </li>
);

export const Comparison = () => (
  <section className="flex h-[884px] w-full items-center bg-[#e5e8fa]">
    <PageContainer className="flex h-[662px] w-full flex-col justify-center">
      <div className="mx-auto max-w-[720px] text-center">
        <h2 className="text-[28px] leading-[1.2] font-bold tracking-tight text-[#1f2a44] lg:text-[34px]">
          There are thousands of courses. But which one is right for you?
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[#5a6270]">
          You could spend hours comparing syllabi, watching contradictory YouTube reviews, and
          asking colleagues for opinions—only to end up more overwhelmed. You don&apos;t need
          another generic catalog. You need clear, evidence-backed direction.
        </p>
      </div>

      <div className="mx-auto mt-12 flex flex-col gap-6 sm:flex-row">
        <div className="flex h-[456px] w-[436px] flex-col rounded-2xl bg-white p-6 sm:p-7">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-500">
              <LuX size={15} />
            </span>
            <h3 className="text-[17px] font-bold text-[#1f2a44]">Without CareerLine</h3>
          </div>

          <ul className="mt-5 flex flex-col gap-4">
            {WITHOUT_ROWS.map((row) => (
              <RowItem
                key={row.text}
                icon={<LuX size={16} className="text-red-500" />}
                text={row.text}
              />
            ))}
          </ul>

          <div className="mt-6 rounded-lg bg-[#E2E7FF] py-3 text-center text-[13px] font-medium text-[#6b7280]">
            Outcome: Weeks wasted, zero momentum
          </div>
        </div>

        <div className="flex h-[456px] w-[436px] flex-col rounded-2xl bg-white p-6 sm:p-7">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3525cd] text-white">
              <LuCheck size={15} />
            </span>
            <h3 className="text-[17px] font-bold text-[#3525cd]">With Careerline</h3>
          </div>

          <ul className="mt-5 flex flex-col gap-4">
            {WITH_ROWS.map((row) => (
              <RowItem
                key={row.text}
                icon={<LuCheck size={16} className="text-[#063ccd]" />}
                text={row.text}
              />
            ))}
          </ul>

          <div className="mt-6 rounded-lg bg-[#E2DFFF] py-3 text-center text-[13px] font-semibold text-[#063ccd]">
            Outcome: Instant clarity, targeted mastery
          </div>
        </div>
      </div>
    </PageContainer>
  </section>
);
