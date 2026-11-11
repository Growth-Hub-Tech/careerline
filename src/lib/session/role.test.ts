import { createDevSession } from './devSession';
import { needsUserType, readRole, userTypeFor, writeRole } from './role';

describe('remembered role', () => {
  it('has none at first', () => {
    expect(readRole('skye@example.com')).toBeUndefined();
  });

  it('remembers the role chosen for an email', () => {
    writeRole('skye@example.com', 'recruiter');

    expect(readRole('skye@example.com')).toBe('recruiter');
  });

  it('does not care about capital letters in the email', () => {
    writeRole('Skye@Example.com', 'self-test');

    expect(readRole('skye@example.COM')).toBe('self-test');
  });

  it('keeps one role per person', () => {
    writeRole('skye@example.com', 'recruiter');
    writeRole('ada@example.com', 'organization');

    expect(readRole('skye@example.com')).toBe('recruiter');
    expect(readRole('ada@example.com')).toBe('organization');
  });

  it('ignores a stored value that is not a user type', () => {
    window.localStorage.setItem(
      'careerline.roles',
      JSON.stringify({ 'skye@example.com': 'admin' }),
    );

    expect(readRole('skye@example.com')).toBeUndefined();
  });

  it('ignores stored text that is not JSON', () => {
    window.localStorage.setItem('careerline.roles', '{oops');

    expect(readRole('skye@example.com')).toBeUndefined();
  });
});

describe('user type for an account', () => {
  it.each([
    ['owner', 'organization'],
    ['admin', 'organization'],
    ['recruiter', 'recruiter'],
  ] as const)('comes from an organisation %s role, whatever was chosen here', (role, type) => {
    writeRole('skye@example.com', 'self-test');

    expect(userTypeFor('skye@example.com', role)).toBe(type);
  });

  it('is the type chosen here for an account outside any organisation', () => {
    writeRole('skye@example.com', 'self-test');

    expect(userTypeFor('skye@example.com', null)).toBe('self-test');
  });

  it('is unknown for an account outside any organisation that chose nothing here', () => {
    expect(userTypeFor('skye@example.com', null)).toBeUndefined();
  });
});

describe('who still needs to pick a type', () => {
  it('is someone outside any organisation who has not chosen yet', () => {
    expect(needsUserType(createDevSession('beginner'))).toBe(true);
  });

  it('is not someone who chose here', () => {
    writeRole('skye@example.com', 'beginner');

    expect(needsUserType(createDevSession('beginner'))).toBe(false);
  });

  it('is not an organisation member, even on a new device', () => {
    expect(needsUserType(createDevSession('organization'))).toBe(false);
    expect(needsUserType(createDevSession('recruiter'))).toBe(false);
  });
});
