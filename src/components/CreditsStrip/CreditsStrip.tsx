import { useId } from 'react';
import { Link } from 'react-router-dom';
import { LuWallet } from 'react-icons/lu';
import { paymentsApi } from '../../lib/api';
import { useRequest } from '../../lib/hooks/useRequest';
import { describeCredits } from '../../lib/tests/catalog';

const LINK_CLASS =
  'text-[14px] font-medium text-indigo-800 underline hover:text-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';

const load = () => paymentsApi.credits();

interface CreditsStripProps {
  readonly returnTo?: string;
}

export const CreditsStrip = ({ returnTo = '/dashboard' }: CreditsStripProps) => {
  const headingId = useId();
  const { state } = useRequest(load);

  if (state.status !== 'success') return null;

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-slate-200 bg-white px-5 py-4"
    >
      <h2 id={headingId} className="sr-only">
        Your credits
      </h2>
      <p className="inline-flex items-center gap-2 text-[15px] font-medium text-slate-800">
        <LuWallet size={18} aria-hidden="true" className="text-indigo-700" />
        You have {describeCredits(state.data.credits_balance)}
      </p>
      <Link to={`/pricing?return=${encodeURIComponent(returnTo)}`} className={LINK_CLASS}>
        Buy credits
      </Link>
      <Link to="/credits" className={LINK_CLASS}>
        View history
      </Link>
    </section>
  );
};
