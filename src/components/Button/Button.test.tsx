import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('calls onClick when pressed', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and marked busy while loading', () => {
    render(<Button isLoading>Save</Button>);

    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('has an accent variant in the brand amber', () => {
    render(<Button variant="accent">Go</Button>);

    expect(screen.getByRole('button', { name: 'Go' })).toHaveClass('bg-amber-500');
  });

  it('has a deep variant in the darker brand indigo', () => {
    render(<Button variant="deep">Go</Button>);

    expect(screen.getByRole('button', { name: 'Go' })).toHaveClass('bg-indigo-800');
  });
});
