export type AudienceKey = 'individuals' | 'organizations' | 'recruiters';

interface Audience {
  readonly key: AudienceKey;
  readonly path: string;
  readonly title: string;
  readonly intro: string;
  readonly benefits: readonly string[];
  readonly steps: readonly string[];
  readonly action: { readonly label: string; readonly to: string };
  readonly secondary?: { readonly label: string; readonly to: string };
}

export const AUDIENCES: readonly Audience[] = [
  {
    key: 'individuals',
    path: '/for-individuals',
    title: 'For individuals',
    intro:
      'New to tech? Find the career path that fits who you are. Already working? Test your skills and walk away with a report you can share.',
    benefits: [
      'A career path matched to your personality, goals, time and budget, with the reasons',
      'Adaptive skill tests that find your real level in about 30 minutes',
      'A downloadable report with your score, strengths and what to work on',
      'A matched Incubate or partner programme for every gap we find',
    ],
    steps: [
      'Create a free account and choose beginner or professional.',
      'Answer the questionnaire, or pick a skill test.',
      'Read your career paths or your skill report.',
      'Follow the programme we suggest, then retake the test to see your progress.',
    ],
    action: { label: 'Get started', to: '/sign-up' },
    secondary: { label: 'See prices', to: '/pricing' },
  },
  {
    key: 'organizations',
    path: '/for-organizations',
    title: 'For organizations',
    intro:
      'Know, with evidence, whether your staff have the skills their roles and titles need, and what to do about the gaps.',
    benefits: [
      'Test a whole team against the skills each role actually needs',
      'Compare everyone with the role standard and your own company targets',
      'A team heatmap you can filter and download',
      'Re-test after training to measure the change',
    ],
    steps: [
      'Upload your staff list with each person’s role.',
      'Start an audit. Everyone gets an email with their test.',
      'Follow progress as people finish.',
      'Read the heatmap and each employee report, then set targets.',
    ],
    action: { label: 'Get started', to: '/sign-up' },
    secondary: { label: 'Request a quote', to: '/quote' },
  },
  {
    key: 'recruiters',
    path: '/for-recruiters',
    title: 'For recruiters',
    intro: 'Check a candidate’s real skill level before you make an offer.',
    benefits: [
      'Send a role-specific test to a candidate in a minute',
      'Follow every test you sent, and cancel one if plans change',
      'A scored report with strengths, weaknesses and a written summary',
      'Pay per candidate with credits, or choose a monthly plan',
    ],
    steps: [
      'Add a candidate and choose the test for the role.',
      'The candidate agrees to share the result and takes the test.',
      'Read their report and download the PDF.',
      'Use it alongside interviews and work samples to decide.',
    ],
    action: { label: 'Get started', to: '/sign-up' },
    secondary: { label: 'See prices', to: '/pricing' },
  },
];
