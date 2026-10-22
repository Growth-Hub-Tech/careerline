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
      className="flex w-full flex-col gap-6 rounded-2xl bg-white p-6 sm:p-8"
    >
      <ProgressBar
        label={`Question ${questionNumber} of ${questionCount}`}
        value={questionNumber}
        max={questionCount}
        variant="amber"
        size="sm"
      />

      <h2
        id={headingId}
        className="font-heading text-[22px] leading-[1.3] font-bold text-slate-950 sm:text-[26px]"
      >
        {text}
      </h2>

      <div role="radiogroup" aria-labelledby={headingId} className="flex flex-col gap-3">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3.5 transition-colors hover:bg-gray-50 has-checked:border-indigo-600 has-checked:bg-indigo-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-indigo-600"
          >
            <span className="text-[15px] text-slate-800">{option.label}</span>
            <input
              type="radio"
              name={groupId}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="size-4 shrink-0 cursor-pointer accent-indigo-600"
            />
          </label>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        {onBack ? (
          <Button variant="transparent" border="solid" fullWidth={false} onClick={onBack}>
            <LuArrowLeft size={18} aria-hidden="true" />
            Back
          </Button>
        ) : (
          <span />
        )}

        <Button
          variant={isLast ? 'accent' : 'primary'}
          fullWidth={false}
          disabled={!value}
          onClick={onNext}
        >
          {isLast ? (
            'See my results'
          ) : (
            <>
              Next
              <LuArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </section>
  );
};
