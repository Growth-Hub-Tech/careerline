import { useId, useState, type ComponentProps } from 'react';
import { LuEye, LuEyeOff } from 'react-icons/lu';

interface TextFieldProps extends ComponentProps<'input'> {
  readonly label: string;
  readonly error?: string;
  readonly hint?: string;
}

export const TextField = ({
  label,
  error,
  hint,
  id,
  type,
  className = '',
  ...rest
}: TextFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const hasMessage = Boolean(error ?? hint);
  const isPassword = type === 'password';
  const [isShown, setIsShown] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-[14px] font-medium text-slate-800">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={isPassword && isShown ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          className={`h-11 w-full rounded-lg border bg-white p-2 text-[16px] text-slate-950 transition-colors placeholder:text-slate-400 focus:ring-3 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-slate-400 read-only:border-transparent read-only:bg-gray-50 read-only:text-slate-500 read-only:focus:ring-0 ${
            isPassword ? 'pr-11' : ''
          } ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
              : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'
          } ${className}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setIsShown((shown) => !shown)}
            aria-label={`${isShown ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
            aria-pressed={isShown}
            aria-controls={inputId}
            className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-lg text-slate-500 transition-colors hover:text-slate-800 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600"
          >
            {isShown ? (
              <LuEyeOff size={20} aria-hidden="true" />
            ) : (
              <LuEye size={20} aria-hidden="true" />
            )}
          </button>
        )}
      </div>
      {error ? (
        <p id={messageId} role="alert" className="text-[13px] text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-[13px] text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
};
