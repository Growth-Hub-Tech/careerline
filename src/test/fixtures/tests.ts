import type { AssessmentAccess, AssessmentDetail, AssessmentPage, SkillsPage } from '../../lib/api';

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
