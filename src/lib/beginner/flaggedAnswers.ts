import type { IntakeSubmission } from '../api';

export type FlaggedAnswers = Record<string, string>;

export const flaggedAnswers = (
  submission: IntakeSubmission,
  fieldErrors: Readonly<Record<string, string>>,
): FlaggedAnswers => {
  const flagged: FlaggedAnswers = {};
  const ids = new Set(submission.answers.map((answer) => answer.question_id));

  Object.entries(fieldErrors).forEach(([field, message]) => {
    const [first, second] = field.split('.');
    const questionId =
      first === 'answers'
        ? submission.answers[Number(second)]?.question_id
        : ids.has(first)
          ? first
          : undefined;

    if (questionId && !(questionId in flagged)) flagged[questionId] = message;
  });

  return flagged;
};
