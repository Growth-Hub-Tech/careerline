import { useId, useState, type ReactNode } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { LuCheck } from 'react-icons/lu';
import { Button } from '../components/Button';
import { BuyDialog, type BuyItem } from '../components/BuyDialog';
import { PRIMARY_ACTION, SECONDARY_ACTION } from '../components/ErrorPage';
import { PageLoader } from '../components/Loader';
import { LoadFailed } from '../components/PageState';
import { paymentsApi, subscriptionsApi, type CreditPack, type Plan } from '../lib/api';
import { formatMoney } from '../lib/format';
import { useRequest } from '../lib/hooks/useRequest';
import { safeReturnPath } from '../lib/payments/checkoutReturn';
import { useSession, type UserType } from '../lib/session';
import { describeCredits } from '../lib/tests/catalog';

const AUDIENCES: readonly { readonly audience: Plan['audience']; readonly title: string }[] = [
  { audience: 'individual', title: 'For individuals' },
  { audience: 'recruiter', title: 'For recruiters' },
  { audience: 'organisation', title: 'For organisations' },
];

const AUDIENCE_OF: Record<UserType, Plan['audience']> = {
  beginner: 'individual',
  'self-test': 'individual',
  recruiter: 'recruiter',
  organization: 'organisation',
};

const ONLY_FOR: Record<Plan['audience'], string> = {
  individual: 'Only individual accounts can buy this plan.',
  recruiter: 'Only recruiter accounts can buy this plan.',
  organisation: 'Only organisation owners and admins can buy this plan.',
};

const PER: Record<Plan['interval'], string> = { monthly: 'a month', yearly: 'a year' };

const loadPrices = async () => {
  const [plans, packs] = await Promise.all([
    subscriptionsApi.listPlans(),
    paymentsApi.listCreditPacks(),
  ]);
  return { plans, packs };
};

const Group = ({ title, children }: { title: string; children: ReactNode }) => {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      <h2 id={headingId} className="font-heading text-[22px] font-bold text-slate-950">
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
};

const PriceCard = ({
  name,
  price,
  children,
  action,
}: {
  name: string;
  price: string;
  children?: ReactNode;
  action: ReactNode;
}) => {
  const headingId = useId();

  return (
    <article
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <div className="flex flex-col gap-1">
        <h3 id={headingId} className="text-[18px] font-bold text-slate-800">
          {name}
        </h3>
        <p className="text-[24px] font-bold text-slate-950">{price}</p>
      </div>
      <div className="flex flex-1 flex-col gap-3 text-[14px] text-slate-600">{children}</div>
      {action}
    </article>
  );
};

type BuyAction = (item: BuyItem, audience?: Plan['audience']) => ReactNode;

const planItem = (plan: Plan): BuyItem => ({
  kind: 'subscription_plan',
  id: plan.plan_id,
  name: plan.name,
  price: plan.price,
  summary: `${describeCredits(plan.credits_per_interval)} ${PER[plan.interval]}`,
  seats: plan.seats,
});

const packItem = (pack: CreditPack): BuyItem => ({
  kind: 'credit_pack',
  id: pack.pack_id,
  name: pack.name,
  price: pack.price,
  summary: describeCredits(pack.credits),
});

const PlanCard = ({ plan, action }: { plan: Plan; action: BuyAction }) => (
  <PriceCard
    name={plan.name}
    price={`${formatMoney(plan.price)} ${PER[plan.interval]}`}
    action={action(planItem(plan), plan.audience)}
  >
    <p>
      {describeCredits(plan.credits_per_interval)} {PER[plan.interval]}
    </p>
    {plan.seats !== null && <p>Up to {plan.seats} seats</p>}
    {plan.features.length > 0 && (
      <ul className="flex flex-col gap-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <LuCheck size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-600" />
            {feature}
          </li>
        ))}
      </ul>
    )}
  </PriceCard>
);

const PackCard = ({ pack, action }: { pack: CreditPack; action: BuyAction }) => (
  <PriceCard name={pack.name} price={formatMoney(pack.price)} action={action(packItem(pack))}>
    <p>{describeCredits(pack.credits)}, to use whenever you like</p>
  </PriceCard>
);

const Enterprise = () => (
  <Group title="Enterprise">
    <div className="flex flex-col gap-4 rounded-2xl bg-indigo-50 p-6 sm:col-span-2 lg:col-span-3">
      <p className="max-w-[60ch] text-[15px] text-slate-700">
        Need more seats, your own role standards or a custom set-up for your organisation? Tell us
        what you need and we will send you a quote.
      </p>
      <Link to="/quote" className={`${SECONDARY_ACTION} w-fit`}>
        Request a quote
      </Link>
    </div>
  </Group>
);

interface PricingProps {
  readonly onOpen?: (url: string) => void;
}

export const Pricing = ({ onOpen }: PricingProps) => {
  const { state, retry } = useRequest(loadPrices);
  const { session } = useSession();
  const [params] = useSearchParams();
  const [buying, setBuying] = useState<BuyItem | null>(null);
  const location = useLocation();
  const returnTo = safeReturnPath(params.get('return')) ?? '/credits';
  const ownAudience = session ? AUDIENCE_OF[session.user.userType] : null;

  const action: BuyAction = (item, audience) => {
    if (!session) {
      return (
        <Link to="/sign-in" state={{ from: location }} className={`${PRIMARY_ACTION} w-full`}>
          Log in to buy
        </Link>
      );
    }

    if (audience && audience !== ownAudience) {
      return <p className="text-[13px] text-slate-500">{ONLY_FOR[audience]}</p>;
    }

    return <Button onClick={() => setBuying(item)}>Buy</Button>;
  };

  let content: ReactNode;

  if (state.status === 'loading') {
    content = <PageLoader title="Loading prices" />;
  } else if (state.status === 'error') {
    content = <LoadFailed error={state.error} onRetry={retry} />;
  } else {
    const { plans, packs } = state.data;
    const ordered = [...AUDIENCES].sort(
      (a, b) => Number(b.audience === ownAudience) - Number(a.audience === ownAudience),
    );
    const groups = ordered
      .map(({ audience, title }) => ({
        title,
        plans: plans.filter((plan) => plan.audience === audience),
        packs: audience === 'individual' ? packs : [],
      }))
      .filter((group) => group.plans.length + group.packs.length > 0);

    content = (
      <>
        {groups.length === 0 && (
          <p className="text-[15px] text-slate-600">Prices will be listed here soon.</p>
        )}
        {groups.map((group) => (
          <Group key={group.title} title={group.title}>
            {group.plans.map((plan) => (
              <PlanCard key={plan.plan_id} plan={plan} action={action} />
            ))}
            {group.packs.map((pack) => (
              <PackCard key={pack.pack_id} pack={pack} action={action} />
            ))}
          </Group>
        ))}
        <Enterprise />
      </>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-[32px] leading-[1.2] font-bold text-slate-950">Pricing</h1>
        <p className="max-w-[60ch] text-[15px] text-slate-600">
          Pay for what you need: a plan that renews, or a pack of credits for one-off tests.
        </p>
        {!session && (
          <p className="text-[15px] text-slate-600">
            New to CareerLine AI?{' '}
            <Link to="/sign-up" className="font-semibold text-indigo-600 hover:underline">
              Create an account
            </Link>
          </p>
        )}
      </header>
      {content}
      <BuyDialog
        item={buying}
        returnTo={returnTo}
        onClose={() => setBuying(null)}
        onOpen={onOpen}
      />
    </div>
  );
};
