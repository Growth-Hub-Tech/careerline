import type {
  AssessmentAccess,
  AssessmentDetail,
  AssessmentPage,
  Attempt,
  AttemptSubmissionReply,
  SkillsPage,
  StartedAttempt,
} from '../../lib/api';

export const SKILLS: SkillsPage = {
  total: 5,
  limit: 50,
  offset: 0,
  skills: [
    {
      skill_id: 1,
      skill_name: 'Frontend Web Development',
      category: 'Engineering and Development',
      description: 'Tests expertise in: HTML, CSS, JavaScript, React',
    },
    {
      skill_id: 2,
      skill_name: 'Backend Development',
      category: 'Engineering and Development',
      description: 'Tests expertise in: REST APIs, Node.js, authentication',
    },
    {
      skill_id: 8,
      skill_name: 'Version Control (Git)',
      category: 'Engineering and Development',
      description: 'Tests expertise in: Branching, merging, pull requests',
    },
    {
      skill_id: 13,
      skill_name: 'UI/UX Design',
      category: 'Design & Product',
      description: 'Tests expertise in: Figma, wireframing, prototyping',
    },
    {
      skill_id: 20,
      skill_name: 'Data Analysis',
      category: 'Data',
      description: 'Tests expertise in: SQL, spreadsheets, charts',
    },
  ],
};

export const TESTS: AssessmentPage = {
  total: 3,
  limit: 20,
  offset: 0,
  items: [
    {
      test_id: 201,
      title: 'Frontend Web Development',
      skill_id: 1,
      skill_name: 'Frontend Web Development',
      levels: ['BEGINNER', 'JUNIOR', 'MID', 'ADVANCED'],
      format: 'adaptive',
      question_count: 25,
      duration_minutes: 30,
      price_credits: 0,
      role_ids: [101],
    },
    {
      test_id: 202,
      title: 'Backend Development',
      skill_id: 2,
      skill_name: 'Backend Development',
      levels: ['BEGINNER', 'JUNIOR', 'MID', 'ADVANCED'],
      format: 'adaptive',
      question_count: 25,
      duration_minutes: 30,
      price_credits: 2,
      role_ids: [102],
    },
    {
      test_id: 208,
      title: 'Version Control (Git)',
      skill_id: 8,
      skill_name: 'Version Control (Git)',
      levels: ['BEGINNER', 'JUNIOR', 'MID'],
      format: 'fixed',
      question_count: 15,
      duration_minutes: 15,
      price_credits: 1,
      role_ids: [101, 102],
    },
  ],
};

export const TEST_DETAIL: AssessmentDetail = {
  test_id: 202,
  title: 'Backend Development',
  skill_id: 2,
  skill_name: 'Backend Development',
  levels: ['BEGINNER', 'JUNIOR', 'MID', 'ADVANCED'],
  format: 'adaptive',
  question_count: 25,
  duration_minutes: 30,
  price_credits: 2,
  role_ids: [102],
  description: 'Shows how well you design, build and secure server-side applications.',
  subskills: ['REST APIs', 'Databases', 'Authentication'],
  what_you_get: ['Your level from Beginner to Advanced', 'A score for each sub-skill'],
};

export const ACCESS_WITH_CREDITS: AssessmentAccess = {
  test_id: 202,
  can_start: true,
  reason: 'credits',
  price_credits: 2,
  credits_balance: 3,
};

export const ACCESS_SHORT_OF_CREDITS: AssessmentAccess = {
  test_id: 202,
  can_start: false,
  reason: 'insufficient_credits',
  price_credits: 2,
  credits_balance: 1,
};

export const STARTED_ATTEMPT: StartedAttempt = {
  attempt_id: 12,
  declared_level: 'BEGINNER',
  total_questions: 3,
  questions: [
    {
      question_id: 1,
      question_text: 'What does HTML stand for?',
      difficulty_level: 'BEGINNER',
      subskill_id: 1,
      options: [
        { option_id: 3, option_text: 'Hyper Transfer Markup Language' },
        { option_id: 1, option_text: 'Hyper Text Markup Language' },
      ],
    },
    {
      question_id: 6,
      question_text: 'Which property is used to change the text color in CSS?',
      difficulty_level: 'BEGINNER',
      subskill_id: 2,
      options: [
        { option_id: 21, option_text: 'text-color' },
        { option_id: 22, option_text: 'color' },
      ],
    },
    {
      question_id: 10,
      question_text: 'What will console.log(typeof 42) output?',
      difficulty_level: 'BEGINNER',
      subskill_id: 3,
      options: [
        { option_id: 37, option_text: 'string' },
        { option_id: 40, option_text: 'number' },
      ],
    },
  ],
};

export const ATTEMPT_IN_PROGRESS: Attempt = {
  attempt_id: 12,
  learner_id: 2,
  skill_id: 2,
  attempt_status: 'in_progress',
  overall_percentage: null,
  start_time: '2026-10-29T11:20:49.017475',
  end_time: null,
};

export const SUBMITTED_ATTEMPT: AttemptSubmissionReply = {
  result: {
    score: 2,
    total_possible: 3,
    percentage: 67,
    declared_level: 'BEGINNER',
    status: 'passed',
    confirmed_level: 'BEGINNER',
  },
};
