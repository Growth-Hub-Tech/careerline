import { render, screen, within } from '@testing-library/react';
import type { ProgrammeSummary } from '../../lib/api';
import { ProgrammeCard } from './ProgrammeCard';

const PROGRAMME: ProgrammeSummary = {
  programme_id: 5,
  name: 'Product Design Foundations',
  provider: 'Incubate',
  provider_type: 'incubate',
  mode: 'online',
  duration_weeks: 12,
  price: { amount: 15000000, currency: 'NGN' },
};

const PARTNER: ProgrammeSummary = {
  ...PROGRAMME,
  programme_id: 7,
  name: 'Partner Bootcamp',
  provider: 'CodeCo',
  provider_type: 'partner',
  mode: 'hybrid',
  duration_weeks: 1,
};

const card = (name: string) => screen.getByRole('region', { name });

describe('ProgrammeCard', () => {
  it('names the programme and shows provider, mode, duration and price', () => {
    render(<ProgrammeCard programme={PROGRAMME} />);

    const region = card('Product Design Foundations');
    expect(within(region).getByRole('heading', { level: 3 })).toHaveTextContent(
      'Product Design Foundations',
    );
    expect(region).toHaveTextContent('Incubate · Online · 12 weeks · ₦150,000');
    expect(within(region).getByText('Recommended programme')).toBeInTheDocument();
  });

  it('uses the heading level it is given', () => {
    render(<ProgrammeCard programme={PROGRAMME} headingLevel={2} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Product Design Foundations',
    );
  });

  it('says one week and Free when that is what the API sends', () => {
    render(<ProgrammeCard programme={{ ...PARTNER, price: { amount: 0, currency: 'NGN' } }} />);

    expect(card('Partner Bootcamp')).toHaveTextContent('CodeCo · Hybrid · 1 week · Free');
  });

  it('always discloses a paid partner programme', () => {
    render(<ProgrammeCard programme={PARTNER} />);

    const region = card('Partner Bootcamp');
    expect(within(region).getByText('Partner programme')).toBeInTheDocument();
    expect(region).toHaveTextContent(
      'This is a partner programme. CareerLine may earn a referral fee if you enrol.',
    );
  });

  it('has no disclosure for an Incubate programme', () => {
    render(<ProgrammeCard programme={PROGRAMME} />);

    expect(card('Product Design Foundations')).not.toHaveTextContent('referral fee');
  });

  it('flags a programme that costs more than the budget', () => {
    render(<ProgrammeCard programme={PROGRAMME} budget="under_50k" />);

    expect(
      within(card('Product Design Foundations')).getByText('Over your budget'),
    ).toBeInTheDocument();
  });

  it('does not flag a programme within the budget or when the budget is unknown', () => {
    const { rerender } = render(<ProgrammeCard programme={PROGRAMME} budget="50k_to_200k" />);
    expect(screen.queryByText('Over your budget')).not.toBeInTheDocument();

    rerender(<ProgrammeCard programme={PROGRAMME} budget={null} />);
    expect(screen.queryByText('Over your budget')).not.toBeInTheDocument();
  });

  it('says when no programme has been matched yet', () => {
    render(<ProgrammeCard programme={null} />);

    const region = card('No programme matched yet');
    expect(region).toHaveTextContent(
      'We will suggest a programme for this path as soon as we find a good match.',
    );
  });

  it('shows what is passed in below the details', () => {
    render(
      <ProgrammeCard programme={PROGRAMME}>
        <a href="/programmes/5">View programme</a>
      </ProgrammeCard>,
    );

    expect(
      within(card('Product Design Foundations')).getByRole('link', { name: 'View programme' }),
    ).toBeInTheDocument();
  });
});
