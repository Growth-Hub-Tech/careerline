import { useId } from 'react';
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';
import { Button } from '../Button';
import { ProgressBar } from '../ProgressBar';

export interface QuestionOption {
  readonly value: string;
  readonly label: string;
}

interface QuestionCardProps {
  readonly questionNumber: number;
  readonly questionCount: number;
  readonly text: string;
  readonly options: readonly QuestionOption[];
  readonly value?: string;
  readonly onChange: (value: string) => void;
  readonly onNext: () => void;
  readonly onBack?: () => void;
  readonly isLast?: boolean;
}

export const QuestionCard = ({
  questionNumber,
  questionCount,
  text,
  options,
  value,
  onChange,
  onNext,
  onBack,
  isLast = false,
}: QuestionCardProps) => {
  const groupId = useId();
  const headingId = `${groupId}-question`;

  return (
    <section
      aria-labelledby={headingId}
      className="flex w-full flex-col gap-6 rounded-xl bg-white p-6 sm:p-10"
    >
      <ProgressBar
        label={`Question ${questionNumber} of ${questionCount}`}
        value={questionNumber}
        max={questionCount}
        variant="amber"
        size="sm"
        className="max-w-[480px]"
      />

      <p className="text-[13px] text-slate-600">
        There are no right or wrong answers here. Choose the option that resonates most with you.
      </p>

      <h2
        id={headingId}
        className="text-[24px] leading-[1.3] font-bold text-slate-800 sm:text-[26px]"
      >
        {text}
      </h2>

      <div
        role="radiogroup"
        aria-labelledby={headingId}
        className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:p-6"
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 transition-colors hover:bg-gray-50 has-checked:border-indigo-800 has-checked:bg-indigo-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-indigo-600"
          >
            <span className="text-[17px] text-slate-800">{option.label}</span>
            <input
              type="radio"
              name={groupId}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="size-5 shrink-0 cursor-pointer accent-indigo-800"
            />
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-11 min-w-[160px] cursor-pointer items-center justify-center gap-2 rounded-full border border-indigo-800 bg-white px-6 text-[16px] font-medium text-indigo-800 transition-colors hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <LuArrowLeft size={18} aria-hidden="true" />
            Back
          </button>
        ) : (
          <span />
        )}

        <Button
          variant={isLast ? 'accent' : 'deep'}
          fullWidth={false}
          disabled={!value}
          onClick={onNext}
        >
          {isLast ? 'Generate Result' : 'Next'}
          <LuArrowRight size={18} aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
};
