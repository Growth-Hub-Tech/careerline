import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RadioGroup } from './RadioGroup';

const OPTIONS = [
  { value: 'path', label: 'Discover your career path', description: 'Get a ranked list of paths.' },
  { value: 'skills', label: 'Test your skills', description: 'Download a shareable report.' },
  { value: 'talent', label: 'Validate talent' },
];

describe('RadioGroup', () => {
  it('names the group from its legend', () => {
    render(<RadioGroup legend="How will you use CareerLine?" name="use" options={OPTIONS} />);

    expect(
      screen.getByRole('radiogroup', { name: 'How will you use CareerLine?' }),
    ).toBeInTheDocument();
  });

  it('renders one radio per option, named by its label', () => {
    render(<RadioGroup legend="Use" name="use" options={OPTIONS} />);

    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Test your skills' })).toHaveAttribute(
      'value',
      'skills',
    );
  });

  it('describes a radio with its description', () => {
    render(<RadioGroup legend="Use" name="use" options={OPTIONS} />);

    expect(screen.getByRole('radio', { name: 'Test your skills' })).toHaveAccessibleDescription(
      'Download a shareable report.',
    );
  });

  it('selects one option at a time and reports its value', async () => {
    const onChange = vi.fn();
    render(<RadioGroup legend="Use" name="use" options={OPTIONS} onChange={onChange} />);

    await userEvent.click(screen.getByRole('radio', { name: 'Test your skills' }));
    await userEvent.click(screen.getByRole('radio', { name: 'Validate talent' }));

    expect(onChange).toHaveBeenNthCalledWith(1, 'skills');
    expect(onChange).toHaveBeenNthCalledWith(2, 'talent');
    expect(screen.getByRole('radio', { name: 'Test your skills' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Validate talent' })).toBeChecked();
  });

  it('selects when the option text is clicked', async () => {
    render(<RadioGroup legend="Use" name="use" options={OPTIONS} />);

    await userEvent.click(screen.getByText('Download a shareable report.'));

    expect(screen.getByRole('radio', { name: 'Test your skills' })).toBeChecked();
  });

  it('starts on a default value', () => {
    render(<RadioGroup legend="Use" name="use" options={OPTIONS} defaultValue="path" />);

    expect(screen.getByRole('radio', { name: 'Discover your career path' })).toBeChecked();
  });

  it('respects a controlled value', () => {
    render(
      <RadioGroup
        legend="Use"
        name="use"
        options={OPTIONS}
        value="talent"
        onChange={() => undefined}
      />,
    );

    expect(screen.getByRole('radio', { name: 'Validate talent' })).toBeChecked();
  });

  it('disables a single option', () => {
    render(
      <RadioGroup
        legend="Use"
        name="use"
        options={[...OPTIONS, { value: 'team', label: 'Audit your team', disabled: true }]}
      />,
    );

    expect(screen.getByRole('radio', { name: 'Audit your team' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Validate talent' })).toBeEnabled();
  });

  it('disables the whole group', () => {
    render(<RadioGroup legend="Use" name="use" options={OPTIONS} disabled />);

    screen.getAllByRole('radio').forEach((radio) => expect(radio).toBeDisabled());
  });

  it('announces an error and marks the group invalid', () => {
    render(<RadioGroup legend="Use" name="use" options={OPTIONS} error="Choose one to continue" />);

    const group = screen.getByRole('radiogroup');
    expect(group).toBeInvalid();
    expect(group).toHaveAccessibleDescription('Choose one to continue');
    expect(screen.getByRole('alert')).toHaveTextContent('Choose one to continue');
  });
});
