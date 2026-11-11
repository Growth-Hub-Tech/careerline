import type { CandidateTestResult } from '../api';

export const overallScore = (results: readonly CandidateTestResult[]) => {
  const shared = results.filter((result) => result.shared);
  if (shared.length === 0) return null;
  return shared.reduce((sum, result) => sum + result.percentage_score, 0) / shared.length;
};
