import { useId, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { LuCheck } from 'react-icons/lu';
import { DecisionNote } from '../components/DecisionNote';
import { PRIMARY_ACTION, SECONDARY_ACTION } from '../components/ErrorPage';
import { AUDIENCES, type AudienceKey } from '../content/audiences';

const Section = ({ title, children }: { title: string; children: ReactNode }) => {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <h2 id={headingId} className="font-heading text-[24px] font-bold text-slate-950">
        {title}
      </h2>
      {children}
    </section>
  );
};

export const AudiencePage = ({ audience: key }: { audience: AudienceKey }) => {
  const audience = AUDIENCES.find((item) => item.key === key) ?? AUDIENCES[0];

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-12 px-5 py-14 sm:px-8">
      <header className="flex flex-col gap-4">
        <h1 className="font-heading text-[36px] leading-[1.15] font-bold text-slate-950">
          {audience.title}
        </h1>
        <p className="max-w-[60ch] text-[18px] leading-[1.6] text-slate-700">{audience.intro}</p>
        <div className="flex flex-wrap gap-3">
          <Link to={audience.action.to} className={`${PRIMARY_ACTION} w-fit`}>
            {audience.action.label}
          </Link>
          {audience.secondary && (
            <Link to={audience.secondary.to} className={`${SECONDARY_ACTION} w-fit`}>
              {audience.secondary.label}
            </Link>
          )}
        </div>
      </header>

      <Section title="What you get">
        <ul className="grid gap-4 sm:grid-cols-2">
          {audience.benefits.map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-[15px] text-slate-700"
            >
              <LuCheck size={20} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-600" />
              {benefit}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="How it works">
        <ol className="flex flex-col gap-3">
          {audience.steps.map((step, index) => (
            <li key={step} className="flex items-start gap-4 text-[16px] text-slate-700">
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[14px] font-bold text-indigo-800"
              >
                {index + 1}
              </span>
              <span className="pt-1">{step}</span>
            </li>
          ))}
        </ol>
      </Section>

      <DecisionNote benchmark="Every score is measured against the CareerLine benchmark for the skill and level." />
    </div>
  );
};
