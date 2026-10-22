import { render, screen } from '@testing-library/react';
import { PageLoader, Spinner } from './Loader';

describe('Spinner', () => {
  it('announces itself as a status with a default label', () => {
    render(<Spinner />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading');
  });

  it('uses a custom label', () => {
    render(<Spinner label="Saving your answers" />);

    expect(screen.getByRole('status')).toHaveTextContent('Saving your answers');
  });

  it('keeps the label for screen readers only', () => {
    render(<Spinner label="Saving" />);

    expect(screen.getByText('Saving')).toHaveClass('sr-only');
  });

  it('hides the spinning ring from assistive tech', () => {
    render(<Spinner />);

    expect(screen.getByTestId('spinner-ring')).toHaveAttribute('aria-hidden', 'true');
  });

  it('defaults to the medium size', () => {
    render(<Spinner />);

    expect(screen.getByRole('status')).toHaveAttribute('data-size', 'md');
  });

  it.each(['sm', 'md', 'lg'] as const)('supports the %s size', (size) => {
    render(<Spinner size={size} />);

    expect(screen.getByRole('status')).toHaveAttribute('data-size', size);
  });

  it('accepts extra classes', () => {
    render(<Spinner className="text-white" />);

    expect(screen.getByRole('status')).toHaveClass('text-white');
  });
});

describe('PageLoader', () => {
  it('announces its title as a status', () => {
    render(<PageLoader title="Matching your answers to real career paths." />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Matching your answers to real career paths.',
    );
  });

  it('renders a description under the title', () => {
    render(
      <PageLoader title="Matching your answers" description="This usually takes a few seconds." />,
    );

    expect(screen.getByText('This usually takes a few seconds.')).toBeInTheDocument();
  });

  it('renders no description when none is given', () => {
    render(<PageLoader title="Matching your answers" />);

    expect(screen.getByRole('status').querySelectorAll('p')).toHaveLength(1);
  });

  it('is a single status, not nested ones', () => {
    render(<PageLoader title="Matching your answers" />);

    expect(screen.getAllByRole('status')).toHaveLength(1);
  });

  it('hides the spinning ring from assistive tech', () => {
    render(<PageLoader title="Matching your answers" />);

    expect(screen.getByTestId('spinner-ring')).toHaveAttribute('aria-hidden', 'true');
  });

  it('fills the viewport only when fullScreen is set', () => {
    const { rerender } = render(<PageLoader title="Loading" />);
    expect(screen.getByRole('status')).not.toHaveClass('min-h-dvh');

    rerender(<PageLoader title="Loading" fullScreen />);
    expect(screen.getByRole('status')).toHaveClass('min-h-dvh');
  });
});
