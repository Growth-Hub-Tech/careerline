import { LuCheck } from 'react-icons/lu';

export interface Step {
  readonly id: string;
  readonly title: string;
}

type StepStatus = 'complete' | 'current' | 'upcoming';

const MARKERS: Record<StepStatus, string> = {
  complete: 'border-indigo-600 bg-indigo-600 text-white',
  current: 'border-indigo-600 bg-white',
  upcoming: 'border-slate-300 bg-white',
};

const TITLES: Record<StepStatus, string> = {
  complete: 'text-slate-700',
  current: 'font-semibold text-slate-950',
  upcoming: 'text-slate-500',
};

interface StepListProps {
  readonly steps: readonly Step[];
  readonly currentId: string;
  readonly className?: string;
}

export const StepList = ({ steps, currentId, className = '' }: StepListProps) => {
  const currentIndex = steps.findIndex((step) => step.id === currentId);

  return (
    <nav aria-label="Assessment steps" className={className}>
      <ol className="flex flex-col gap-5">
        {steps.map((step, index) => {
          const status: StepStatus =
            index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming';

          return (
            <li
              key={step.id}
              data-status={status}
              aria-current={status === 'current' ? 'step' : undefined}
              className="flex items-center gap-3 text-[15px]"
            >
              <span
                aria-hidden="true"
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${MARKERS[status]}`}
              >
                {status === 'complete' && <LuCheck size={14} />}
                {status === 'current' && <span className="size-2.5 rounded-full bg-indigo-600" />}
              </span>
              <span className={TITLES[status]}>{step.title}</span>
              {status === 'complete' && <span className="sr-only">completed</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
