import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renders its message', () => {
    render(<Alert>Your report is ready.</Alert>);

    expect(screen.getByText('Your report is ready.')).toBeInTheDocument();
  });

  it('defaults to a polite status announcement', () => {
    render(<Alert>Your report is ready.</Alert>);

    expect(screen.getByRole('status')).toHaveTextContent('Your report is ready.');
    expect(screen.getByRole('status')).toHaveAttribute('data-variant', 'info');
  });

  it.each(['info', 'success', 'warning'] as const)('%s uses a status role', (variant) => {
    render(<Alert variant={variant}>Message</Alert>);

    expect(screen.getByRole('status')).toHaveAttribute('data-variant', variant);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('error uses an alert role so it is announced immediately', () => {
    render(<Alert variant="error">Payment failed</Alert>);

    expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'error');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows an optional title before the message', () => {
    render(<Alert title="Heads up">Your session expires soon.</Alert>);

    expect(screen.getByText('Heads up')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Heads upYour session expires soon.');
  });

  it('has no dismiss button unless onDismiss is given', () => {
    render(<Alert>Message</Alert>);

    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  it('calls onDismiss from the dismiss button', async () => {
    const onDismiss = vi.fn();
    render(<Alert onDismiss={onDismiss}>Message</Alert>);

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('hides its decorative icon from assistive tech', () => {
    render(<Alert>Message</Alert>);

    expect(screen.getByRole('status').querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
