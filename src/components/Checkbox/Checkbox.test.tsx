import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('links the label to the checkbox', () => {
    render(<Checkbox label="Remember me" />);

    expect(screen.getByRole('checkbox', { name: 'Remember me' })).toBeInTheDocument();
  });

  it('toggles and reports the change', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Remember me" onChange={onChange} />);

    const checkbox = screen.getByRole('checkbox', { name: 'Remember me' });
    await userEvent.click(checkbox);

    expect(checkbox).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('toggles when the label text is clicked', async () => {
    render(<Checkbox label="Remember me" />);

    await userEvent.click(screen.getByText('Remember me'));

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('respects a controlled checked value', () => {
    render(<Checkbox label="Remember me" checked onChange={() => undefined} />);

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('accepts rich label content', () => {
    render(
      <Checkbox
        label={
          <>
            I agree to the <a href="/privacy">privacy policy</a>
          </>
        }
      />,
    );

    expect(screen.getByRole('link', { name: 'privacy policy' })).toBeInTheDocument();
  });

  it('describes the checkbox with its hint', () => {
    render(<Checkbox label="Remember me" hint="Keeps you signed in for 30 days" />);

    expect(screen.getByRole('checkbox')).toHaveAccessibleDescription(
      'Keeps you signed in for 30 days',
    );
  });

  it('marks the checkbox invalid and announces the error instead of the hint', () => {
    render(<Checkbox label="Terms" hint="Required" error="You must agree to continue" />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInvalid();
    expect(checkbox).toHaveAccessibleDescription('You must agree to continue');
    expect(screen.getByRole('alert')).toHaveTextContent('You must agree to continue');
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<Checkbox label="Remember me" disabled />);

    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});
