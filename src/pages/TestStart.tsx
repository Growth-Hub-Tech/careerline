import { useCallback, useId, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { PageLoader } from '../components/Loader';
import { Dialog } from '../components/Dialog';
import { PaymentNeeded } from '../components/PaymentNeeded';
import { attemptsApi, catalogApi, type AssessmentAccess, type AssessmentDetail } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { describeError } from '../lib/api/describeError';
import { useRequest } from '../lib/hooks/useRequest';
import { clearAttempt, readAttempt, saveAttempt } from '../lib/tests/attemptStore';
import { describeCredits, FORMAT_LABELS } from '../lib/tests/catalog';

const isStatus = (error: unknown, status: number) =>
  error instanceof ApiError && error.status === status;

const describeAccess = ({ reason, price_credits, credits_balance }: AssessmentAccess) => {
  if (reason === 'free') return 'This test is free.';
  if (reason === 'subscription') return 'Your subscription covers this test.';
  return `This test uses ${describeCredits(price_credits)}. You have ${describeCredits(credits_balance)}.`;
};

interface InProgressProps {
  readonly attemptId: number;
  readonly attemptPath: string;
  readonly onCancelled: () => void;
}

const InProgress = ({ attemptId, attemptPath, onCancelled }: InProgressProps) => {
  const [isAsking, setIsAsking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string>();

  const cancel = async () => {
    setIsCancelling(true);
    setError(undefined);
    try {
      await attemptsApi.cancel(attemptId);
      onCancelled();
    } catch (cancelError) {
      setError(describeError(cancelError));
      setIsAsking(false);
      setIsCancelling(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-[14px] text-slate-700">You have this test in progress.</p>
      {error && <Alert variant="error">{error}</Alert>}
      <div className="flex flex-wrap gap-3">
        <Link
          to={attemptPath}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-indigo-600 px-5 text-[16px] font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Continue test
        </Link>
        <Button
          variant="transparent"
          border="solid"
          fullWidth={false}
          onClick={() => setIsAsking(true)}
        >
          Start again
        </Button>
      </div>
      <Dialog
        open={isAsking}
        onClose={() => setIsAsking(false)}
        title="Start this test again?"
        description="Your answers so far are thrown away and this attempt gets no result."
        footer={
          <>
            <Button
              variant="transparent"
              border="solid"
              fullWidth={false}
              onClick={() => setIsAsking(false)}
            >
              Keep going
            </Button>
            <Button fullWidth={false} isLoading={isCancelling} onClick={cancel}>
              Start again
            </Button>
          </>
        }
      />
    </div>
  );
};

const StartTest = ({ test }: { test: AssessmentDetail }) => {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string>();
  const starting = useRef(false);
  const [saved, setSaved] = useState(() => readAttempt(test.test_id));
  const attemptPath = `/tests/${test.test_id}/attempt`;

  if (saved) {
    return (
      <InProgress
        attemptId={saved.attemptId}
        attemptPath={attemptPath}
        onCancelled={() => {
          clearAttempt(test.test_id);
          setSaved(null);
        }}
      />
    );
  }

  const start = async () => {
    if (starting.current) return;
    starting.current = true;
    setIsStarting(true);
    setError(undefined);

    try {
      const attempt = await attemptsApi.start(test.skill_id);
      saveAttempt({ testId: test.test_id, title: test.title, attemptId: attempt.attempt_id });
      navigate(attemptPath);
    } catch (startError) {
      setError(describeError(startError));
      starting.current = false;
      setIsStarting(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-5">
      {error && <Alert variant="error">{error}</Alert>}
      <Button fullWidth={false} isLoading={isStarting} onClick={start}>
        Start test
      </Button>
    </div>
  );
};

const TestDetails = ({ id }: { id: number }) => {
  const listId = useId();

  const load = useCallback(async () => {
    const [test, access] = await Promise.all([
      catalogApi.getTest(id),
      catalogApi.getAccess(id).catch((error: unknown) => {
        if (isStatus(error, 402)) return undefined;
        throw error;
      }),
    ]);
    return { test, access };
  }, [id]);
  const { state, retry } = useRequest(load);

  if (state.status === 'loading') {
    return <PageLoader title="Loading the test" className="flex-1" />;
  }

  if (state.status === 'error') {
    if (isStatus(state.error, 404)) return <Navigate to="/page-not-found" replace />;

    return (
      <div className="flex w-full max-w-[480px] flex-col gap-4">
        <Alert variant="error">{describeError(state.error)}</Alert>
        <Button fullWidth={false} onClick={retry}>
          Try again
        </Button>
      </div>
    );
  }

  const { test, access } = state.data;
  const facts = [
    `${test.question_count} questions`,
    `${test.duration_minutes} minutes`,
    FORMAT_LABELS[test.format],
  ].join(' · ');

  return (
    <div className="flex flex-col gap-6 rounded-2xl bg-white p-6 sm:p-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-[28px] leading-[1.25] font-bold text-slate-950">
          {test.title}
        </h1>
        <p className="max-w-[60ch] text-[15px] leading-[1.55] text-slate-600">{test.description}</p>
        <p className="text-[14px] font-medium text-slate-700">{facts}</p>
      </header>

      {test.what_you_get.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 id={listId} className="text-[16px] font-semibold text-slate-950">
            What you get
          </h2>
          <ul
            aria-labelledby={listId}
            className="flex list-disc flex-col gap-1 pl-5 text-[14px] text-slate-700"
          >
            {test.what_you_get.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {access?.can_start ? (
        <>
          <p className="text-[14px] text-slate-700">{describeAccess(access)}</p>
          <StartTest test={test} />
        </>
      ) : (
        <PaymentNeeded
          priceCredits={access?.price_credits ?? test.price_credits}
          balance={access?.credits_balance}
          buyHref={`/pricing?return=${encodeURIComponent(`/tests/${test.test_id}`)}`}
        />
      )}
    </div>
  );
};

export const TestStart = () => {
  const { testId } = useParams();
  const id = Number(testId);

  if (!Number.isInteger(id) || id <= 0) {
    return <Navigate to="/page-not-found" replace />;
  }

  return <TestDetails key={id} id={id} />;
};
