export interface CareerMatch {
  readonly id: string;
  readonly title: string;
  readonly score: number;
  readonly reason: string;
  readonly programmeId: string;
}

export const SAMPLE_MATCHES: readonly CareerMatch[] = [
  {
    id: 'product-design',
    title: 'Product Design',
    score: 92,
    reason:
      'You described yourself as someone who enjoys organizing information so it makes sense to others, and product design rewards exactly that instinct.',
    programmeId: 'product-design',
  },
  {
    id: 'data-analysis',
    title: 'Data Analysis',
    score: 84,
    reason:
      'Your interest in finding patterns and your comfort with structured thinking point toward a strong fit with data analysis roles.',
    programmeId: 'data-analysis',
  },
  {
    id: 'software-engineering',
    title: 'Software Engineering',
    score: 77,
    reason:
      'You show a genuine interest in building things, though your available time each week is on the lower end for a fast-paced engineering track.',
    programmeId: 'software-engineering',
  },
];
