import { useCallback, useId } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { PageLoader } from '../components/Loader';
import { PaymentNeeded } from '../components/PaymentNeeded';
import { catalogApi, type AssessmentAccess } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { describeError } from '../lib/api/describeError';
import { useRequest } from '../lib/hooks/useRequest';
import { describeCredits, FORMAT_LABELS } from '../lib/tests/catalog';

const isStatus = (error: unknown, status: number) =>
  error instanceof ApiError && error.status === status;

const describeAccess = ({ reason, price_credits, credits_balance }: AssessmentAccess) => {
  if (reason === 'free') return 'This test is free.';
  if (reason === 'subscription') return 'Your subscription covers this test.';
  return `This test uses ${describeCredits(price_credits)}. You have ${describeCredits(credits_balance)}.`;
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
        <p className="text-[14px] text-slate-700">{describeAccess(access)}</p>
      ) : (
        <PaymentNeeded
          priceCredits={access?.price_credits ?? test.price_credits}
          balance={access?.credits_balance}
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
