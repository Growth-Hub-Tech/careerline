import { useId } from 'react';

export type ProgressVariant = 'indigo' | 'amber' | 'teal';
type ProgressSize = 'sm' | 'md';

const FILLS: Record<ProgressVariant, string> = {
  indigo: 'bg-indigo-600',
  amber: 'bg-amber-500',
  teal: 'bg-teal-600',
};

const TRACK_SIZES: Record<ProgressSize, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
};

interface ProgressBarProps {
  readonly label: string;
  readonly value: number;
  readonly max?: number;
  readonly variant?: ProgressVariant;
  readonly size?: ProgressSize;
  readonly showValue?: boolean;
  readonly hideLabel?: boolean;
  readonly valueText?: string;
  readonly className?: string;
}

export const ProgressBar = ({
  label,
  value,
  max = 100,
  variant = 'indigo',
  size = 'md',
  showValue = false,
  hideLabel = false,
  valueText,
  className = '',
}: ProgressBarProps) => {
  const labelId = useId();
  const clamped = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? (clamped / max) * 100 : 0;
  const showRow = !hideLabel || showValue;

  const labelElement = (
    <span id={labelId} className={hideLabel ? 'sr-only' : 'font-medium text-slate-800'}>
      {label}
    </span>
  );

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {showRow ? (
        <div className="flex items-center justify-between gap-3 text-[14px]">
          {labelElement}
          {showValue && (
            <span aria-hidden="true" className="text-slate-600 tabular-nums">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      ) : (
        labelElement
      )}

      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clamped}
        aria-valuetext={valueText}
        data-variant={variant}
        className={`w-full overflow-hidden rounded-full bg-slate-100 ${TRACK_SIZES[size]}`}
      >
        <div
          data-testid="progress-fill"
          className={`h-full rounded-full transition-[width] duration-300 ${FILLS[variant]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
