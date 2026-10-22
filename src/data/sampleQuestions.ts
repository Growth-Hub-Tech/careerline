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
  { id: 'goals', title: 'Goals' },
  { id: 'time', title: 'Time' },
  { id: 'budget', title: 'Budget' },
  { id: 'experience', title: 'Experience' },
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
  {
    id: 'weekly-hours',
    sectionId: 'time',
    text: 'How many hours a week can you commit to learning?',
    options: [
      { value: 'under-3', label: 'Under 3 hours' },
      { value: '3-5', label: '3 to 5 hours' },
      { value: '6-10', label: '6 to 10 hours' },
      { value: '11-20', label: '11 to 20 hours' },
      { value: 'over-20', label: 'More than 20 hours' },
    ],
  },
  {
    id: 'training-budget',
    sectionId: 'budget',
    text: 'How much can you invest in training before you start earning?',
    options: [
      { value: 'free', label: 'Free options only' },
      { value: 'small', label: 'A small amount' },
      { value: 'moderate', label: 'A moderate amount' },
      { value: 'significant', label: 'A significant amount' },
      { value: 'unsure', label: 'Not sure yet' },
    ],
  },
  {
    id: 'current-skills',
    sectionId: 'experience',
    text: 'How would you describe your current tech skills?',
    options: [
      { value: 'none', label: 'None yet' },
      { value: 'explored', label: "I've explored a little" },
      { value: 'course', label: "I've completed a course" },
      { value: 'projects', label: "I've built small projects" },
      { value: 'working', label: 'I already work in tech' },
    ],
  },
];
