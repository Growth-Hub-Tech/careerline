import { useId, type ComponentProps } from 'react';

interface TextareaProps extends ComponentProps<'textarea'> {
  readonly label: string;
  readonly error?: string;
  readonly hint?: string;
}

export const Textarea = ({
  label,
  error,
  hint,
  id,
  rows = 5,
  className = '',
  ...rest
}: TextareaProps) => {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const messageId = `${textareaId}-message`;
  const hasMessage = Boolean(error ?? hint);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={textareaId} className="text-[14px] font-medium text-slate-800">
        {label}
      </label>
      <textarea
        id={textareaId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={hasMessage ? messageId : undefined}
        className={`w-full resize-y rounded-lg border bg-white p-2 text-[16px] text-slate-950 transition-colors placeholder:text-slate-400 focus:ring-3 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-slate-400 ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'
        } ${className}`}
        {...rest}
      />
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
