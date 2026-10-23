import { EMPTY_VALUE } from './constants';

interface NairaOptions {
  readonly withKobo?: boolean;
}

export const formatNaira = (
  amount: number | null | undefined,
  { withKobo = true }: NairaOptions = {},
) => {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) return EMPTY_VALUE;

  const digits = withKobo ? 2 : 0;
  const formatted = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Math.abs(amount));

  return `${amount < 0 ? '-' : ''}₦${formatted}`;
};
