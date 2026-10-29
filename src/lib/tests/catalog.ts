import type { AssessmentSummary, LevelName, Skill } from '../api/types';

export const LEVEL_LABELS: Record<LevelName, string> = {
  BEGINNER: 'Beginner',
  JUNIOR: 'Junior',
  MID: 'Mid',
  ADVANCED: 'Advanced',
};

export interface CatalogEntry {
  readonly test: AssessmentSummary;
  readonly skill: Skill;
}

export interface CatalogGroup {
  readonly category: string;
  readonly entries: readonly CatalogEntry[];
}

export const FORMAT_LABELS: Record<AssessmentSummary['format'], string> = {
  adaptive: 'Adaptive',
  fixed: 'Fixed',
};

const UNKNOWN_POSITION = Number.MAX_SAFE_INTEGER;

export const groupByCategory = (
  skills: readonly Skill[],
  tests: readonly AssessmentSummary[],
): CatalogGroup[] => {
  const skillById = new Map(skills.map((skill) => [skill.skill_id, skill]));
  const position = new Map(skills.map((skill, index) => [skill.skill_id, index]));

  const entries = [...tests]
    .sort(
      (a, b) =>
        (position.get(a.skill_id) ?? UNKNOWN_POSITION) -
        (position.get(b.skill_id) ?? UNKNOWN_POSITION),
    )
    .map<CatalogEntry>((test) => ({
      test,
      skill: skillById.get(test.skill_id) ?? {
        skill_id: test.skill_id,
        skill_name: test.skill_name,
        category: 'Other',
        description: '',
      },
    }));

  const groups = new Map<string, CatalogEntry[]>();
  entries.forEach((entry) => {
    groups.set(entry.skill.category, [...(groups.get(entry.skill.category) ?? []), entry]);
  });

  return [...groups].map(([category, items]) => ({ category, entries: items }));
};

export const describeCredits = (credits: number) =>
  `${credits} ${credits === 1 ? 'credit' : 'credits'}`;

export const describePrice = (credits: number) =>
  credits === 0 ? 'Free' : describeCredits(credits);

export const describeLevels = (levels: readonly LevelName[]) =>
  levels.map((level) => LEVEL_LABELS[level]).join(', ');
