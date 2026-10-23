import type { ReactNode } from 'react';

export type Status = 'neutral' | 'info' | 'success' | 'warning' | 'error';

interface StatusStyle {
  readonly wrapper: string;
  readonly dot: string;
}

const STATUSES: Record<Status, StatusStyle> = {
  neutral: { wrapper: 'bg-gray-100 text-slate-700', dot: 'bg-slate-400' },
  info: { wrapper: 'bg-indigo-50 text-indigo-800', dot: 'bg-indigo-600' },
  success: { wrapper: 'bg-teal-50 text-teal-800', dot: 'bg-teal-600' },
  warning: { wrapper: 'bg-amber-50 text-amber-800', dot: 'bg-amber-500' },
  error: { wrapper: 'bg-red-50 text-red-700', dot: 'bg-red-600' },
};

interface StatusLabelProps {
  readonly status?: Status;
  readonly dot?: boolean;
  readonly children: ReactNode;
  readonly className?: string;
}

export const StatusLabel = ({
  status = 'neutral',
  dot = true,
  children,
  className = '',
}: StatusLabelProps) => {
  const { wrapper, dot: dotClass } = STATUSES[status];

  return (
    <span
      data-status={status}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] leading-none font-medium whitespace-nowrap ${wrapper} ${className}`}
    >
      {dot && (
        <span
          data-testid="status-dot"
          aria-hidden="true"
          className={`size-1.5 rounded-full ${dotClass}`}
        />
      )}
      {children}
    </span>
  );
};
