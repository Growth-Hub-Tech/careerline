import { useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { PRIMARY_ACTION, SECONDARY_ACTION } from '../components/ErrorPage';
import { PageLoader } from '../components/Loader';
import { paymentsApi, type Payment } from '../lib/api';
import { describeError } from '../lib/api/describeError';
import { clearReturn, readReturn } from '../lib/payments/checkoutReturn';
import { describeCredits } from '../lib/tests/catalog';

type Check =
  | { readonly phase: 'checking' }
  | { readonly phase: 'paid'; readonly payment: Payment }
  | { readonly phase: 'failed' }
  | { readonly phase: 'unconfirmed'; readonly error?: string };

const Panel = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="mx-auto flex w-full max-w-[560px] flex-col gap-4 rounded-2xl bg-white p-6 sm:p-8">
    <h1 className="font-heading text-[26px] leading-[1.25] font-bold text-slate-950">{title}</h1>
    {children}
  </div>
);

interface PaymentCheckProps {
  readonly pollInterval?: number;
  readonly maxChecks?: number;
}

export const PaymentCheck = ({ pollInterval = 3000, maxChecks = 10 }: PaymentCheckProps) => {
  const [params] = useSearchParams();
  const reference = params.get('reference') ?? params.get('trxref');
  const [returnTo] = useState(() => readReturn() ?? '/credits');
  const [check, setCheck] = useState<Check>({ phase: 'checking' });
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!reference) return undefined;

    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let checks = 0;

    const run = async () => {
      checks += 1;
      try {
        const payment = await paymentsApi.get(reference);
        if (!active) return;
        if (payment.status === 'paid') {
          setCheck({ phase: 'paid', payment });
          return;
        }
        if (payment.status !== 'pending') {
          setCheck({ phase: 'failed' });
          return;
        }
        if (checks >= maxChecks) {
          setCheck({ phase: 'unconfirmed' });
          return;
        }
      } catch (error) {
        if (!active) return;
        if (checks >= maxChecks) {
          setCheck({ phase: 'unconfirmed', error: describeError(error) });
          return;
        }
      }
      timer = setTimeout(() => void run(), pollInterval);
    };

    void run();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [reference, round, pollInterval, maxChecks]);

  useEffect(() => {
    if (check.phase === 'paid') clearReturn();
  }, [check.phase]);

  if (!reference) return <Navigate to="/credits" replace />;

  const checkAgain = () => {
    setCheck({ phase: 'checking' });
    setRound((count) => count + 1);
  };

  let content: ReactNode;

  if (check.phase === 'checking') {
    content = <PageLoader title="Checking your payment" />;
  } else if (check.phase === 'paid') {
    const added = check.payment.credits_added;
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
  } else if (check.phase === 'failed') {
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
  } else {
    content = (
      <Panel title="Your payment is not confirmed yet">
        <p className="text-[15px] text-slate-600">
          Your payment is safe. Paystack can take a few minutes to confirm it, and your credits will
          be added as soon as it does.
        </p>
        {check.error && <Alert variant="error">{check.error}</Alert>}
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
