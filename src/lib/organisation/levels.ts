import type { LevelName } from '../api';
import { LEVEL_LABELS } from '../tests/catalog';

export const LEVEL_ORDER: readonly LevelName[] = ['BEGINNER', 'JUNIOR', 'MID', 'ADVANCED'];

export const compareToStandard = (current: LevelName | null, standard: LevelName) => {
  const label = LEVEL_LABELS[standard];
  if (!current) return `${label}: not measured yet`;

  const gap = LEVEL_ORDER.indexOf(standard) - LEVEL_ORDER.indexOf(current);
  if (gap <= 0) return `${label}: meets it`;
  return `${label}: ${gap} ${gap === 1 ? 'level' : 'levels'} below`;
};
