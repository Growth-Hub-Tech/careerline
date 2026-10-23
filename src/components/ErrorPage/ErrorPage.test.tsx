import { render, screen } from '@testing-library/react';
import { ErrorPage } from './ErrorPage';

describe('ErrorPage', () => {
  it('shows the title as the main heading', () => {
    render(<ErrorPage code="404" title="Page not found" description="We could not find that." />);

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  });

  it('shows the description', () => {
    render(<ErrorPage code="404" title="Page not found" description="We could not find that." />);

    expect(screen.getByText('We could not find that.')).toBeInTheDocument();
  });

  it('shows the code as decoration only', () => {
    render(<ErrorPage code="404" title="Page not found" description="We could not find that." />);

    expect(screen.getByTestId('error-code')).toHaveTextContent('404');
    expect(screen.getByTestId('error-code')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders its actions', () => {
    render(
      <ErrorPage code="404" title="Page not found" description="We could not find that.">
        <button type="button">Go back</button>
      </ErrorPage>,
    );

    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
  });

  it('fills the viewport only when fullScreen is set', () => {
    const { container, rerender } = render(
      <ErrorPage code="500" title="Oops" description="Something broke." />,
    );
    expect(container.firstElementChild).not.toHaveClass('min-h-dvh');

    rerender(<ErrorPage code="500" title="Oops" description="Something broke." fullScreen />);
    expect(container.firstElementChild).toHaveClass('min-h-dvh');
  });
});
