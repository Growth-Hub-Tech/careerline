import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { LuCircleAlert, LuCircleCheck, LuInfo, LuTriangleAlert, LuX } from 'react-icons/lu';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface VariantStyle {
  readonly icon: IconType;
  readonly wrapper: string;
  readonly iconClass: string;
}

const VARIANTS: Record<AlertVariant, VariantStyle> = {
  info: {
    icon: LuInfo,
    wrapper: 'border-indigo-200 bg-indigo-50 text-indigo-950',
    iconClass: 'text-indigo-700',
  },
  success: {
    icon: LuCircleCheck,
    wrapper: 'border-teal-200 bg-teal-50 text-teal-900',
    iconClass: 'text-teal-700',
  },
  warning: {
    icon: LuTriangleAlert,
    wrapper: 'border-amber-200 bg-amber-50 text-amber-900',
    iconClass: 'text-amber-700',
  },
  error: {
    icon: LuCircleAlert,
    wrapper: 'border-red-200 bg-red-50 text-red-900',
    iconClass: 'text-red-600',
  },
};

interface AlertProps {
  readonly variant?: AlertVariant;
  readonly title?: string;
  readonly children: ReactNode;
  readonly onDismiss?: () => void;
  readonly className?: string;
}

export const Alert = ({
  variant = 'info',
  title,
  children,
  onDismiss,
  className = '',
}: AlertProps) => {
  const { icon: Icon, wrapper, iconClass } = VARIANTS[variant];

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      data-variant={variant}
      className={`flex items-start gap-3 rounded-lg border p-4 ${wrapper} ${className}`}
    >
      <Icon size={20} aria-hidden="true" className={`mt-0.5 shrink-0 ${iconClass}`} />

      <div className="min-w-0 flex-1 text-[14px] leading-[1.55]">
        {title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>

      {onDismiss && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="-mt-1 -mr-1 shrink-0 cursor-pointer rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <LuX size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
