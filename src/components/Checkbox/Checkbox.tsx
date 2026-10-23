import { useId, type ComponentProps, type ReactNode } from 'react';

interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
  readonly label: ReactNode;
  readonly error?: string;
  readonly hint?: string;
}

export const Checkbox = ({ label, error, hint, id, className = '', ...rest }: CheckboxProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const hasMessage = Boolean(error ?? hint);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-2">
        <input
          id={inputId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          className={`mt-0.5 size-4 shrink-0 cursor-pointer rounded accent-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
          {...rest}
        />
        <label
          htmlFor={inputId}
          className="cursor-pointer text-[14px] font-medium text-slate-700 has-[+*]:cursor-pointer"
        >
          {label}
        </label>
      </div>
      {error ? (
        <p id={messageId} role="alert" className="pl-6 text-[13px] text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="pl-6 text-[13px] text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
};
