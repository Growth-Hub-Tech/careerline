import { useId, useRef, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { PaymentNeeded } from '../components/PaymentNeeded';
import { QueryState } from '../components/PageState';
import type { AssessmentAccess, AssessmentDetail } from '../lib/api';
import { describeError } from '../lib/api/describeError';
import {
  catalogQueries,
  combineResults,
  useCancelAttempt,
  useStartAttempt,
} from '../lib/api/queries';
import { clearAttempt, readAttempt, saveAttempt } from '../lib/tests/attemptStore';
import { describeCredits, FORMAT_LABELS } from '../lib/tests/catalog';

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
  const cancelAttempt = useCancelAttempt();
  const [isAsking, setIsAsking] = useState(false);

  const cancel = () =>
    cancelAttempt.mutate(attemptId, {
      onSuccess: onCancelled,
      onError: () => setIsAsking(false),
    });

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-[14px] text-slate-700">You have this test in progress.</p>
      {cancelAttempt.isError && <Alert variant="error">{describeError(cancelAttempt.error)}</Alert>}
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
            <Button fullWidth={false} isLoading={cancelAttempt.isPending} onClick={cancel}>
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
  const startAttempt = useStartAttempt();
  // A second click before the first reply must not start (and pay for) a second attempt
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

  const start = () => {
    if (starting.current) return;
    starting.current = true;
    startAttempt.mutate(test.skill_id, {
      onSuccess: (attempt) => {
        saveAttempt({ testId: test.test_id, title: test.title, attemptId: attempt.attempt_id });
        navigate(attemptPath);
      },
      onError: () => {
        starting.current = false;
      },
    });
  };

  return (
    <div className="flex flex-col items-start gap-5">
      {startAttempt.isError && <Alert variant="error">{describeError(startAttempt.error)}</Alert>}
      <Button
        fullWidth={false}
        isLoading={startAttempt.isPending || startAttempt.isSuccess}
        onClick={start}
      >
        Start test
      </Button>
    </div>
  );
};

interface TestViewProps {
  readonly test: AssessmentDetail;
  readonly access: AssessmentAccess | null;
}

const TestView = ({ test, access }: TestViewProps) => {
  const listId = useId();
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

const TestDetails = ({ id }: { id: number }) => {
  const details = useQueries({
    queries: [catalogQueries.test(id), catalogQueries.access(id)],
    combine: combineResults,
  });

  return (
    <QueryState query={details} loadingTitle="Loading the test" redirectOnNotFound>
      {([test, access]) => <TestView test={test} access={access} />}
    </QueryState>
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
