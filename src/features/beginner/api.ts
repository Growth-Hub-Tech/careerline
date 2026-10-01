import { apiService } from '../../services/api';
import { mapAnswers } from '../../utils/mapAnswers';
import type { RecommendationItem } from '../../types/api';
import type { CareerPath } from './types';

const toPercent = (value: number): number => Math.round(value <= 1 ? value * 100 : value);

const toCareerPath = (item: RecommendationItem): CareerPath => {
  const title = item.career_name ?? item.career_id;

  return {
    id: item.career_id,
    title,
    reason: item.reasons[0] ?? '',
    matchScore: toPercent(item.fitness_pct),
    programme: {
      name: `Incubate: ${title} Foundations`,
      description: item.next_steps.join(' '),
    },
    whyThisProgramme: item.reasons,
  };
};

export const submitAssessment = async (answers: Record<string, string>): Promise<CareerPath[]> => {
  const response = await apiService.submitOnboarding(mapAnswers(answers));
  return response.recommendations.map(toCareerPath);
};
