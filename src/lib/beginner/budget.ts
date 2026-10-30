import { profileApi, type Budget, type Money } from '../api';

const LIMITS: Record<Budget, number> = {
  free_only: 0,
  under_50k: 5_000_000,
  '50k_to_200k': 20_000_000,
  over_200k: Number.POSITIVE_INFINITY,
};

export const isOverBudget = (price: Money, budget: Budget | null | undefined) =>
  Boolean(budget) && price.currency === 'NGN' && price.amount > LIMITS[budget as Budget];

export const loadBudget = (): Promise<Budget | null> =>
  profileApi.get().then(
    (profile) => profile.budget,
    () => null,
  );
