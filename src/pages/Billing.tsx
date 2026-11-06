import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Dialog } from '../components/Dialog';
import { PRIMARY_ACTION } from '../components/ErrorPage';
import { PageLoader } from '../components/Loader';
import { LoadFailed } from '../components/PageState';
import { StatusLabel, type Status } from '../components/StatusLabel';
import { Table, type TableColumn } from '../components/Table';
import { paymentsApi, subscriptionsApi, type Payment, type Subscription } from '../lib/api';
import { describeError } from '../lib/api/describeError';
import { formatDate, formatMoney } from '../lib/format';
import { useRequest } from '../lib/hooks/useRequest';

const PRICING = `/pricing?return=${encodeURIComponent('/billing')}`;

const LINK = 'w-fit font-medium text-indigo-700 underline hover:text-indigo-900';

const PLAN_STATUS: Record<Subscription['status'], { label: string; tone: Status }> = {
  active: { label: 'Active', tone: 'success' },
  past_due: { label: 'Payment failed', tone: 'error' },
  cancelled: { label: 'Ended', tone: 'neutral' },
};

const PAYMENT_STATUS: Record<Payment['status'], { label: string; tone: Status }> = {
  pending: { label: 'Pending', tone: 'warning' },
  paid: { label: 'Paid', tone: 'success' },
  failed: { label: 'Failed', tone: 'error' },
  abandoned: { label: 'Not completed', tone: 'neutral' },
};

const PAYMENTS: readonly TableColumn<Payment>[] = [
  { key: 'date', header: 'Date', render: (row) => formatDate(row.created_at) },
  { key: 'item', header: 'What', render: (row) => row.description },
  { key: 'amount', header: 'Amount', align: 'right', render: (row) => formatMoney(row.amount) },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <StatusLabel status={PAYMENT_STATUS[row.status].tone}>
        {PAYMENT_STATUS[row.status].label}
      </StatusLabel>
    ),
  },
];

const load = async () => {
  const [plan, payments] = await Promise.all([subscriptionsApi.mine(), paymentsApi.list()]);
  return { plan, payments };
};

const planDate = (plan: Subscription) => {
  if (plan.status === 'cancelled') return `Ended on ${formatDate(plan.current_period_end)}`;
  if (plan.cancel_at_period_end) return `Cancels on ${formatDate(plan.current_period_end)}`;
  return `Renews on ${formatDate(plan.current_period_end)}`;
};

const PlanSection = ({ initial }: { initial: Subscription | null }) => {
  const headingId = useId();
  const [plan, setPlan] = useState(initial);
  const [isAsking, setIsAsking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string>();

  const cancel = async () => {
    setIsCancelling(true);
    setError(undefined);
    try {
      setPlan(await subscriptionsApi.cancel());
      setIsAsking(false);
    } catch (cancelError) {
      setError(describeError(cancelError));
    }
    setIsCancelling(false);
  };

  const canCancel = plan?.status === 'active' && !plan.cancel_at_period_end;
  const offerAgain = plan && (plan.status !== 'active' || plan.cancel_at_period_end);

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <h2 id={headingId} className="text-[20px] font-bold text-slate-800">
        Your plan
      </h2>
      {plan?.status === 'past_due' && (
        <Alert variant="error">
          Your last payment failed. Pay by {formatDate(plan.current_period_end)} to keep your plan.
        </Alert>
      )}
      {plan ? (
        <div className="flex flex-col gap-2">
          <p className="flex flex-wrap items-center gap-3 text-[18px] font-semibold text-slate-900">
            {plan.plan_name}
            <StatusLabel status={PLAN_STATUS[plan.status].tone}>
              {PLAN_STATUS[plan.status].label}
            </StatusLabel>
          </p>
          <p className="text-[15px] text-slate-600">{planDate(plan)}</p>
          {plan.seats !== null && (
            <p className="text-[15px] text-slate-600">Up to {plan.seats} seats</p>
          )}
        </div>
      ) : (
        <p className="text-[15px] text-slate-600">You have no plan.</p>
      )}
      {error && !isAsking && <Alert variant="error">{error}</Alert>}
      <div className="flex flex-wrap gap-3">
        {canCancel && (
          <Button
            variant="transparent"
            border="solid"
            fullWidth={false}
            onClick={() => setIsAsking(true)}
          >
            Cancel plan
          </Button>
        )}
        {offerAgain && (
          <Link to={PRICING} className={`${PRIMARY_ACTION} w-fit`}>
            Subscribe again
          </Link>
        )}
        {!plan && (
          <Link to={PRICING} className={`${PRIMARY_ACTION} w-fit`}>
            Compare plans and one-off prices
          </Link>
        )}
      </div>
      {plan && (
        <Dialog
          open={isAsking}
          onClose={() => setIsAsking(false)}
          title="Cancel your plan?"
          description={`You keep it until ${formatDate(plan.current_period_end)}. After that it will not renew.`}
          footer={
            <>
              <Button
                variant="transparent"
                border="solid"
                fullWidth={false}
                onClick={() => setIsAsking(false)}
              >
                Keep my plan
              </Button>
              <Button fullWidth={false} isLoading={isCancelling} onClick={cancel}>
                Cancel plan
              </Button>
            </>
          }
        >
          {error && <Alert variant="error">{error}</Alert>}
        </Dialog>
      )}
    </section>
  );
};

export const Billing = () => {
  const { state, retry } = useRequest(load);

  let content;
  if (state.status === 'loading') {
    content = <PageLoader title="Loading your billing" className="flex-1" />;
  } else if (state.status === 'error') {
    content = <LoadFailed error={state.error} onRetry={retry} />;
  } else {
    content = (
      <>
        <PlanSection initial={state.data.plan} />
        <section className="flex flex-col gap-3">
          <h2 className="text-[20px] font-bold text-slate-800">Payments</h2>
          {state.data.payments.length === 0 ? (
            <p className="text-[15px] text-slate-600">No payments yet.</p>
          ) : (
            <Table
              caption="Payments"
              columns={PAYMENTS}
              rows={state.data.payments}
              getRowKey={(row) => `${row.reference}-${row.created_at}-${row.status}`}
            />
          )}
          <Link to="/credits" className={LINK}>
            See your credits
          </Link>
        </section>
      </>
    );
  }

  return (
    <div className="flex w-full max-w-[1100px] flex-col gap-8 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">Billing</h1>
        <p className="max-w-[60ch] text-[15px] text-slate-600">
          Your plan, when it renews, and what you have paid.
        </p>
      </header>
      {content}
    </div>
  );
};
