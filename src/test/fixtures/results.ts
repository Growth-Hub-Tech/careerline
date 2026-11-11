import type { ResultReport, ResultSummary } from '../../lib/api';

export const RESULT_SUMMARIES: readonly ResultSummary[] = [
  {
    result_id: 31,
    attempt_id: 12,
    test_id: 213,
    skill_id: 13,
    skill_name: 'Product Design',
    level: 'MID',
    percentage_score: 81,
    completed_at: '2026-10-20T10:15:00Z',
  },
  {
    result_id: 32,
    attempt_id: 14,
    test_id: 201,
    skill_id: 1,
    skill_name: 'Frontend Web Development',
    level: 'JUNIOR',
    percentage_score: 64.5,
    completed_at: '2026-10-27T15:40:00Z',
  },
];

export const REPORT_READY: ResultReport = {
  result_id: 31,
  status: 'ready',
  download_url: 'https://files.example.test/report-31.pdf',
  expires_at: '2026-10-30T10:15:00Z',
  generated_at: '2026-10-29T10:15:00Z',
};

export const REPORT_GENERATING: ResultReport = {
  ...REPORT_READY,
  status: 'generating',
  download_url: null,
  expires_at: null,
  generated_at: null,
};

export const REPORT_FAILED: ResultReport = { ...REPORT_GENERATING, status: 'failed' };
