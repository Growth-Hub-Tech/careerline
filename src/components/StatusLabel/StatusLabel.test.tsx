import { render, screen } from '@testing-library/react';
import { StatusLabel } from './StatusLabel';

describe('StatusLabel', () => {
  it('renders its text', () => {
    render(<StatusLabel>Completed</StatusLabel>);

    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('defaults to the neutral status', () => {
    render(<StatusLabel>Draft</StatusLabel>);

    expect(screen.getByText('Draft')).toHaveAttribute('data-status', 'neutral');
  });

  it.each(['neutral', 'info', 'success', 'warning', 'error'] as const)(
    'supports the %s status',
    (status) => {
      render(<StatusLabel status={status}>Label</StatusLabel>);

      expect(screen.getByText('Label')).toHaveAttribute('data-status', status);
    },
  );

  it('shows a decorative dot by default', () => {
    render(<StatusLabel status="success">Completed</StatusLabel>);

    expect(screen.getByTestId('status-dot')).toHaveAttribute('aria-hidden', 'true');
  });

  it('hides the dot when asked', () => {
    render(
      <StatusLabel status="success" dot={false}>
        Completed
      </StatusLabel>,
    );

    expect(screen.queryByTestId('status-dot')).not.toBeInTheDocument();
  });

  it('keeps the status readable from the text alone, not the colour', () => {
    render(<StatusLabel status="error">Failed</StatusLabel>);

    expect(screen.getByText('Failed')).toHaveTextContent('Failed');
  });

  it('accepts extra classes', () => {
    render(<StatusLabel className="ml-2">Pending</StatusLabel>);

    expect(screen.getByText('Pending')).toHaveClass('ml-2');
  });
});
