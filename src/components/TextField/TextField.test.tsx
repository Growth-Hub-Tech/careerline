import { render, screen } from '@testing-library/react';
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
});
