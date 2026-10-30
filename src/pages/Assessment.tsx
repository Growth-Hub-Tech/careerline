import { useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LuArrowLeft, LuLightbulb } from 'react-icons/lu';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { FlowHeader } from '../components/FlowHeader';
import { Spinner } from '../components/Loader';
import { QuestionCard } from '../components/QuestionCard';
import { StepList } from '../components/StepList';
import { beginnerApi, type IntakeQuestionnaire, type IntakeSubmission } from '../lib/api';
import { describeError } from '../lib/api/describeError';
import type { FlaggedAnswers } from '../lib/beginner/flaggedAnswers';
import { useRequest } from '../lib/hooks/useRequest';

const SECTION_TITLES: Record<string, string> = {
  personality: 'Personality',
  goals: 'Goals',
  time: 'Time',
  finances: 'Finances',
};

const titleFor = (section: string) =>
  SECTION_TITLES[section] ?? section.charAt(0).toUpperCase() + section.slice(1);

const loadQuestionnaire = () => beginnerApi.getIntake();

const AssessmentFrame = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-dvh flex-col bg-indigo-200">
    <FlowHeader label="Beginner path" />

    <main className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
      <h1 className="sr-only">Career assessment</h1>
      {children}
    </main>
  </div>
);

interface Returned {
  readonly submission?: IntakeSubmission;
  readonly flagged?: FlaggedAnswers;
}

interface QuestionnaireProps {
  readonly questionnaire: IntakeQuestionnaire;
  readonly returned: Returned | null;
}

const startFrom = ({ questions, version }: IntakeQuestionnaire, returned: Returned | null) => {
  if (returned?.submission?.version !== version) return { answers: {}, flagged: {}, index: 0 };

  const known = new Set(questions.map((item) => item.question_id));
  const answers: Record<string, string[]> = {};
  returned.submission.answers.forEach((answer) => {
    if (known.has(answer.question_id)) answers[answer.question_id] = [...answer.values];
  });
  const flagged = returned.flagged ?? {};
  const index = questions.findIndex((item) => item.question_id in flagged);

  return { answers, flagged, index: Math.max(index, 0) };
};

const Questionnaire = ({ questionnaire, returned }: QuestionnaireProps) => {
  const navigate = useNavigate();
  const { questions, version } = questionnaire;
  const [start] = useState(() => startFrom(questionnaire, returned));
  const [index, setIndex] = useState(start.index);
  const [answers, setAnswers] = useState<Record<string, string[]>>(start.answers);
  const [flagged, setFlagged] = useState<FlaggedAnswers>(start.flagged);

  const steps = useMemo(
    () =>
      [...new Set(questions.map((item) => item.section))].map((id) => ({
        id,
        title: titleFor(id),
      })),
    [questions],
  );

  const question = questions[index];
  const isLast = index === questions.length - 1;
  const previous = index > 0 ? questions[index - 1] : undefined;
  const isBackDisabled = previous !== undefined && (answers[previous.question_id]?.length ?? 0) > 0;

  const onNext = () => {
    if (!isLast) {
      setIndex((current) => current + 1);
      return;
    }

    navigate('/assessment/processing', {
      state: {
        submission: {
          version,
          answers: questions.map((item) => ({
            question_id: item.question_id,
            values: answers[item.question_id] ?? [],
          })),
        },
      },
    });
  };

  return (
    <div className="flex w-full max-w-[1280px] flex-col gap-6 lg:flex-row lg:items-stretch">
      <aside className="flex w-full shrink-0 flex-col justify-between gap-10 rounded-xl bg-white p-6 lg:w-[274px]">
        <div className="flex flex-col gap-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md text-[15px] font-medium text-indigo-800 transition-colors hover:text-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <LuArrowLeft size={16} aria-hidden="true" />
            Back To Homepage
          </Link>
          <StepList steps={steps} currentId={question.section} />
        </div>

        <p className="inline-flex items-center gap-2 self-end rounded-2xl bg-indigo-800 px-4 py-3 text-[12px] leading-tight text-white">
          <LuLightbulb size={18} aria-hidden="true" className="shrink-0" />
          Tip: Be honest for best results
        </p>
      </aside>

      <div className="min-w-0 flex-1">
        <QuestionCard
          key={question.question_id}
          questionNumber={index + 1}
          questionCount={questions.length}
          text={question.text}
          options={question.options}
          selected={answers[question.question_id] ?? []}
          multiple={question.kind === 'multi_choice'}
          scale={question.kind === 'scale'}
          error={flagged[question.question_id]}
          onChange={(values) => {
            setAnswers((current) => ({ ...current, [question.question_id]: values }));
            setFlagged(({ [question.question_id]: _fixed, ...rest }) => rest);
          }}
          onNext={onNext}
          onBack={index > 0 ? () => setIndex((current) => current - 1) : undefined}
          isBackDisabled={isBackDisabled}
          isLast={isLast}
        />
      </div>
    </div>
  );
};

export const Assessment = () => {
  const location = useLocation() as { state: Returned | null };
  const { state, retry } = useRequest(loadQuestionnaire);

  if (state.status === 'loading') {
    return (
      <AssessmentFrame>
        <Spinner size="lg" label="Loading your questions" className="text-white" />
      </AssessmentFrame>
    );
  }

  if (state.status === 'error') {
    return (
      <AssessmentFrame>
        <div className="flex w-full max-w-[480px] flex-col gap-4 rounded-xl bg-white p-6">
          <Alert variant="error">{describeError(state.error)}</Alert>
          <Button fullWidth={false} onClick={retry}>
            Try again
          </Button>
        </div>
      </AssessmentFrame>
    );
  }

  if (state.data.questions.length === 0) {
    return (
      <AssessmentFrame>
        <div className="w-full max-w-[480px] rounded-xl bg-white p-6">
          <Alert variant="info">There are no questions to answer yet. Check back soon.</Alert>
        </div>
      </AssessmentFrame>
    );
  }

  return (
    <AssessmentFrame>
      <Questionnaire questionnaire={state.data} returned={location.state} />
    </AssessmentFrame>
  );
};
