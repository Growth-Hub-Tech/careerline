import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from './ErrorBoundary';

let shouldThrow = true;

const Bomb = () => {
  if (shouldThrow) throw new Error('secret internal detail');
  return <p>All good</p>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    shouldThrow = true;
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders its children when nothing throws', () => {
    shouldThrow = false;
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('shows the error screen when a child throws', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Something went wrong' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('All good')).not.toBeInTheDocument();
  });

  it('never shows the raw error message to the person', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.queryByText(/secret internal detail/)).not.toBeInTheDocument();
  });

  it('tries again when Try again is pressed', async () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );
    shouldThrow = false;

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('shows the error screen again if it still throws on retry', async () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(
      screen.getByRole('heading', { level: 1, name: 'Something went wrong' }),
    ).toBeInTheDocument();
  });

  it('recovers when the reset key changes', () => {
    const { rerender } = render(
      <ErrorBoundary resetKey="/dashboard">
        <Bomb />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    shouldThrow = false;

    rerender(
      <ErrorBoundary resetKey="/pricing">
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('stays on the error screen when the reset key is unchanged', () => {
    const { rerender } = render(
      <ErrorBoundary resetKey="/dashboard">
        <Bomb />
      </ErrorBoundary>,
    );
    shouldThrow = false;

    rerender(
      <ErrorBoundary resetKey="/dashboard">
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
  });
});
