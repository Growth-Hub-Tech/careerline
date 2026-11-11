import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { PageLoader } from '../components/Loader';
import { SkillQuestion } from '../components/SkillQuestion';
import { queryKeys, type AttemptState } from '../lib/api';
import { hasStatus } from '../lib/api/ApiError';
import { describeError } from '../lib/api/describeError';
import { attemptQueries, useAnswer } from '../lib/api/queries';
import { clearAttempt, readAttempt, type SavedAttempt } from '../lib/tests/attemptStore';

const LINK_CLASS =
  'inline-flex h-12 w-fit items-center justify-center rounded-lg bg-indigo-600 px-5 text-[16px] font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';

const Panel = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 sm:p-8">
    <h1 className="font-heading text-[28px] leading-[1.25] font-bold text-slate-950">{title}</h1>
    {children}
  </div>
);

const TestEnded = ({
  testId,
  title,
  message,
}: {
  testId: number;
  title: string;
  message: string;
}) => {
  useEffect(() => clearAttempt(testId), [testId]);

  return (
    <Panel title={title}>
      <p className="text-[15px] text-slate-600">{message}</p>
      <Link to={`/tests/${testId}`} className={LINK_CLASS}>
        Back to the test
      </Link>
    </Panel>
  );
};

const formatTimeLeft = (milliseconds: number) => {
  const seconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
};

const Countdown = ({ expiresAt, onTimeUp }: { expiresAt: string; onTimeUp: () => void }) => {
  const [now, setNow] = useState(() => Date.now());
  const timeLeft = Math.max(0, Date.parse(expiresAt) - now);
  const isUp = timeLeft === 0;
  const reported = useRef(false);

  useEffect(() => {
    if (isUp) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [isUp]);

  useEffect(() => {
    if (!isUp || reported.current) return;
    reported.current = true;
    onTimeUp();
  }, [isUp, onTimeUp]);

  return (
    <p role="timer" className="text-[14px] font-medium text-slate-600">
      Time left {formatTimeLeft(timeLeft)}
    </p>
  );
};

// 409 or 410: the attempt moved on without this page (answered in another tab, time ran out)
const isOutOfStep = (error: unknown) => hasStatus(error, 409, 410);

interface PlayerProps {
  readonly title: string;
  readonly attempt: AttemptState;
  readonly onOutOfStep: () => void;
}

// The reply to an answer is the next question (or the end); it replaces the attempt in the cache
const Player = ({ title, attempt, onOutOfStep }: PlayerProps) => {
  const answer = useAnswer(attempt.attempt_id);
  const [selected, setSelected] = useState<string>();
  const sending = useRef(false);
  const question = attempt.question;

  if (!question) return null;

  const next = () => {
    if (selected === undefined || sending.current) return;
    sending.current = true;
    answer.mutate(
      { question_id: question.question_id, selected_option_id: Number(selected) },
      {
        onError: (answerError) => {
          if (isOutOfStep(answerError)) onOutOfStep();
          else sending.current = false;
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[28px] leading-[1.25] font-bold text-slate-700 sm:text-[36px]">
          {title} Skill Test
        </h1>
        {attempt.expires_at && <Countdown expiresAt={attempt.expires_at} onTimeUp={onOutOfStep} />}
      </div>
      {answer.isError && !isOutOfStep(answer.error) && (
        <Alert variant="error">{describeError(answer.error)}</Alert>
      )}
      <SkillQuestion
        questionNumber={question.position}
        questionCount={attempt.total_questions}
        text={question.question_text}
        options={question.options.map((option) => ({
          value: String(option.option_id),
          label: option.option_text,
        }))}
        selected={selected}
        onChange={setSelected}
        onNext={next}
        isLast={question.position === attempt.total_questions}
        isSubmitting={answer.isPending || answer.isSuccess}
      />
    </div>
  );
};

const Attempt = ({ saved }: { saved: SavedAttempt }) => {
  const { testId, title, attemptId } = saved;
  const client = useQueryClient();
  const query = useQuery(attemptQueries.attempt(attemptId));
  const attempt = query.data;
  const status = attempt?.status;

  useEffect(() => {
    if (status && status !== 'in_progress') clearAttempt(testId);
  }, [status, testId]);

  // Start again from what the API says now, with a loader in between
  const reload = useCallback(
    () => void client.resetQueries({ queryKey: queryKeys.attempts.attempt(attemptId) }),
    [client, attemptId],
  );

  if (!attempt) {
    if (query.isError && hasStatus(query.error, 403, 404)) {
      return (
        <TestEnded
          testId={testId}
          title="This test has ended"
          message="Start the test again to get a result."
        />
      );
    }

    if (query.isError) {
      return (
        <div className="flex w-full max-w-[480px] flex-col gap-4">
          <Alert variant="error">{describeError(query.error)}</Alert>
          <Button fullWidth={false} onClick={() => void query.refetch()}>
            Try again
          </Button>
        </div>
      );
    }

    return <PageLoader title="Loading your test" className="flex-1" />;
  }

  if (attempt.status === 'completed') {
    return <Navigate to={`/reports/${attempt.attempt_id}`} replace />;
  }

  if (attempt.status === 'expired') {
    return (
      <TestEnded
        testId={testId}
        title="Your time ran out"
        message="You did not answer enough questions in time for a result. Start the test again to get one."
      />
    );
  }

  if (attempt.status !== 'in_progress' || !attempt.question) {
    return (
      <TestEnded
        testId={testId}
        title="This test has ended"
        message="Start the test again to get a result."
      />
    );
  }

  return (
    <Player
      key={attempt.question.question_id}
      title={title}
      attempt={attempt}
      onOutOfStep={reload}
    />
  );
};

export const TestAttempt = () => {
  const { testId } = useParams();
  const id = Number(testId);

  if (!Number.isInteger(id) || id <= 0) {
    return <Navigate to="/page-not-found" replace />;
  }

  const saved = readAttempt(id);
  if (!saved) return <Navigate to={`/tests/${id}`} replace />;

  return <Attempt key={saved.attemptId} saved={saved} />;
};
