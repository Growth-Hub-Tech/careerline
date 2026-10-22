import { useId } from 'react';

export interface RadioOption {
  readonly value: string;
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
}

interface RadioGroupProps {
  readonly legend: string;
  readonly name: string;
  readonly options: readonly RadioOption[];
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onChange?: (value: string) => void;
  readonly error?: string;
  readonly hint?: string;
  readonly disabled?: boolean;
  readonly className?: string;
}

export const RadioGroup = ({
  legend,
  name,
  options,
  value,
  defaultValue,
  onChange,
  error,
  hint,
  disabled = false,
  className = '',
}: RadioGroupProps) => {
  const groupId = useId();
  const legendId = `${groupId}-legend`;
  const messageId = `${groupId}-message`;
  const isControlled = value !== undefined;
  const hasMessage = Boolean(error ?? hint);

  return (
    <fieldset
      role="radiogroup"
      aria-labelledby={legendId}
      aria-describedby={hasMessage ? messageId : undefined}
      aria-invalid={error ? true : undefined}
      disabled={disabled}
      className={`flex min-w-0 flex-col gap-3 ${className}`}
    >
      <legend id={legendId} className="mb-1 text-[14px] font-medium text-slate-800">
        {legend}
      </legend>

      {options.map((option) => {
        const optionId = `${groupId}-${option.value}`;
        const labelId = `${optionId}-label`;
        const descriptionId = `${optionId}-description`;

        return (
          <label
            key={option.value}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-gray-50 has-checked:border-indigo-600 has-checked:bg-indigo-50 has-disabled:cursor-not-allowed has-disabled:opacity-60 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-indigo-600"
          >
            <input
              id={optionId}
              type="radio"
              name={name}
              value={option.value}
              disabled={option.disabled}
              checked={isControlled ? value === option.value : undefined}
              defaultChecked={
                !isControlled && defaultValue !== undefined
                  ? defaultValue === option.value
                  : undefined
              }
              onChange={(event) => onChange?.(event.target.value)}
              aria-labelledby={labelId}
              aria-describedby={option.description ? descriptionId : undefined}
              className="mt-0.5 size-4 shrink-0 cursor-pointer accent-indigo-600 disabled:cursor-not-allowed"
            />
            <span className="flex flex-col gap-0.5">
              <span id={labelId} className="text-[15px] font-medium text-slate-950">
                {option.label}
              </span>
              {option.description && (
                <span id={descriptionId} className="text-[13px] leading-[1.5] text-slate-600">
                  {option.description}
                </span>
              )}
            </span>
          </label>
        );
      })}

      {error ? (
        <p id={messageId} role="alert" className="text-[13px] text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-[13px] text-slate-500">
          {hint}
        </p>
      ) : null}
    </fieldset>
  );
};
