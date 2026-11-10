import type { ResultDetail, ResultReport, ResultSummary, SkillHistory } from '../../lib/api';

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

export const RESULT_DETAIL: ResultDetail = {
  ...RESULT_SUMMARIES[0],
  confidence: 0.82,
  confidence_label: 'high',
  percentile: 72,
  subskills: [
    { subskill_id: 1, subskill_name: 'UI Design', percentage_score: 81, band: 'strong' },
    { subskill_id: 2, subskill_name: 'UX Research', percentage_score: 64.4, band: 'developing' },
    { subskill_id: 3, subskill_name: 'Prototyping', percentage_score: 30, band: 'weak' },
  ],
  strengths: ['Strong visual sensibility', 'Good user empathy'],
  gaps: ['Complex systems', 'Documentation'],
  recommendations: [],
};

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

export const SKILL_HISTORY: SkillHistory = {
  learner_id: 2,
  entries: [
    {
      attempt_id: 12,
      skill_id: 13,
      skill_name: 'Product Design',
      level: 'MID',
      score: 81,
      confidence: 0.82,
      strengths: [],
      weaknesses: [],
      recorded_at: '2026-10-20T10:15:00Z',
    },
    {
      attempt_id: 5,
      skill_id: 13,
      skill_name: 'Product Design',
      level: 'JUNIOR',
      score: 64,
      confidence: 0.7,
      strengths: [],
      weaknesses: [],
      recorded_at: '2026-10-01T10:15:00Z',
    },
  ],
};

export const reviewOf = (aiExplanations: 'ready' | 'generating' | 'unavailable' = 'ready') => ({
  attempt_id: 12,
  skill_id: 13,
  status: 'completed' as const,
  result: null,
  ai_explanations: aiExplanations,
  items: [
    {
      position: 1,
      question_id: 1,
      question_text: 'What does HTML stand for?',
      subskill_id: 1,
      subskill_name: 'HTML',
      level: 'BEGINNER' as const,
      options: [
        {
          option_id: 3,
          option_text: 'Hyper Transfer Markup Language',
          is_correct: false,
          chosen: true,
        },
        {
          option_id: 1,
          option_text: 'Hyper Text Markup Language',
          is_correct: true,
          chosen: false,
        },
      ],
      selected_option_id: 3,
      correct_option_id: 1,
      is_correct: false,
      explanation: 'HTML stands for Hyper Text Markup Language.',
      explanation_source: aiExplanations === 'ready' ? ('ai' as const) : ('standard' as const),
    },
    {
      position: 2,
      question_id: 6,
      question_text: 'Which property changes the text colour in CSS?',
      subskill_id: 2,
      subskill_name: 'CSS',
      level: 'BEGINNER' as const,
      options: [
        { option_id: 22, option_text: 'color', is_correct: true, chosen: true },
        { option_id: 21, option_text: 'text-color', is_correct: false, chosen: false },
      ],
      selected_option_id: 22,
      correct_option_id: 22,
      is_correct: true,
      explanation: 'The color property sets the text colour.',
      explanation_source: 'standard' as const,
    },
  ],
});
