import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextField } from './TextField';

describe('TextField', () => {
  it('links the label to the input', () => {
    render(<TextField label="Email" />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('uses the id it is given', () => {
    render(<TextField label="Email" id="email-field" />);

    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'email-field');
  });

  it('passes typing through to onChange', async () => {
    const onChange = vi.fn();
    render(<TextField label="Name" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Name'), 'Ada');

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(screen.getByLabelText('Name')).toHaveValue('Ada');
  });

  it('describes the input with its hint', () => {
    render(<TextField label="Email" hint="We never share it" />);

    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('We never share it');
  });

  it('is valid when there is no error', () => {
    render(<TextField label="Email" />);

    expect(screen.getByLabelText('Email')).toBeValid();
  });

  it('marks the input invalid and announces the error', () => {
    render(<TextField label="Email" error="Email is required" />);

    const input = screen.getByLabelText('Email');
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription('Email is required');
    expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
  });

  it('shows the error instead of the hint', () => {
    render(<TextField label="Email" hint="We never share it" error="Email is required" />);

    expect(screen.queryByText('We never share it')).not.toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('supports read-only and disabled', () => {
    const { rerender } = render(<TextField label="Email" readOnly />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('readonly');

    rerender(<TextField label="Email" disabled />);
    expect(screen.getByLabelText('Email')).toBeDisabled();
  });

  describe('password fields', () => {
    it('hide the password until the eye button is pressed', async () => {
      render(<TextField label="Password" type="password" />);
      const input = screen.getByLabelText('Password');
      expect(input).toHaveAttribute('type', 'password');

      await userEvent.click(screen.getByRole('button', { name: 'Show password' }));

      expect(input).toHaveAttribute('type', 'text');
    });

    it('hide the password again on a second press', async () => {
      render(<TextField label="Password" type="password" />);
      const input = screen.getByLabelText('Password');

      await userEvent.click(screen.getByRole('button', { name: 'Show password' }));
      await userEvent.click(screen.getByRole('button', { name: 'Hide password' }));

      expect(input).toHaveAttribute('type', 'password');
    });

    it('tell assistive tech whether the password is showing', async () => {
      render(<TextField label="Password" type="password" />);
      const button = screen.getByRole('button', { name: 'Show password' });
      expect(button).toHaveAttribute('aria-pressed', 'false');

      await userEvent.click(button);

      expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });

    it('name the button after the field, so two fields stay apart', () => {
      render(
        <>
          <TextField label="Password" type="password" />
          <TextField label="Confirm Password" type="password" />
        </>,
      );

      expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Show confirm password' })).toBeInTheDocument();
    });

    it('keep what was typed when switching', async () => {
      render(<TextField label="Password" type="password" />);
      await userEvent.type(screen.getByLabelText('Password'), 'secret123');

      await userEvent.click(screen.getByRole('button', { name: 'Show password' }));

      expect(screen.getByLabelText('Password')).toHaveValue('secret123');
    });

    it('do not submit the form when the eye button is pressed', async () => {
      const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
      render(
        <form onSubmit={onSubmit}>
          <TextField label="Password" type="password" />
        </form>,
      );

      await userEvent.click(screen.getByRole('button', { name: 'Show password' }));

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('keep the error message under the field', () => {
      render(<TextField label="Password" type="password" error="Password is required" />);

      expect(screen.getByRole('alert')).toHaveTextContent('Password is required');
      expect(
        within(screen.getByRole('alert').parentElement as HTMLElement).getByLabelText('Password'),
      ).toBeInTheDocument();
    });
  });

  it('has no eye button on other kinds of field', () => {
    render(<TextField label="Email" type="email" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
