import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { PageLoader } from '../components/Loader';
import { QuestionCard } from '../components/QuestionCard';
import { attemptsApi, type AttemptAnswer, type AttemptResult } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { describeError } from '../lib/api/describeError';
import { useRequest } from '../lib/hooks/useRequest';
import {
  clearAttempt,
  readAttempt,
  saveAttempt,
  type SavedAttempt,
} from '../lib/tests/attemptStore';

const ENDED_STATUSES = [404, 409, 410];

const hasEnded = (error: unknown) =>
  error instanceof ApiError &&
  (ENDED_STATUSES.includes(error.status) || error.code?.toLowerCase() === 'expired');

const LINK_CLASS =
  'inline-flex h-12 w-fit items-center justify-center rounded-lg bg-indigo-600 px-5 text-[16px] font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';

const Panel = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 sm:p-8">
    <h1 className="font-heading text-[28px] leading-[1.25] font-bold text-slate-950">{title}</h1>
    {children}
  </div>
);

const TestEnded = ({ testId }: { testId: number }) => {
  useEffect(() => clearAttempt(testId), [testId]);

  return (
    <Panel title="This test has ended">
      <p className="text-[15px] text-slate-600">Start the test again to get a result.</p>
      <Link to={`/tests/${testId}`} className={LINK_CLASS}>
        Back to the test
      </Link>
    </Panel>
  );
};

const TestSubmitted = ({ result }: { result: AttemptResult }) => (
  <Panel title="Test submitted">
    <p className="text-[15px] text-slate-600">
      You scored {result.percentage}%, with {result.score} of {result.total_possible} answers
      correct.
    </p>
    <Link to="/tests" className={LINK_CLASS}>
      Back to tests
    </Link>
  </Panel>
);

const Player = ({ saved }: { saved: SavedAttempt }) => {
  const { testId, title, attempt } = saved;
  const [answers, setAnswers] = useState<readonly AttemptAnswer[]>(saved.answers);
  const [selected, setSelected] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<AttemptResult>();
  const [ended, setEnded] = useState(false);
  const submitting = useRef(false);

  if (ended) return <TestEnded testId={testId} />;
  if (result) return <TestSubmitted result={result} />;

  const index = Math.min(answers.length, attempt.questions.length - 1);
  const question = attempt.questions[index];
  const isLast = index === attempt.questions.length - 1;

  const submit = async (all: readonly AttemptAnswer[]) => {
    if (submitting.current) return;
    submitting.current = true;
    setIsSubmitting(true);
    setError(undefined);

    try {
      const reply = await attemptsApi.submit({ attempt_id: attempt.attempt_id, answers: all });
      clearAttempt(testId);
      setResult(reply.result);
    } catch (submitError) {
      if (hasEnded(submitError)) setEnded(true);
      else setError(describeError(submitError));
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  const next = () => {
    if (selected.length === 0) return;

    const choice = { question_id: question.question_id, selected_option_id: Number(selected[0]) };
    if (isLast) {
      void submit([...answers, choice]);
      return;
    }

    const updated = [...answers, choice];
    saveAttempt({ ...saved, answers: updated });
    setAnswers(updated);
    setSelected([]);
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[16px] font-semibold text-indigo-950">{title}</h1>
      {error && <Alert variant="error">{error}</Alert>}
      <QuestionCard
        key={question.question_id}
        questionNumber={index + 1}
        questionCount={attempt.questions.length}
        text={question.question_text}
        options={question.options.map((option) => ({
          value: String(option.option_id),
          label: option.option_text,
        }))}
        selected={selected}
        onChange={setSelected}
        onNext={next}
        isLast={isLast}
        instructions="Choose the best answer. You cannot go back once you move on."
        lastLabel="Submit test"
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

const AttemptCheck = ({ saved }: { saved: SavedAttempt }) => {
  const attemptId = saved.attempt.attempt_id;
  const load = useCallback(() => attemptsApi.get(attemptId), [attemptId]);
  const { state, retry } = useRequest(load);

  if (state.status === 'loading') {
    return <PageLoader title="Loading your test" className="flex-1" />;
  }

  if (state.status === 'error') {
    if (hasEnded(state.error)) return <TestEnded testId={saved.testId} />;

    return (
      <div className="flex w-full max-w-[480px] flex-col gap-4">
        <Alert variant="error">{describeError(state.error)}</Alert>
        <Button fullWidth={false} onClick={retry}>
          Try again
        </Button>
      </div>
    );
  }

  if (state.data.attempt_status !== 'in_progress') return <TestEnded testId={saved.testId} />;

  return <Player saved={saved} />;
};

export const TestAttempt = () => {
  const { testId } = useParams();
  const id = Number(testId);

  if (!Number.isInteger(id) || id <= 0) {
    return <Navigate to="/page-not-found" replace />;
  }

  const saved = readAttempt(id);
  if (!saved) return <Navigate to={`/tests/${id}`} replace />;

  return <AttemptCheck key={id} saved={saved} />;
};
