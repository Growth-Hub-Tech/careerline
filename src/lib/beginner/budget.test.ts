import { isOverBudget } from './budget';

const naira = (amount: number) => ({ amount: amount * 100, currency: 'NGN' as const });

describe('isOverBudget', () => {
  it.each([
    ['free_only', 0, false],
    ['free_only', 1, true],
    ['under_50k', 49_999, false],
    ['under_50k', 50_001, true],
    ['50k_to_200k', 200_000, false],
    ['50k_to_200k', 200_001, true],
    ['over_200k', 5_000_000, false],
  ] as const)('with a %s budget, ₦%i is over: %s', (budget, amount, expected) => {
    expect(isOverBudget(naira(amount), budget)).toBe(expected);
  });

  it('never flags when the budget is unknown', () => {
    expect(isOverBudget(naira(1_000_000), null)).toBe(false);
    expect(isOverBudget(naira(1_000_000), undefined)).toBe(false);
  });

  it('never flags a price in another currency', () => {
    expect(isOverBudget({ amount: 900_000, currency: 'USD' }, 'free_only')).toBe(false);
  });
});
