import { useId } from 'react';
import { Link } from 'react-router-dom';
import { LuWallet } from 'react-icons/lu';
import { describeCredits } from '../../lib/tests/catalog';

interface PaymentNeededProps {
  readonly priceCredits: number;
  readonly balance?: number;
  readonly buyHref?: string;
}

export const PaymentNeeded = ({
  priceCredits,
  balance,
  buyHref = '/pricing',
}: PaymentNeededProps) => {
  const headingId = useId();
  const shortfall = balance === undefined ? 0 : Math.max(priceCredits - balance, 1);

  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800"
        >
          <LuWallet size={20} />
        </span>
        <div className="flex flex-col gap-1 text-[14px] leading-[1.55] text-amber-950">
          <h2 id={headingId} className="font-heading text-[18px] font-bold text-slate-950">
            Payment needed
          </h2>
          <p>This test costs {describeCredits(priceCredits)}.</p>
          {balance !== undefined && (
            <p>
              You have {describeCredits(balance)}. Buy {shortfall} more to start.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={buyHref}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-indigo-600 px-4 text-[15px] font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Buy credits
        </Link>
        <Link
          to="/tests"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-[15px] font-medium text-slate-800 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Back to tests
        </Link>
      </div>
    </section>
  );
};
