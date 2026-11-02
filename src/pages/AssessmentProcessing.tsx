import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { PageLoader } from '../components/Loader';
import { beginnerApi, type BeginnerPath, type IntakeSubmission } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { describeError } from '../lib/api/describeError';
import { flaggedAnswers } from '../lib/beginner/flaggedAnswers';
import { useRequest } from '../lib/hooks/useRequest';

const TIME_LIMIT = 30_000;

const inflight = new WeakMap<IntakeSubmission, Promise<BeginnerPath>>();

const submitOnce = (submission: IntakeSubmission) => {
  let request = inflight.get(submission);

  if (!request) {
    request = beginnerApi.submitIntake(submission);
    inflight.set(submission, request);
    request.catch(() => inflight.delete(submission));
  }

  return request;
};

const Problem = ({ children }: { children: ReactNode }) => (
  <main className="flex min-h-dvh items-center justify-center bg-indigo-600 px-5">
    <div className="flex w-full max-w-[480px] flex-col gap-4 rounded-xl bg-white p-6">
      {children}
    </div>
  </main>
);

interface AssessmentProcessingProps {
  readonly timeLimit?: number;
}

export const AssessmentProcessing = ({ timeLimit = TIME_LIMIT }: AssessmentProcessingProps) => {
  const navigate = useNavigate();
  const location = useLocation() as { state: { submission?: IntakeSubmission } | null };
  const submission = location.state?.submission;
  const [timedOut, setTimedOut] = useState(false);

  const submit = useCallback(
    () => (submission ? submitOnce(submission) : Promise.reject(new Error('No answers to send'))),
    [submission],
  );
  const { state, retry } = useRequest(submit);

  useEffect(() => {
    if (state.status === 'success') {
      navigate('/assessment/results', { replace: true, state: { path: state.data } });
    }
  }, [state, navigate]);

  useEffect(() => {
    if (!submission || state.status !== 'loading' || timedOut) return undefined;

    const timer = setTimeout(() => {
      inflight.delete(submission);
      setTimedOut(true);
    }, timeLimit);

    return () => clearTimeout(timer);
  }, [submission, state, timedOut, timeLimit]);

  if (!submission) {
    return <Navigate to="/assessment" replace />;
  }

  const tryAgain = () => {
    setTimedOut(false);
    retry();
  };

  if (state.status === 'error') {
    const flagged =
      state.error instanceof ApiError ? flaggedAnswers(submission, state.error.fieldErrors) : {};

    if (Object.keys(flagged).length > 0) {
      return <Navigate to="/assessment" replace state={{ submission, flagged }} />;
    }

    return (
      <Problem>
        <Alert variant="error">{describeError(state.error)}</Alert>
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

  if (timedOut && state.status === 'loading') {
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
