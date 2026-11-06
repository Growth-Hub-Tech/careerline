import { writeSession } from '../session';
import { clearAttempt, readAttempt, saveAttempt, type SavedAttempt } from './attemptStore';

const SAVED: SavedAttempt = {
  testId: 202,
  title: 'Backend Development',
  attemptId: 12,
};

const signInAs = (email: string) =>
  writeSession({ token: 't', user: { name: 'Skye', email, userType: 'self-test' } });

beforeEach(() => signInAs('skye@example.com'));

describe('attempt store', () => {
  it('has nothing saved at first', () => {
    expect(readAttempt(202)).toBeNull();
  });

  it('reads back what was saved for the same test', () => {
    saveAttempt(SAVED);

    expect(readAttempt(202)).toEqual(SAVED);
    expect(readAttempt(208)).toBeNull();
  });

  it('keeps each person their own attempt', () => {
    saveAttempt(SAVED);
    signInAs('ada@example.com');

    expect(readAttempt(202)).toBeNull();
  });

  it('forgets a cleared attempt', () => {
    saveAttempt(SAVED);
    clearAttempt(202);

    expect(readAttempt(202)).toBeNull();
  });

  it('ignores something that is not an attempt', () => {
    window.localStorage.setItem('careerline.attempt.skye@example.com.202', '{"answers":3}');

    expect(readAttempt(202)).toBeNull();
  });

  it('ignores an attempt saved before tests moved to one question at a time', () => {
    window.localStorage.setItem(
      'careerline.attempt.skye@example.com.202',
      JSON.stringify({
        testId: 202,
        title: 'Backend Development',
        attempt: { attempt_id: 8, questions: [] },
        answers: [],
      }),
    );

    expect(readAttempt(202)).toBeNull();
  });
});
