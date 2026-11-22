import { firstNameOf, formatPercent } from './formatPercent';

describe('formatPercent', () => {
  it('rounds to a whole percent', () => {
    expect(formatPercent(66.6)).toBe('67%');
    expect(formatPercent(0)).toBe('0%');
  });

  it('shows a dash without a score', () => {
    expect(formatPercent(null)).toBe('—');
  });
});

describe('firstNameOf', () => {
  it('takes the first word of the name', () => {
    expect(firstNameOf('  Skye Favour ')).toBe('Skye');
    expect(firstNameOf('')).toBe('');
  });
});
