import { render, screen } from '@testing-library/react';
import { StepList } from './StepList';

const STEPS = [
  { id: 'personality', title: 'Personality' },
  { id: 'goals', title: 'Goals' },
  { id: 'time', title: 'Time' },
];

const itemFor = (title: string) => screen.getByText(title).closest('li') as HTMLElement;

describe('StepList', () => {
  it('is a navigation landmark with an ordered list of steps', () => {
    render(<StepList steps={STEPS} currentId="goals" />);

    expect(screen.getByRole('navigation', { name: 'Assessment steps' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('marks only the current step with aria-current', () => {
    render(<StepList steps={STEPS} currentId="goals" />);

    expect(itemFor('Goals')).toHaveAttribute('aria-current', 'step');
    expect(itemFor('Personality')).not.toHaveAttribute('aria-current');
    expect(itemFor('Time')).not.toHaveAttribute('aria-current');
  });

  it('shows earlier steps as complete and later steps as upcoming', () => {
    render(<StepList steps={STEPS} currentId="goals" />);

    expect(itemFor('Personality')).toHaveAttribute('data-status', 'complete');
    expect(itemFor('Goals')).toHaveAttribute('data-status', 'current');
    expect(itemFor('Time')).toHaveAttribute('data-status', 'upcoming');
  });

  it('treats every step as upcoming but the first as current at the start', () => {
    render(<StepList steps={STEPS} currentId="personality" />);

    expect(itemFor('Personality')).toHaveAttribute('data-status', 'current');
    expect(itemFor('Goals')).toHaveAttribute('data-status', 'upcoming');
  });

  it('tells screen readers which steps are completed', () => {
    render(<StepList steps={STEPS} currentId="goals" />);

    expect(screen.getAllByText('completed')).toHaveLength(1);
    expect(screen.getByText('completed')).toHaveClass('sr-only');
  });

  it('hides the step markers from assistive tech', () => {
    render(<StepList steps={STEPS} currentId="goals" />);

    expect(itemFor('Goals').querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
