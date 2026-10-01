import type { Question, Section } from '../types';

export const sections: Section[] = [
  { id: 'personality', label: 'Personality' },
  { id: 'background', label: 'Background' },
  { id: 'work-experience', label: 'Work Experience' },
  { id: 'interests', label: 'Interests' },
  { id: 'goals', label: 'Goals' },
];

// Placeholder copy except q12 (from the mockup). Replace prompts/options with the real ones.
export const questions: Question[] = [
  {
    id: 'q1',
    section: 'personality',
    prompt: 'How do you usually approach a new problem?',
    options: [
      'Break it into small steps',
      'Ask someone who has done it before',
      'Experiment until something works',
      'Research it thoroughly first',
      'Wait and see how it develops',
    ],
  },
  {
    id: 'q2',
    section: 'personality',
    prompt: 'Which best describes you in a group?',
    options: [
      'I lead and organise',
      'I generate ideas',
      'I get things done quietly',
      'I keep everyone connected',
      'I prefer working alone',
    ],
  },
  {
    id: 'q3',
    section: 'background',
    prompt: 'What is your highest level of education?',
    options: [
      'Secondary school',
      'OND / NCE',
      'HND / Bachelor’s degree',
      'Master’s degree or above',
      'Self-taught',
    ],
  },
  {
    id: 'q4',
    section: 'background',
    prompt: 'How comfortable are you with computers?',
    options: [
      'Just starting out',
      'I use them daily',
      'I can learn new software quickly',
      'I have built things with them',
      'Very advanced',
    ],
  },
  {
    id: 'q5',
    section: 'background',
    prompt: 'How many hours a week can you commit to learning?',
    options: [
      'Under 5 hours',
      '5 – 10 hours',
      '10 – 15 hours',
      '15 – 25 hours',
      'More than 25 hours',
    ],
  },
  {
    id: 'q6',
    section: 'work-experience',
    prompt: 'What is your current work situation?',
    options: ['Student', 'Unemployed', 'Employed full-time', 'Employed part-time', 'Self-employed'],
  },
  {
    id: 'q7',
    section: 'work-experience',
    prompt: 'Which kind of task have you enjoyed most at work or school?',
    options: [
      'Solving technical problems',
      'Working with data or numbers',
      'Designing or creating things',
      'Helping or teaching people',
      'Planning and coordinating',
    ],
  },
  {
    id: 'q8',
    section: 'interests',
    prompt: 'Which topic could you read about for hours?',
    options: [
      'Technology and gadgets',
      'Business and money',
      'Art and design',
      'People and society',
      'Science and research',
    ],
  },
  {
    id: 'q9',
    section: 'interests',
    prompt: 'What kind of content do you watch most?',
    options: [
      'Tutorials and how-tos',
      'Documentaries',
      'Design and creative work',
      'Interviews and stories',
      'Entertainment only',
    ],
  },
  {
    id: 'q10',
    section: 'interests',
    prompt: 'Which activity sounds most appealing?',
    options: [
      'Building an app',
      'Analysing a spreadsheet',
      'Designing a poster',
      'Running a workshop',
      'Managing a project',
    ],
  },
  {
    id: 'q11',
    section: 'goals',
    prompt: 'What do you want most from a new career?',
    options: [
      'High income',
      'Flexibility and remote work',
      'Creative freedom',
      'Job stability',
      'Making an impact',
    ],
  },
  {
    id: 'q12',
    section: 'goals',
    prompt: 'How do you prefer to spend a free hour?',
    options: [
      'Building or fixing something with my hands',
      'Reading, researching or learning something new',
      'Talking with people and hearing their stories',
      'Organizing information so it makes sense to others',
      'Take a nap and rest',
    ],
  },
];
