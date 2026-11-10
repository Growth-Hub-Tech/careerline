import { useState } from 'react';
import { paymentsApi, subscriptionsApi, type Checkout, type Money } from '../../lib/api';
import { describeError } from '../../lib/api/describeError';
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

const openUrl = (url: string) => window.location.assign(url);

const startCheckout = (item: BuyItem): Promise<Checkout> =>
  item.kind === 'credit_pack'
    ? paymentsApi.checkout({
        item_type: 'credit_pack',
        item_id: item.id,
        callback_url: callbackUrl(),
      })
    : subscriptionsApi.subscribe({ plan_id: item.id, callback_url: callbackUrl() });

interface BuyDialogProps {
  readonly item: BuyItem | null;
  readonly returnTo: string;
  readonly onClose: () => void;
  readonly onOpen?: (url: string) => void;
}

export const BuyDialog = ({ item, returnTo, onClose, onOpen = openUrl }: BuyDialogProps) => {
  const [error, setError] = useState<string>();
  const [isPaying, setIsPaying] = useState(false);

  if (!item) return null;

  const close = () => {
    setError(undefined);
    onClose();
  };

  const pay = async () => {
    setError(undefined);
    setIsPaying(true);

    try {
      const checkout = await startCheckout(item);
      rememberReturn(returnTo);
      onOpen(checkout.authorization_url);
    } catch (checkoutError) {
      setError(describeError(checkoutError));
      setIsPaying(false);
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
          <Button fullWidth={false} isLoading={isPaying} onClick={pay}>
            Pay {price}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 text-[15px] text-slate-700">
        <p className="text-[24px] font-bold text-slate-950">{price}</p>
        <p>{item.summary}</p>
        {item.seats ? <p>For up to {item.seats} seats</p> : null}
        {error && <Alert variant="error">{error}</Alert>}
      </div>
    </Dialog>
  );
};
