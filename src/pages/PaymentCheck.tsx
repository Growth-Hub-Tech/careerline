import { useEffect, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { PRIMARY_ACTION, SECONDARY_ACTION } from '../components/ErrorPage';
import { PageLoader } from '../components/Loader';
import { queryKeys } from '../lib/api';
import { describeError } from '../lib/api/describeError';
import { paymentQueries } from '../lib/api/queries';
import { clearReturn, readReturn } from '../lib/payments/checkoutReturn';
import { describeCredits } from '../lib/tests/catalog';

// Paystack can take a moment to confirm: ask every 3 seconds, 10 times at most
const POLL_INTERVAL = 3000;
const MAX_CHECKS = 10;

const Panel = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="mx-auto flex w-full max-w-[560px] flex-col gap-4 rounded-2xl bg-white p-6 sm:p-8">
    <h1 className="font-heading text-[26px] leading-[1.25] font-bold text-slate-950">{title}</h1>
    {children}
  </div>
);

const PaymentStatus = ({ reference }: { reference: string }) => {
  const client = useQueryClient();
  const [returnTo] = useState(() => readReturn() ?? '/credits');
  const check = useQuery({
    ...paymentQueries.payment(reference),
    retry: false,
    refetchInterval: ({ state }) => {
      const checks = state.dataUpdateCount + state.errorUpdateCount;
      if (checks >= MAX_CHECKS || (state.data && state.data.status !== 'pending')) return false;
      return POLL_INTERVAL;
    },
  });
  const state = client.getQueryState(queryKeys.payments.payment(reference));
  const checks = (state?.dataUpdateCount ?? 0) + (state?.errorUpdateCount ?? 0);
  const payment = check.data;
  const isPaid = payment?.status === 'paid';

  useEffect(() => {
    if (isPaid) clearReturn();
  }, [isPaid]);

  const checkAgain = () =>
    void client.resetQueries({ queryKey: queryKeys.payments.payment(reference) });

  let content: ReactNode;

  if (isPaid) {
    const added = payment.credits_added;
    content = (
      <Panel title="Payment received">
        <p className="text-[15px] text-slate-600">
          {added > 0
            ? `${describeCredits(added)} ${added === 1 ? 'was' : 'were'} added to your account.`
            : 'Thank you. Your plan is now active.'}
        </p>
        <Link to={returnTo} className={`${PRIMARY_ACTION} w-fit`}>
          Continue
        </Link>
      </Panel>
    );
  } else if (payment && payment.status !== 'pending') {
    content = (
      <Panel title="Payment not completed">
        <p className="text-[15px] text-slate-600">You have not been charged. You can try again.</p>
        <Link
          to={`/pricing?return=${encodeURIComponent(returnTo)}`}
          className={`${PRIMARY_ACTION} w-fit`}
        >
          Try again
        </Link>
      </Panel>
    );
  } else if (checks < MAX_CHECKS) {
    content = <PageLoader title="Checking your payment" />;
  } else {
    content = (
      <Panel title="Your payment is not confirmed yet">
        <p className="text-[15px] text-slate-600">
          Your payment is safe. Paystack can take a few minutes to confirm it, and your credits will
          be added as soon as it does.
        </p>
        {check.isError && <Alert variant="error">{describeError(check.error)}</Alert>}
        <div className="flex flex-wrap gap-3">
          <Button fullWidth={false} onClick={checkAgain}>
            Check again
          </Button>
          <Link to="/credits" className={SECONDARY_ACTION}>
            Go to your credits
          </Link>
        </div>
      </Panel>
    );
  }

  return <div className="flex w-full flex-1 flex-col px-5 py-10 sm:px-8">{content}</div>;
};

export const PaymentCheck = () => {
  const [params] = useSearchParams();
  const reference = params.get('reference') ?? params.get('trxref');

  if (!reference) return <Navigate to="/credits" replace />;

  return <PaymentStatus key={reference} reference={reference} />;
};
