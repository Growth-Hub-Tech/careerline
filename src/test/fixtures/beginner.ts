import type { BeginnerPath, IntakeQuestionnaire, Profile, Programme } from '../../lib/api';

export const QUESTIONNAIRE: IntakeQuestionnaire = {
  version: '2026-10',
  questions: [
    {
      question_id: 'free_hour',
      section: 'personality',
      text: 'How do you prefer to spend a free hour?',
      kind: 'single_choice',
      options: [
        { value: 'hands', label: 'Building or fixing something with my hands' },
        { value: 'learn', label: 'Reading, researching or learning something new' },
      ],
    },
    {
      question_id: 'traits',
      section: 'personality',
      text: 'Which of these describe you?',
      kind: 'multi_choice',
      options: [
        { value: 'curious', label: 'Curious' },
        { value: 'organised', label: 'Organised' },
        { value: 'creative', label: 'Creative' },
      ],
    },
    {
      question_id: 'hours',
      section: 'time',
      text: 'How many hours a week can you study?',
      kind: 'scale',
      options: [
        { value: '5', label: 'About 5 hours' },
        { value: '10', label: 'About 10 hours' },
      ],
    },
    {
      question_id: 'budget',
      section: 'finances',
      text: 'What can you spend on learning?',
      kind: 'single_choice',
      options: [
        { value: 'free', label: 'Free only' },
        { value: 'paid', label: 'I can pay for a good course' },
      ],
    },
  ],
};

export const PROGRAMME: Programme = {
  programme_id: 5,
  name: 'Incubate: Product Design Foundations',
  provider: 'Incubate',
  provider_type: 'incubate',
  mode: 'online',
  duration_weeks: 12,
  price: { amount: 15000000, currency: 'NGN' },
  summary: 'This twelve week programme covers user research, wireframing, and portfolio building.',
  skills: ['User research', 'Wireframing'],
  role_ids: [11],
  url: 'https://incubate.example/product-design',
};

export const PATH: BeginnerPath = {
  intake_id: 1,
  submitted_at: '2026-10-26T08:00:00Z',
  recommendations: [
    {
      rank: 1,
      role_id: 11,
      title: 'Product Design',
      match_score: 92,
      reasons: ['You enjoy organizing information so it makes sense to others.'],
      starting_test_id: 301,
      programme: {
        programme_id: 5,
        name: PROGRAMME.name,
        provider: 'Incubate',
        provider_type: 'incubate',
        mode: 'online',
        duration_weeks: 12,
        price: { amount: 15000000, currency: 'NGN' },
      },
    },
    {
      rank: 2,
      role_id: 12,
      title: 'Data Analysis',
      match_score: 84,
      reasons: ['You like finding patterns.'],
      starting_test_id: 302,
      programme: null,
    },
    {
      rank: 3,
      role_id: 13,
      title: 'Software Engineering',
      match_score: 77,
      reasons: ['You like building things.'],
      starting_test_id: 303,
      programme: {
        programme_id: 7,
        name: 'Partner Bootcamp',
        provider: 'CodeCo',
        provider_type: 'partner',
        mode: 'hybrid',
        duration_weeks: 1,
        price: { amount: 0, currency: 'NGN' },
      },
    },
  ],
};

export const PROFILE: Profile = {
  learner_id: 7,
  full_name: 'Skye Favour',
  headline: null,
  location: 'Lagos',
  current_role: null,
  years_experience: null,
  goals: [],
  weekly_hours: 10,
  budget: 'under_50k',
  linkedin_url: null,
  visibility: 'private',
  completeness: 40,
  updated_at: '2026-10-26T08:00:00Z',
};
