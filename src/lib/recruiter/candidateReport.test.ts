import type { CandidateTestResult } from '../api';
import { overallScore } from './candidateReport';

const result = (percentage: number, shared: boolean): CandidateTestResult => ({
  test_id: 201,
  test_title: 'Frontend Web Development',
  level: 'MID',
  percentage_score: percentage,
  passed: true,
  completed_at: '2026-11-02T10:00:00Z',
  result_id: percentage,
  shared,
});

describe('overallScore', () => {
  it('averages the shared results', () => {
    expect(overallScore([result(80, true), result(60, true)])).toBe(70);
  });

  it('leaves out results the candidate has not shared', () => {
    expect(overallScore([result(80, true), result(20, false)])).toBe(80);
  });

  it('has no score when nothing is shared', () => {
    expect(overallScore([result(20, false)])).toBeNull();
    expect(overallScore([])).toBeNull();
  });
});
