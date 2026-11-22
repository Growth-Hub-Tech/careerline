import { useId, type ReactNode } from 'react';

interface SectionProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly plain?: boolean;
}

export const Section = ({ title, children, plain = false }: SectionProps) => {
  const headingId = useId();
  const box = plain ? '' : 'rounded-2xl border border-slate-200 bg-white p-6';

  return (
    <section aria-labelledby={headingId} className={`flex flex-col gap-4 ${box}`}>
      <h2 id={headingId} className="font-heading text-[20px] font-bold text-slate-950">
        {title}
      </h2>
      {children}
    </section>
  );
};
