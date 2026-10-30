import { flaggedAnswers } from './flaggedAnswers';

const submission = {
  version: '2026-10',
  answers: [
    { question_id: 'free_hour', values: ['hands'] },
    { question_id: 'traits', values: ['curious'] },
    { question_id: 'hours', values: ['7'] },
  ],
};

describe('flaggedAnswers', () => {
  it('finds the question behind each rejected answer', () => {
    expect(
      flaggedAnswers(submission, {
        'answers.2.values': 'Choose one of the listed options.',
        'answers.0': 'Answer this question.',
      }),
    ).toEqual({
      hours: 'Choose one of the listed options.',
      free_hour: 'Answer this question.',
    });
  });

  it('accepts errors that name the question', () => {
    expect(flaggedAnswers(submission, { traits: 'Pick at least one.' })).toEqual({
      traits: 'Pick at least one.',
    });
  });

  it('keeps the first message for a question', () => {
    expect(
      flaggedAnswers(submission, {
        'answers.1.values': 'Pick at least one.',
        'answers.1.question_id': 'Unknown question.',
      }),
    ).toEqual({ traits: 'Pick at least one.' });
  });

  it('ignores errors it cannot place on a question', () => {
    expect(
      flaggedAnswers(submission, { version: 'Out of date.', 'answers.9.values': 'Bad.' }),
    ).toEqual({});
  });
});
