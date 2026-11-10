import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { PageLoader } from '../components/Loader';
import { SkillQuestion } from '../components/SkillQuestion';
import { attemptsApi, type AttemptState } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { describeError } from '../lib/api/describeError';
import { clearAttempt, readAttempt, type SavedAttempt } from '../lib/tests/attemptStore';

const isStatus = (error: unknown, ...statuses: number[]) =>
  error instanceof ApiError && statuses.includes(error.status);

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

interface PlayerProps {
  readonly title: string;
  readonly attempt: AttemptState;
  readonly onReply: (attempt: AttemptState) => void;
  readonly onOutOfStep: () => void;
}

const Player = ({ title, attempt, onReply, onOutOfStep }: PlayerProps) => {
  const [selected, setSelected] = useState<string>();
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string>();
  const sending = useRef(false);
  const question = attempt.question;

  if (!question) return null;

  const next = async () => {
    if (selected === undefined || sending.current) return;
    sending.current = true;
    setIsSending(true);
    setError(undefined);

    try {
      onReply(
        await attemptsApi.answer(attempt.attempt_id, {
          question_id: question.question_id,
          selected_option_id: Number(selected),
        }),
      );
    } catch (answerError) {
      if (isStatus(answerError, 409, 410)) {
        onOutOfStep();
        return;
      }
      setError(describeError(answerError));
      sending.current = false;
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[28px] leading-[1.25] font-bold text-slate-700 sm:text-[36px]">
          {title} Skill Test
        </h1>
        {attempt.expires_at && <Countdown expiresAt={attempt.expires_at} onTimeUp={onOutOfStep} />}
      </div>
      {error && <Alert variant="error">{error}</Alert>}
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
        isSubmitting={isSending}
      />
    </div>
  );
};

const Attempt = ({ saved }: { saved: SavedAttempt }) => {
  const { testId, title, attemptId } = saved;
  const [attempt, setAttempt] = useState<AttemptState>();
  const [loadError, setLoadError] = useState<unknown>();
  const [isMissing, setIsMissing] = useState(false);

  const show = useCallback(
    (next: AttemptState) => {
      if (next.status !== 'in_progress') clearAttempt(testId);
      setAttempt(next);
    },
    [testId],
  );

  const reload = useCallback(async () => {
    setAttempt(undefined);
    setLoadError(undefined);

    try {
      show(await attemptsApi.current(attemptId));
    } catch (error) {
      if (isStatus(error, 403, 404)) setIsMissing(true);
      else setLoadError(error);
    }
  }, [attemptId, show]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (isMissing) {
    return (
      <TestEnded
        testId={testId}
        title="This test has ended"
        message="Start the test again to get a result."
      />
    );
  }

  if (loadError) {
    return (
      <div className="flex w-full max-w-[480px] flex-col gap-4">
        <Alert variant="error">{describeError(loadError)}</Alert>
        <Button fullWidth={false} onClick={() => void reload()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!attempt) return <PageLoader title="Loading your test" className="flex-1" />;

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
      onReply={show}
      onOutOfStep={() => void reload()}
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
