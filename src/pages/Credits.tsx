import { Link } from 'react-router-dom';
import { PRIMARY_ACTION } from '../components/ErrorPage';
import { PageLoader } from '../components/Loader';
import { Table, type TableColumn } from '../components/Table';
import { LoadFailed } from '../components/PageState';
import { paymentsApi, type CreditTransaction } from '../lib/api';
import { formatDate } from '../lib/format';
import { useRequest } from '../lib/hooks/useRequest';
import { describeCredits } from '../lib/tests/catalog';

const REASONS: Record<CreditTransaction['reason'], string> = {
  purchase: 'Bought credits',
  test_started: 'Started a test',
  refund: 'Refund',
  subscription_grant: 'Credits from your plan',
};

const COLUMNS: readonly TableColumn<CreditTransaction>[] = [
  { key: 'date', header: 'Date', render: (row) => formatDate(row.created_at) },
  { key: 'reason', header: 'What happened', render: (row) => REASONS[row.reason] },
  {
    key: 'change',
    header: 'Change',
    align: 'right',
    render: (row) => (row.change > 0 ? `+${row.change}` : `−${Math.abs(row.change)}`),
  },
  { key: 'balance', header: 'Balance after', align: 'right', render: (row) => row.balance_after },
];

const load = () => paymentsApi.credits();

export const Credits = () => {
  const { state, retry } = useRequest(load);

  if (state.status === 'loading') {
    return <PageLoader title="Loading your credits" className="flex-1" />;
  }

  if (state.status === 'error') {
    return <LoadFailed error={state.error} onRetry={retry} className="px-5 py-8 sm:px-8" />;
  }

  const { credits_balance: balance, transactions } = state.data;

  return (
    <div className="flex w-full max-w-[1100px] flex-col gap-8 px-5 py-10 sm:px-20">
      <header className="flex flex-col gap-3">
        <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">Credits</h1>
        <p className="text-[15px] text-slate-600">You have {describeCredits(balance)}.</p>
        <Link
          to={`/pricing?return=${encodeURIComponent('/credits')}`}
          className={`${PRIMARY_ACTION} w-fit`}
        >
          Buy credits
        </Link>
      </header>

      {transactions.length === 0 ? (
        <p className="text-[15px] text-slate-600">No credit activity yet.</p>
      ) : (
        <Table
          caption="Credit history"
          columns={COLUMNS}
          rows={transactions}
          getRowKey={(row) => String(row.transaction_id)}
        />
      )}
    </div>
  );
};
