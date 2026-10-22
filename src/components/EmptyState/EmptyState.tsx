import type { ReactNode } from 'react';

type HeadingLevel = 2 | 3 | 4;

interface EmptyStateProps {
  readonly title: string;
  readonly description?: string;
  readonly icon?: ReactNode;
  readonly action?: ReactNode;
  readonly headingLevel?: HeadingLevel;
  readonly className?: string;
}

export const EmptyState = ({
  title,
  description,
  icon,
  action,
  headingLevel = 3,
  className = '',
}: EmptyStateProps) => {
  const Heading = `h${headingLevel}` as 'h2' | 'h3' | 'h4';

  return (
    <div
      data-testid="empty-state"
      className={`flex flex-col items-center gap-3 px-6 py-10 text-center ${className}`}
    >
      {icon && (
        <span
          data-testid="empty-state-icon"
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-800"
        >
          {icon}
        </span>
      )}
      <Heading className="font-heading text-[18px] leading-[1.3] font-bold text-slate-950">
        {title}
      </Heading>
      {description && (
        <p className="max-w-[40ch] text-[14px] leading-[1.55] text-slate-600">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
};
