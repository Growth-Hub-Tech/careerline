import { useId } from 'react';
import { Button } from '../Button';

export interface SkillOption {
  readonly value: string;
  readonly label: string;
}

interface SkillQuestionProps {
  readonly questionNumber: number;
  readonly questionCount: number;
  readonly text: string;
  readonly options: readonly SkillOption[];
  readonly selected?: string;
  readonly onChange: (value: string) => void;
  readonly onNext: () => void;
  readonly isLast?: boolean;
  readonly isSubmitting?: boolean;
}

export const SkillQuestion = ({
  questionNumber,
  questionCount,
  text,
  options,
  selected,
  onChange,
  onNext,
  isLast = false,
  isSubmitting = false,
}: SkillQuestionProps) => {
  const groupId = useId();
  const progressId = `${groupId}-progress`;
  const headingId = `${groupId}-question`;
  const percent = questionCount > 0 ? (questionNumber / questionCount) * 100 : 0;

  return (
    <section aria-labelledby={headingId} className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p id={progressId} className="text-[12px] font-medium text-slate-500">
          Question {questionNumber} of {questionCount}
        </p>
        <div
          role="progressbar"
          aria-labelledby={progressId}
          aria-valuemin={0}
          aria-valuemax={questionCount}
          aria-valuenow={questionNumber}
          className="h-1 w-full overflow-hidden rounded-full bg-slate-100 sm:max-w-[480px]"
        >
          <div
            className="h-full rounded-full bg-amber-500 transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 sm:px-8">
        <h2
          id={headingId}
          className="text-[22px] leading-[1.3] font-semibold text-slate-700 sm:text-[26px]"
        >
          {text}
        </h2>

        <div role="radiogroup" aria-labelledby={headingId} className="flex flex-col gap-3">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-indigo-300 bg-white px-4 py-6 transition-colors hover:bg-indigo-50 has-checked:border-indigo-600 has-checked:bg-indigo-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-indigo-600"
            >
              <span className="text-[16px] text-slate-700 sm:text-[18px]">{option.label}</span>
              <input
                type="radio"
                name={groupId}
                value={option.value}
                checked={selected === option.value}
                onChange={() => onChange(option.value)}
                className="size-5 shrink-0 cursor-pointer accent-indigo-600"
              />
            </label>
          ))}
        </div>

        <Button
          disabled={selected === undefined}
          isLoading={isSubmitting}
          onClick={onNext}
          className="mt-4 h-16 rounded-2xl text-[18px] sm:h-[88px] sm:text-[20px]"
        >
          {isSubmitting ? 'Sending...' : isLast ? 'Submit test' : 'Next'}
        </Button>
      </div>
    </section>
  );
};
