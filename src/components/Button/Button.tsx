import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'transparent' | 'accent' | 'deep';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'bg-slate-950 text-white hover:bg-slate-800',
  transparent: 'bg-transparent text-slate-950 hover:bg-gray-50',
  accent: 'bg-amber-500 text-slate-950 hover:bg-amber-600',
  deep: 'bg-indigo-800 text-white hover:bg-indigo-900',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly border?: 'none' | 'solid';
  readonly fullWidth?: boolean;
  readonly isLoading?: boolean;
}

export const Button = ({
  variant = 'primary',
  border = 'none',
  fullWidth = true,
  isLoading = false,
  disabled,
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) => (
  <button
    type={type}
    disabled={disabled || isLoading}
    aria-busy={isLoading || undefined}
    className={`inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-[16px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${border === 'solid' ? 'border border-slate-200' : ''} ${fullWidth ? 'w-full' : ''} ${className}`}
    {...rest}
  >
    {isLoading && (
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
      />
    )}
    {children}
  </button>
);
