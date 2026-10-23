import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from './Select';

const OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'recruiter', label: 'Recruiter' },
  { value: 'organization', label: 'Organization' },
];

describe('Select', () => {
  it('links the label to the select', () => {
    render(<Select label="Role" options={OPTIONS} />);

    expect(screen.getByLabelText('Role')).toBeInTheDocument();
  });

  it('renders every option', () => {
    render(<Select label="Role" options={OPTIONS} />);

    expect(screen.getAllByRole('option')).toHaveLength(3);
    expect(screen.getByRole('option', { name: 'Recruiter' })).toHaveValue('recruiter');
  });

  it('shows the placeholder first and keeps it unselectable', () => {
    render(<Select label="Role" options={OPTIONS} placeholder="Choose a role" />);

    expect(screen.getByLabelText('Role')).toHaveDisplayValue('Choose a role');
    expect(screen.getByRole('option', { name: 'Choose a role' })).toBeDisabled();
  });

  it('reports the chosen option through onChange', async () => {
    const onChange = vi.fn();
    render(<Select label="Role" options={OPTIONS} onChange={onChange} />);

    await userEvent.selectOptions(screen.getByLabelText('Role'), 'recruiter');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Role')).toHaveValue('recruiter');
  });

  it('respects a controlled value', () => {
    render(
      <Select label="Role" options={OPTIONS} value="organization" onChange={() => undefined} />,
    );

    expect(screen.getByLabelText('Role')).toHaveValue('organization');
  });

  it('describes the select with its hint', () => {
    render(<Select label="Role" options={OPTIONS} hint="You can change this later" />);

    expect(screen.getByLabelText('Role')).toHaveAccessibleDescription('You can change this later');
  });

  it('marks the select invalid and announces the error instead of the hint', () => {
    render(
      <Select
        label="Role"
        options={OPTIONS}
        hint="You can change this later"
        error="Pick a role"
      />,
    );

    const select = screen.getByLabelText('Role');
    expect(select).toBeInvalid();
    expect(select).toHaveAccessibleDescription('Pick a role');
    expect(screen.getByRole('alert')).toHaveTextContent('Pick a role');
    expect(screen.queryByText('You can change this later')).not.toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<Select label="Role" options={OPTIONS} disabled />);

    expect(screen.getByLabelText('Role')).toBeDisabled();
  });
});
