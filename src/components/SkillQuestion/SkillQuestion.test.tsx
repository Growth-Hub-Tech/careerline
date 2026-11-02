import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillQuestion } from './SkillQuestion';

const OPTIONS = [
  { value: '21', label: 'text-color' },
  { value: '22', label: 'color' },
  { value: '23', label: 'font-color' },
];

const setup = (props: Partial<Parameters<typeof SkillQuestion>[0]> = {}) => {
  const handlers = { onChange: vi.fn(), onNext: vi.fn() };
  render(
    <SkillQuestion
      questionNumber={5}
      questionCount={18}
      text="Which property is used to change the text color in CSS?"
      options={OPTIONS}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
};

describe('SkillQuestion', () => {
  it('says which question this is and shows the progress', () => {
    setup();

    expect(screen.getByText('Question 5 of 18')).toBeInTheDocument();
    const bar = screen.getByRole('progressbar', { name: 'Question 5 of 18' });
    expect(bar).toHaveAttribute('aria-valuenow', '5');
    expect(bar).toHaveAttribute('aria-valuemax', '18');
  });

  it('asks the question as a heading', () => {
    setup();

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Which property is used to change the text color in CSS?',
      }),
    ).toBeInTheDocument();
  });

  it('offers the answers as one choice named by the question', () => {
    setup();

    const group = screen.getByRole('radiogroup', { name: /change the text color/ });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('reports the chosen answer', async () => {
    const { onChange } = setup();

    await userEvent.click(screen.getByRole('radio', { name: 'color' }));

    expect(onChange).toHaveBeenCalledWith('22');
  });

  it('marks the chosen answer', () => {
    setup({ selected: '22' });

    expect(screen.getByRole('radio', { name: 'color' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'text-color' })).not.toBeChecked();
  });

  it('waits for an answer before moving on', () => {
    setup();

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('moves on once an answer is chosen', async () => {
    const { onNext } = setup({ selected: '22' });

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('offers Submit test on the last question', () => {
    setup({ isLast: true, selected: '22' });

    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit test' })).toBeEnabled();
  });

  it('shows that the answers are being sent', () => {
    setup({ isLast: true, selected: '22', isSubmitting: true });

    const button = screen.getByRole('button', { name: 'Sending...' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('has no way back to an earlier question', () => {
    setup();

    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });
});
