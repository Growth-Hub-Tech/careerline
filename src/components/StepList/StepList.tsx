import { LuCheck } from 'react-icons/lu';

export interface Step {
  readonly id: string;
  readonly title: string;
}

type StepStatus = 'complete' | 'current' | 'upcoming';

const MARKERS: Record<StepStatus, string> = {
  complete: 'border-teal-600 bg-teal-600 text-white',
  current: 'border-indigo-800 bg-indigo-800',
  upcoming: 'border-indigo-200 bg-white',
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
      <ol className="flex flex-col">
        {steps.map((step, index) => {
          const status: StepStatus =
            index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming';

          return (
            <li
              key={step.id}
              data-status={status}
              aria-current={status === 'current' ? 'step' : undefined}
              className="flex gap-3"
            >
              <div aria-hidden="true" className="flex flex-col items-center">
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${MARKERS[status]}`}
                >
                  {status === 'complete' && <LuCheck size={14} />}
                </span>
                {index < steps.length - 1 && <span className="my-1 h-10 w-0.5 bg-indigo-200" />}
              </div>
              <span className={`pt-0.5 text-[13px] ${TITLES[status]}`}>{step.title}</span>
              {status === 'complete' && <span className="sr-only">completed</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
