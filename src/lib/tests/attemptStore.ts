import type { AttemptAnswer, StartedAttempt } from '../api/types';
import { readSession } from '../session';

export interface SavedAttempt {
  readonly testId: number;
  readonly title: string;
  readonly attempt: StartedAttempt;
  readonly answers: readonly AttemptAnswer[];
}

const keyFor = (testId: number) =>
  `careerline.attempt.${readSession()?.user.email ?? 'guest'}.${testId}`;

const isSavedAttempt = (value: unknown): value is SavedAttempt => {
  if (typeof value !== 'object' || value === null) return false;

  const { testId, title, attempt, answers } = value as Record<string, unknown>;
  if (typeof testId !== 'number' || typeof title !== 'string' || !Array.isArray(answers)) {
    return false;
  }
  if (typeof attempt !== 'object' || attempt === null) return false;

  const { attempt_id, questions } = attempt as Record<string, unknown>;
  return typeof attempt_id === 'number' && Array.isArray(questions);
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
