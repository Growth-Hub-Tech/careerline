import { formatMoney } from './formatMoney';

describe('formatMoney', () => {
  it('shows whole naira from an amount in kobo', () => {
    expect(formatMoney({ amount: 15000000, currency: 'NGN' })).toBe('₦150,000');
  });

  it('keeps the kobo when there are any', () => {
    expect(formatMoney({ amount: 150050, currency: 'NGN' })).toBe('₦1,500.50');
  });

  it('treats a missing currency as naira', () => {
    expect(formatMoney({ amount: 500000 })).toBe('₦5,000');
  });

  it('says Free for nothing to pay', () => {
    expect(formatMoney({ amount: 0, currency: 'NGN' })).toBe('Free');
  });

  it('shows dollars from cents', () => {
    expect(formatMoney({ amount: 2500, currency: 'USD' })).toBe('$25.00');
  });
});
