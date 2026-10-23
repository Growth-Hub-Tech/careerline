import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionCard } from './QuestionCard';

const OPTIONS = [
  { value: 'hands', label: 'Building or fixing something with my hands' },
  { value: 'learn', label: 'Reading or learning something new' },
  { value: 'people', label: 'Talking with people' },
];

const setup = (props: Partial<Parameters<typeof QuestionCard>[0]> = {}) => {
  const handlers = { onChange: vi.fn(), onNext: vi.fn(), onBack: vi.fn() };
  render(
    <QuestionCard
      questionNumber={2}
      questionCount={5}
      text="How do you prefer to spend a free hour?"
      options={OPTIONS}
      {...handlers}
      {...props}
    />,
  );
  return handlers;
};

describe('QuestionCard', () => {
  it('shows progress through the questions', () => {
    setup();

    const bar = screen.getByRole('progressbar', { name: 'Question 2 of 5' });
    expect(bar).toHaveAttribute('aria-valuenow', '2');
    expect(bar).toHaveAttribute('aria-valuemax', '5');
  });

  it('reassures that there are no wrong answers', () => {
    setup();

    expect(
      screen.getByText(
        'There are no right or wrong answers here. Choose the option that resonates most with you.',
      ),
    ).toBeInTheDocument();
  });

  it('shows the question as a level 2 heading', () => {
    setup();

    expect(
      screen.getByRole('heading', { level: 2, name: 'How do you prefer to spend a free hour?' }),
    ).toBeInTheDocument();
  });

  it('names the answer group from the question', () => {
    setup();

    expect(
      screen.getByRole('radiogroup', { name: 'How do you prefer to spend a free hour?' }),
    ).toBeInTheDocument();
  });

  it('renders every option as a radio', () => {
    setup();

    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Talking with people' })).toBeInTheDocument();
  });

  it('reports the chosen answer', async () => {
    const { onChange } = setup();

    await userEvent.click(screen.getByRole('radio', { name: 'Talking with people' }));

    expect(onChange).toHaveBeenCalledWith('people');
  });

  it('selects when the option text is clicked', async () => {
    const { onChange } = setup();

    await userEvent.click(screen.getByText('Reading or learning something new'));

    expect(onChange).toHaveBeenCalledWith('learn');
  });

  it('shows the current answer as checked', () => {
    setup({ value: 'learn' });

    expect(screen.getByRole('radio', { name: 'Reading or learning something new' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Talking with people' })).not.toBeChecked();
  });

  it('disables Next until an answer is chosen', () => {
    setup();

    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('moves on with Next once answered', async () => {
    const { onNext } = setup({ value: 'learn' });

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('goes back with Back', async () => {
    const { onBack } = setup();

    await userEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('has no Back button on the first question', () => {
    setup({ onBack: undefined });

    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
  });

  it('offers Generate Result instead of Next on the last question', async () => {
    const { onNext } = setup({ isLast: true, value: 'learn' });

    expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Generate Result' }));

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('keeps Generate Result disabled until the last question is answered', () => {
    setup({ isLast: true });

    expect(screen.getByRole('button', { name: 'Generate Result' })).toBeDisabled();
  });
});
