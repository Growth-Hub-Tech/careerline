import { readRole, writeRole } from './role';

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
