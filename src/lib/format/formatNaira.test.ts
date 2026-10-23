import { formatNaira } from './formatNaira';

describe('formatNaira', () => {
  it('shows the naira sign with kobo', () => {
    expect(formatNaira(1500)).toBe('₦1,500.00');
  });

  it('shows zero', () => {
    expect(formatNaira(0)).toBe('₦0.00');
  });

  it('keeps kobo', () => {
    expect(formatNaira(1234.5)).toBe('₦1,234.50');
  });

  it('groups large amounts in thousands', () => {
    expect(formatNaira(1234567.89)).toBe('₦1,234,567.89');
  });

  it('can leave kobo out for whole-naira prices', () => {
    expect(formatNaira(1500, { withKobo: false })).toBe('₦1,500');
  });

  it('puts the minus sign before the naira sign', () => {
    expect(formatNaira(-1500)).toBe('-₦1,500.00');
  });

  it.each([null, undefined, Number.NaN, Number.POSITIVE_INFINITY])(
    'shows a dash for %s',
    (value) => {
      expect(formatNaira(value)).toBe('—');
    },
  );
});
