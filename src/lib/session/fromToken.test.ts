import { sessionFromToken } from './fromToken';

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
});
