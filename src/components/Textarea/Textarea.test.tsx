import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('links the label to the textarea', () => {
    render(<Textarea label="Message" />);

    expect(screen.getByRole('textbox', { name: 'Message' })).toBeInTheDocument();
  });

  it('passes typing through', async () => {
    const onChange = vi.fn();
    render(<Textarea label="Message" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText('Message'), 'Hi');

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(screen.getByLabelText('Message')).toHaveValue('Hi');
  });

  it('describes the textarea with its hint', () => {
    render(<Textarea label="Message" hint="Max 500 characters" />);

    expect(screen.getByLabelText('Message')).toHaveAccessibleDescription('Max 500 characters');
  });

  it('marks the textarea invalid and announces the error instead of the hint', () => {
    render(<Textarea label="Message" hint="Max 500 characters" error="Message is required" />);

    const field = screen.getByLabelText('Message');
    expect(field).toBeInvalid();
    expect(field).toHaveAccessibleDescription('Message is required');
    expect(screen.getByRole('alert')).toHaveTextContent('Message is required');
    expect(screen.queryByText('Max 500 characters')).not.toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<Textarea label="Message" disabled />);

    expect(screen.getByLabelText('Message')).toBeDisabled();
  });
});
