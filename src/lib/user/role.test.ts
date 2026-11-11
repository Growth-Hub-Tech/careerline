import { needsUserType, userTypeFor } from './role';
import type { User } from './types';

const user = (userType: User['userType']): User => ({
  name: 'Skye Favour',
  email: 'skye@example.com',
  userType,
});

describe('user type for an account', () => {
  it.each([
    ['owner', 'organization'],
    ['admin', 'organization'],
    ['recruiter', 'recruiter'],
  ] as const)('comes from an organisation %s role, whatever was chosen here', (role, type) => {
    expect(userTypeFor(role, 'self-test')).toBe(type);
  });

  it('is the type chosen here for an account outside any organisation', () => {
    expect(userTypeFor(null, 'self-test')).toBe('self-test');
    expect(userTypeFor(undefined, 'beginner')).toBe('beginner');
  });

  it('is unknown for an account outside any organisation that chose nothing here', () => {
    expect(userTypeFor(null, undefined)).toBeUndefined();
  });
});

describe('who still needs to pick a type', () => {
  it('is someone outside any organisation who has not chosen yet', () => {
    expect(needsUserType(user('beginner'), undefined)).toBe(true);
  });

  it('is not someone who chose here', () => {
    expect(needsUserType(user('beginner'), 'beginner')).toBe(false);
  });

  it('is not an organisation member, even on a new device', () => {
    expect(needsUserType(user('organization'), undefined)).toBe(false);
    expect(needsUserType(user('recruiter'), undefined)).toBe(false);
  });
});
