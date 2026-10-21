import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';

export const AuthTitle = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => (
  <h1
    className={`font-heading text-[24px] leading-[1.25] font-bold text-slate-950 sm:text-[26px] ${className}`}
  >
    {children}
  </h1>
);

export const AuthText = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => <p className={`text-[14px] leading-[1.55] text-slate-600 ${className}`}>{children}</p>;

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
}

export const TextField = ({ label, id, className = '', ...rest }: TextFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-[14px] font-medium text-slate-800">
        {label}
      </label>
      <input
        id={inputId}
        // `!` keeps the border visible even if global SCSS resets input borders
        className={`h-11 w-full rounded-lg border! border-solid! border-slate-200! bg-white p-2! text-[16px] text-slate-950 transition-colors placeholder:text-slate-400 focus:border-indigo-600! focus:ring-3 focus:ring-indigo-100 focus:outline-none read-only:border-transparent! read-only:bg-gray-50 read-only:text-slate-500 read-only:focus:ring-0 ${className}`}
        {...rest}
      />
    </div>
  );
};

export const DashedLink = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link
    to={to}
    className={`inline-block border-b-[1.5px] border-dashed border-indigo-700 pb-0.5 text-[13px] font-medium text-indigo-700 transition-colors hover:border-indigo-900 hover:text-indigo-900 ${FOCUS_RING}`}
  >
    {children}
  </Link>
);
