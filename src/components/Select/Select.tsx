import { useId, type SelectHTMLAttributes } from 'react';
import { LuChevronDown } from 'react-icons/lu';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly label: string;
  readonly options: readonly SelectOption[];
  readonly placeholder?: string;
  readonly error?: string;
  readonly hint?: string;
}

export const Select = ({
  label,
  options,
  placeholder,
  error,
  hint,
  id,
  className = '',
  value,
  defaultValue,
  ...rest
}: SelectProps) => {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const messageId = `${selectId}-message`;
  const hasMessage = Boolean(error ?? hint);
  const isUncontrolled = value === undefined && defaultValue === undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={selectId} className="text-[14px] font-medium text-slate-800">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          value={value}
          defaultValue={isUncontrolled && placeholder ? '' : defaultValue}
          className={`h-11 w-full appearance-none rounded-lg border bg-white py-2 pr-10 pl-2 text-[16px] text-slate-950 transition-colors focus:ring-3 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-slate-400 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
              : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-100'
          } ${className}`}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <LuChevronDown
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-500"
        />
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
