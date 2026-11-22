import { EMPTY_VALUE } from './constants';

export const formatPercent = (score: number | null | undefined) =>
  score === null || score === undefined ? EMPTY_VALUE : `${Math.round(score)}%`;

export const firstNameOf = (name: string) => name.trim().split(/\s+/)[0] ?? '';
