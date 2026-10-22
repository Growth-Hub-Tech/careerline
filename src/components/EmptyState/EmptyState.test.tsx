import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title as a level 3 heading by default', () => {
    render(<EmptyState title="No tests yet" />);

    expect(screen.getByRole('heading', { level: 3, name: 'No tests yet' })).toBeInTheDocument();
  });

  it('lets the heading level be chosen', () => {
    render(<EmptyState title="No tests yet" headingLevel={2} />);

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
  });

  it('renders a description', () => {
    render(<EmptyState title="No tests yet" description="Take your first test to see results." />);

    expect(screen.getByText('Take your first test to see results.')).toBeInTheDocument();
  });

  it('renders no description when none is given', () => {
    render(<EmptyState title="No tests yet" />);

    expect(screen.getAllByText(/./)).toHaveLength(1);
  });

  it('shows a decorative icon', () => {
    render(<EmptyState title="No tests yet" icon={<svg data-testid="icon" />} />);

    expect(screen.getByTestId('empty-state-icon')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders an action', () => {
    render(<EmptyState title="No tests yet" action={<button type="button">Take a test</button>} />);

    expect(screen.getByRole('button', { name: 'Take a test' })).toBeInTheDocument();
  });

  it('accepts extra classes', () => {
    render(<EmptyState title="No tests yet" className="mt-8" />);

    expect(screen.getByTestId('empty-state')).toHaveClass('mt-8');
  });
});
