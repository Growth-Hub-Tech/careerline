import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('is a progressbar named by its label', () => {
    render(<ProgressBar label="Product Design" value={40} />);

    expect(screen.getByRole('progressbar', { name: 'Product Design' })).toBeInTheDocument();
  });

  it('exposes its value, minimum and maximum', () => {
    render(<ProgressBar label="Product Design" value={40} />);

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('measures against a custom maximum', () => {
    render(<ProgressBar label="Question progress" value={3} max={12} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '12');
    expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '25%' });
  });

  it('fills to the matching width', () => {
    render(<ProgressBar label="Product Design" value={85} />);

    expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '85%' });
  });

  it('clamps a value below zero', () => {
    render(<ProgressBar label="Progress" value={-10} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '0%' });
  });

  it('clamps a value above the maximum', () => {
    render(<ProgressBar label="Progress" value={140} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '100%' });
  });

  it('shows the label text by default', () => {
    render(<ProgressBar label="Product Design" value={40} />);

    expect(screen.getByText('Product Design')).not.toHaveClass('sr-only');
  });

  it('keeps the label for screen readers only when hidden', () => {
    render(<ProgressBar label="Product Design" value={40} hideLabel />);

    expect(screen.getByText('Product Design')).toHaveClass('sr-only');
    expect(screen.getByRole('progressbar', { name: 'Product Design' })).toBeInTheDocument();
  });

  it('shows a rounded percentage when asked', () => {
    render(<ProgressBar label="Progress" value={1} max={3} showValue />);

    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('shows no percentage by default', () => {
    render(<ProgressBar label="Progress" value={40} />);

    expect(screen.queryByText('40%')).not.toBeInTheDocument();
  });

  it('hides the visible percentage from assistive tech', () => {
    render(<ProgressBar label="Progress" value={40} showValue />);

    expect(screen.getByText('40%')).toHaveAttribute('aria-hidden', 'true');
  });

  it('describes progress in words when valueText is given', () => {
    render(<ProgressBar label="Assessment" value={4} max={12} valueText="Question 4 of 12" />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', 'Question 4 of 12');
  });

  it('defaults to the indigo variant', () => {
    render(<ProgressBar label="Progress" value={40} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('data-variant', 'indigo');
  });

  it.each(['indigo', 'amber', 'teal'] as const)('supports the %s variant', (variant) => {
    render(<ProgressBar label="Progress" value={40} variant={variant} />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('data-variant', variant);
  });

  it('accepts extra classes on its wrapper', () => {
    const { container } = render(<ProgressBar label="Progress" value={40} className="mt-4" />);

    expect(container.firstElementChild).toHaveClass('mt-4');
  });
});
