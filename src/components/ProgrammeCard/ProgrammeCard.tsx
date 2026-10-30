import { useId, type ReactNode } from 'react';
import type { Budget, ProgrammeSummary } from '../../lib/api';
import { isOverBudget } from '../../lib/beginner/budget';
import { formatMoney } from '../../lib/format';
import { StatusLabel } from '../StatusLabel';

const MODES: Record<string, string> = {
  online: 'Online',
  in_person: 'In person',
  hybrid: 'Hybrid',
};

const HEADINGS = { 2: 'h2', 3: 'h3', 4: 'h4' } as const;

interface ProgrammeCardProps {
  readonly programme: ProgrammeSummary | null;
  readonly budget?: Budget | null;
  readonly headingLevel?: keyof typeof HEADINGS;
  readonly className?: string;
  readonly children?: ReactNode;
}

export const ProgrammeCard = ({
  programme,
  budget,
  headingLevel = 3,
  className = '',
  children,
}: ProgrammeCardProps) => {
  const headingId = useId();
  const Heading = HEADINGS[headingLevel];

  if (!programme) {
    return (
      <section
        aria-labelledby={headingId}
        className={`flex flex-col gap-2 rounded-xl border border-dashed border-slate-300 p-5 ${className}`}
      >
        <Heading id={headingId} className="text-[16px] font-semibold text-slate-700">
          No programme matched yet
        </Heading>
        <p className="text-[14px] text-slate-600">
          We will suggest a programme for this path as soon as we find a good match.
        </p>
      </section>
    );
  }

  const isPartner = programme.provider_type === 'partner';
  const weeks = `${programme.duration_weeks} ${programme.duration_weeks === 1 ? 'week' : 'weeks'}`;
  const facts = [
    programme.provider,
    MODES[programme.mode] ?? programme.mode,
    weeks,
    formatMoney(programme.price),
  ].join(' · ');

  return (
    <section
      aria-labelledby={headingId}
      className={`flex flex-col gap-3 rounded-xl bg-gray-100 p-5 sm:p-6 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[12px] font-semibold tracking-wide text-teal-700 uppercase">
          {isPartner ? 'Partner programme' : 'Recommended programme'}
        </p>
        {isOverBudget(programme.price, budget) && (
          <StatusLabel status="warning">Over your budget</StatusLabel>
        )}
      </div>
      <Heading
        id={headingId}
        className="text-[20px] leading-[1.3] font-bold text-slate-800 sm:text-[24px]"
      >
        {programme.name}
      </Heading>
      <p className="text-[14px] font-medium text-slate-700">{facts}</p>
      {isPartner && (
        <p className="max-w-[60ch] text-[13px] text-slate-600">
          This is a partner programme. CareerLine may earn a referral fee if you enrol.
        </p>
      )}
      {children}
    </section>
  );
};
