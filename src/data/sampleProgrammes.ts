export interface Programme {
  readonly id: string;
  readonly careerTitle: string;
  readonly tagline: string;
  readonly programmeTitle: string;
  readonly description: string;
  readonly reasons: readonly string[];
}

export const SAMPLE_PROGRAMMES: readonly Programme[] = [
  {
    id: 'product-design',
    careerTitle: 'Product Design',
    tagline:
      'Your top recommended path, based on a ninety two percent match with your assessment answers.',
    programmeTitle: 'Incubate: Product Design Foundations',
    description:
      'This twelve week programme covers user research, wireframing, and portfolio building, and it is taught by designers currently working at growing companies.',
    reasons: [
      'Matches your stated available time of ten hours a week.',
      'Fits within the financial capacity you described.',
      'Leads directly to roles that use the strengths you showed.',
    ],
  },
];
