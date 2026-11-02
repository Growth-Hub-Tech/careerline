export interface PlaceholderRoute {
  readonly path: string;
  readonly title: string;
  readonly description: string;
}

export const PUBLIC_PLACEHOLDERS: readonly PlaceholderRoute[] = [
  {
    path: '/how-it-works',
    title: 'How it works',
    description: 'See how one test engine guides careers, audits teams and validates talent.',
  },
  {
    path: '/pricing',
    title: 'Pricing',
    description: 'Plans for individuals, recruiters and organizations.',
  },
  {
    path: '/for-individuals',
    title: 'For individuals',
    description: 'Discover a career path or test your own skills and download a shareable report.',
  },
  {
    path: '/for-organizations',
    title: 'For organizations',
    description: 'Audit your team against the Global Standard for their roles and titles.',
  },
  {
    path: '/for-recruiters',
    title: 'For recruiters',
    description: "Verify a candidate's real skill level before you make an offer.",
  },
  {
    path: '/help',
    title: 'Help Center',
    description: 'Answers to common questions about tests, reports and accounts.',
  },
  {
    path: '/privacy',
    title: 'Privacy policy',
    description: 'How CareerLine AI collects, uses and protects your data.',
  },
  {
    path: '/terms',
    title: 'Terms of service',
    description: 'The terms that apply when you use CareerLine AI.',
  },
];

export const APP_PLACEHOLDERS: readonly PlaceholderRoute[] = [
  {
    path: '/candidates',
    title: 'Candidates',
    description: 'Candidates you have assigned a role-specific test to.',
  },
  {
    path: '/candidates/:candidateId',
    title: 'Candidate report',
    description: 'A scored report with a clear recommendation before you make an offer.',
  },
  {
    path: '/team',
    title: 'Team',
    description: 'Your team roster, mapped to roles and titles.',
  },
  {
    path: '/team/import',
    title: 'Import team roster',
    description: 'Upload your staff list so tests can be assigned by role.',
  },
  {
    path: '/team/heatmap',
    title: 'Capability heatmap',
    description: 'How your whole team measures up, skill by skill.',
  },
  {
    path: '/tasks',
    title: 'Tasks',
    description: 'Tests and recommendations waiting on you.',
  },
  {
    path: '/users',
    title: 'Users',
    description: 'People who can access this account.',
  },
  {
    path: '/support',
    title: 'Support',
    description: 'Get help from the CareerLine AI team.',
  },
  {
    path: '/settings',
    title: 'Settings',
    description: 'Your profile, password and notification preferences.',
  },
];
