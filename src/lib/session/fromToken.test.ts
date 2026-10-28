import { sessionFromToken } from './fromToken';
import { writeRole } from './role';

const TOKEN = {
  access_token: 'abc123',
  token_type: 'bearer',
  learner_id: 7,
  full_name: 'Skye Favour',
};

describe('sessionFromToken', () => {
  it('builds a session from the login reply and the email that was typed', () => {
    expect(sessionFromToken(TOKEN, 'skye@example.com')).toEqual({
      token: 'abc123',
      user: { name: 'Skye Favour', email: 'skye@example.com', userType: 'beginner' },
    });
  });

  it('can start as another user type', () => {
    expect(sessionFromToken(TOKEN, 'skye@example.com', 'recruiter').user.userType).toBe(
      'recruiter',
    );
  });

  it('keeps the role this person chose before', () => {
    writeRole('skye@example.com', 'self-test');

    expect(sessionFromToken(TOKEN, 'skye@example.com').user.userType).toBe('self-test');
  });

  it('lets a given user type win over the remembered one', () => {
    writeRole('skye@example.com', 'self-test');

    expect(sessionFromToken(TOKEN, 'skye@example.com', 'recruiter').user.userType).toBe(
      'recruiter',
    );
  });
});
