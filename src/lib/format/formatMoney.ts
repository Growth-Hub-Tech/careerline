import { formatNaira } from './formatNaira';

interface MoneyLike {
  readonly amount: number;
  readonly currency?: string;
}

export const formatMoney = ({ amount, currency = 'NGN' }: MoneyLike) => {
  if (amount === 0) return 'Free';

  const major = amount / 100;

  if (currency === 'NGN') return formatNaira(major, { withKobo: amount % 100 !== 0 });

  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(major);
};
