import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorScreen } from './ErrorScreen';

describe('ErrorScreen', () => {
  it('says something went wrong', () => {
    render(<ErrorScreen />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Something went wrong' }),
    ).toBeInTheDocument();
  });

  it('links to the homepage with a full page load', () => {
    render(<ErrorScreen />);

    expect(screen.getByRole('link', { name: 'Go to homepage' })).toHaveAttribute('href', '/');
  });

  it('offers Try again only when a retry handler is given', async () => {
    const onRetry = vi.fn();
    const { rerender } = render(<ErrorScreen />);
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();

    rerender(<ErrorScreen onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('fills the viewport', () => {
    const { container } = render(<ErrorScreen />);

    expect(container.firstElementChild).toHaveClass('min-h-dvh');
  });
});
