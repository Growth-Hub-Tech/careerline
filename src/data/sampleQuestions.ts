import type { QuestionOption } from '../components/QuestionCard';
import type { Step } from '../components/StepList';

export interface AssessmentQuestion {
  readonly id: string;
  readonly sectionId: string;
  readonly text: string;
  readonly options: readonly QuestionOption[];
}

export const SAMPLE_SECTIONS: readonly Step[] = [
  { id: 'personality', title: 'Personality' },
  { id: 'background', title: 'Background' },
  { id: 'experience', title: 'Work Experience' },
  { id: 'interests', title: 'Interests' },
  { id: 'goals', title: 'Goals' },
];

export const SAMPLE_QUESTIONS: readonly AssessmentQuestion[] = [
  {
    id: 'free-hour',
    sectionId: 'personality',
    text: 'How do you prefer to spend a free hour?',
    options: [
      { value: 'hands', label: 'Building or fixing something with my hands' },
      { value: 'learn', label: 'Reading, researching or learning something new' },
      { value: 'people', label: 'Talking with people and hearing their stories' },
      { value: 'organise', label: 'Organizing information so it makes sense to others' },
      { value: 'rest', label: 'Take a nap and rest' },
    ],
  },
  {
    id: 'education',
    sectionId: 'background',
    text: 'What best describes your education so far?',
    options: [
      { value: 'secondary', label: 'Secondary school' },
      { value: 'diploma', label: 'Diploma or certificate' },
      { value: 'bachelors', label: "Bachelor's degree" },
      { value: 'postgraduate', label: 'Postgraduate degree' },
      { value: 'self-taught', label: 'Self-taught' },
    ],
  },
  {
    id: 'work-history',
    sectionId: 'experience',
    text: 'How would you describe your work experience so far?',
    options: [
      { value: 'none', label: 'None yet' },
      { value: 'internship', label: 'Internships or volunteering' },
      { value: '1-3', label: '1 to 3 years' },
      { value: '4-7', label: '4 to 7 years' },
      { value: '7-plus', label: 'More than 7 years' },
    ],
  },
  {
    id: 'curiosity',
    sectionId: 'interests',
    text: 'Which of these would you most enjoy learning about?',
    options: [
      { value: 'users', label: 'How people use products' },
      { value: 'data', label: 'Patterns hidden in data' },
      { value: 'software', label: 'How software gets built' },
      { value: 'business', label: 'How businesses grow' },
      { value: 'security', label: 'How systems are protected' },
    ],
  },
  {
    id: 'career-want',
    sectionId: 'goals',
    text: 'What do you want most from a new career?',
    options: [
      { value: 'stable', label: 'A steady, well-paid job' },
      { value: 'creative', label: 'Creative freedom' },
      { value: 'flexible', label: 'Flexibility to work from anywhere' },
      { value: 'lead', label: 'A chance to lead a team' },
      { value: 'growth', label: 'Growth I can measure each year' },
    ],
  },
];
