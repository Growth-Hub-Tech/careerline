import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { PageLoader } from '../components/Loader';
import type { IntakeSubmission } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { describeError } from '../lib/api/describeError';
import { useSubmitIntake } from '../lib/api/queries';
import { flaggedAnswers } from '../lib/beginner/flaggedAnswers';

const TIME_LIMIT = 30_000;

const Problem = ({ children }: { children: ReactNode }) => (
  <main className="flex min-h-dvh items-center justify-center bg-indigo-600 px-5">
    <div className="flex w-full max-w-[480px] flex-col gap-4 rounded-xl bg-white p-6">
      {children}
    </div>
  </main>
);

export const AssessmentProcessing = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state: { submission?: IntakeSubmission } | null };
  const submission = location.state?.submission;
  const submitIntake = useSubmitIntake();
  const { mutate } = submitIntake;
  const [timedOut, setTimedOut] = useState(false);
  const sent = useRef(false);

  // The ranked paths go into the cache, where the results page finds them
  const send = useCallback(() => {
    if (!submission) return;
    mutate(submission, {
      onSuccess: () => navigate('/assessment/results', { replace: true }),
    });
  }, [submission, mutate, navigate]);

  // Sent once when the page opens (React's StrictMode runs effects twice in development)
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    send();
  }, [send]);

  const isWaiting = submitIntake.isPending;
  useEffect(() => {
    if (!isWaiting || timedOut) return undefined;
    const timer = setTimeout(() => setTimedOut(true), TIME_LIMIT);
    return () => clearTimeout(timer);
  }, [isWaiting, timedOut]);

  if (!submission) {
    return <Navigate to="/assessment" replace />;
  }

  const tryAgain = () => {
    setTimedOut(false);
    send();
  };

  if (submitIntake.isError) {
    const { error } = submitIntake;
    const flagged = error instanceof ApiError ? flaggedAnswers(submission, error.fieldErrors) : {};

    if (Object.keys(flagged).length > 0) {
      return <Navigate to="/assessment" replace state={{ submission, flagged }} />;
    }

    return (
      <Problem>
        <Alert variant="error">{describeError(error)}</Alert>
        <div className="flex flex-wrap items-center gap-4">
          <Button fullWidth={false} onClick={tryAgain}>
            Try again
          </Button>
          <Link
            to="/assessment"
            replace
            state={{ submission }}
            className="rounded-md text-[15px] font-medium text-indigo-800 underline hover:text-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Review your answers
          </Link>
        </div>
      </Problem>
    );
  }

  if (timedOut && isWaiting) {
    return (
      <Problem>
        <Alert variant="error">
          Preparing your results is taking longer than it should. Your answers are safe. Try again
          in a moment.
        </Alert>
        <Button fullWidth={false} onClick={tryAgain}>
          Try again
        </Button>
      </Problem>
    );
  }

  return (
    <main>
      <PageLoader
        variant="brand"
        fullScreen
        title="Matching your answers to real career paths."
        description="This usually takes a few seconds. CareerLine AI is comparing your responses against the profiles of people who have thrived on each path."
      />
    </main>
  );
};
