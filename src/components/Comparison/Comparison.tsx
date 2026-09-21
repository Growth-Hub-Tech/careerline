import type { ReactNode } from 'react';
import { LuX, LuCheck } from 'react-icons/lu';

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
  <section className="flex w-full items-center bg-[#e5e8fa] py-14 sm:py-20 lg:h-[884px] lg:py-0">
    <div className="mx-auto flex w-full max-w-[1280px] flex-col justify-center px-5 sm:px-6 lg:h-[662px] lg:px-[32px]">
      <div className="mx-auto max-w-[720px] text-center">
        <h2 className="text-[24px] leading-[1.2] font-bold tracking-tight text-[#1f2a44] sm:text-[28px] lg:text-[34px]">
          There are thousands of courses. But which one is right for you?
        </h2>
        <p className="mt-4 text-[14px] leading-relaxed text-[#5a6270] sm:text-[15px]">
          You could spend hours comparing syllabi, watching contradictory YouTube reviews, and
          asking colleagues for opinions—only to end up more overwhelmed. You don&apos;t need
          another generic catalog. You need clear, evidence-backed direction.
        </p>
      </div>

      <div className="mx-auto mt-10 flex w-full flex-col items-center gap-5 sm:mt-12 md:flex-row md:items-stretch md:justify-center md:gap-6">
        <div className="flex w-full max-w-[436px] flex-col rounded-2xl bg-white p-5 sm:p-7 lg:h-[456px]">
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

          <div className="mt-6 rounded-lg bg-[#E2E7FF] px-3 py-3 text-center text-[13px] font-medium text-[#6b7280] md:mt-auto">
            Outcome: Weeks wasted, zero momentum
          </div>
        </div>

        <div className="flex w-full max-w-[436px] flex-col rounded-2xl bg-white p-5 sm:p-7 lg:h-[456px]">
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

          <div className="mt-6 rounded-lg bg-[#E2DFFF] px-3 py-3 text-center text-[13px] font-semibold text-[#063ccd] md:mt-auto">
            Outcome: Instant clarity, targeted mastery
          </div>
        </div>
      </div>
    </div>
  </section>
);
