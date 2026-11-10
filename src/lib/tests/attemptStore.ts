import { readSession } from '../session';

export interface SavedAttempt {
  readonly testId: number;
  readonly title: string;
  readonly attemptId: number;
}

const keyFor = (testId: number) =>
  `careerline.attempt.${readSession()?.user.email ?? 'guest'}.${testId}`;

const isSavedAttempt = (value: unknown): value is SavedAttempt => {
  if (typeof value !== 'object' || value === null) return false;

  const { testId, title, attemptId } = value as Record<string, unknown>;
  return typeof testId === 'number' && typeof title === 'string' && typeof attemptId === 'number';
};

export const readAttempt = (testId: number): SavedAttempt | null => {
  try {
    const raw = window.localStorage.getItem(keyFor(testId));
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isSavedAttempt(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const saveAttempt = (saved: SavedAttempt) => {
  try {
    window.localStorage.setItem(keyFor(saved.testId), JSON.stringify(saved));
  } catch {
    return;
  }
};

export const clearAttempt = (testId: number) => {
  try {
    window.localStorage.removeItem(keyFor(testId));
  } catch {
    return;
  }
};
