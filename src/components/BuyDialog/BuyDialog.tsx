import type { Checkout, Money } from '../../lib/api';
import { describeError } from '../../lib/api/describeError';
import { useCheckout, useSubscribe } from '../../lib/api/queries';
import { formatMoney } from '../../lib/format';
import { callbackUrl, rememberReturn } from '../../lib/payments/checkoutReturn';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { Dialog } from '../Dialog';

export interface BuyItem {
  readonly kind: 'credit_pack' | 'subscription_plan';
  readonly id: number;
  readonly name: string;
  readonly price: Money;
  readonly summary: string;
  readonly seats?: number | null;
}

interface BuyDialogProps {
  readonly item: BuyItem | null;
  readonly returnTo: string;
  readonly onClose: () => void;
}

export const BuyDialog = ({ item, returnTo, onClose }: BuyDialogProps) => {
  const checkout = useCheckout();
  const subscribe = useSubscribe();

  if (!item) return null;

  const purchase = item.kind === 'credit_pack' ? checkout : subscribe;

  const close = () => {
    checkout.reset();
    subscribe.reset();
    onClose();
  };

  // Paystack's page takes over: the button keeps spinning while the browser leaves
  const goToPaystack = ({ authorization_url }: Checkout) => {
    rememberReturn(returnTo);
    window.location.assign(authorization_url);
  };

  const pay = () => {
    if (item.kind === 'credit_pack') {
      checkout.mutate(
        { item_type: 'credit_pack', item_id: item.id, callback_url: callbackUrl() },
        { onSuccess: goToPaystack },
      );
    } else {
      subscribe.mutate(
        { plan_id: item.id, callback_url: callbackUrl() },
        { onSuccess: goToPaystack },
      );
    }
  };

  const price = formatMoney(item.price);

  return (
    <Dialog
      open
      onClose={close}
      title={`Buy ${item.name}`}
      description="You will pay on Paystack's secure page, then come straight back here."
      footer={
        <>
          <Button variant="transparent" border="solid" fullWidth={false} onClick={close}>
            Cancel
          </Button>
          <Button
            fullWidth={false}
            isLoading={purchase.isPending || purchase.isSuccess}
            onClick={pay}
          >
            Pay {price}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 text-[15px] text-slate-700">
        <p className="text-[24px] font-bold text-slate-950">{price}</p>
        <p>{item.summary}</p>
        {item.seats ? <p>For up to {item.seats} seats</p> : null}
        {purchase.isError && <Alert variant="error">{describeError(purchase.error)}</Alert>}
      </div>
    </Dialog>
  );
};
