import { completeProfileSchema, forgotPasswordSchema, signInSchema, signUpSchema } from './auth';

const messagesOf = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.error?.issues.map((issue) => issue.message) ?? [];

describe('signInSchema', () => {
  it('accepts an email and a password', () => {
    expect(
      signInSchema.safeParse({ email: 'skye@example.com', password: 'secret', remember: false })
        .success,
    ).toBe(true);
  });

  it('asks for both when empty', () => {
    const result = signInSchema.safeParse({ email: '', password: '', remember: false });

    expect(messagesOf(result)).toEqual(['Email is required', 'Password is required']);
  });

  it('rejects an email that is not an address', () => {
    const result = signInSchema.safeParse({ email: 'skye', password: 'secret', remember: false });

    expect(messagesOf(result)).toEqual(['Enter a valid email address']);
  });

  it('ignores spaces around the email', () => {
    const result = signInSchema.safeParse({
      email: '  skye@example.com ',
      password: 'secret',
      remember: false,
    });

    expect(result.success && result.data.email).toBe('skye@example.com');
  });
});

describe('signUpSchema and forgotPasswordSchema', () => {
  it.each([signUpSchema, forgotPasswordSchema])('need a valid email', (schema) => {
    expect(schema.safeParse({ email: 'skye@example.com' }).success).toBe(true);
    expect(messagesOf(schema.safeParse({ email: '' }))).toEqual(['Email is required']);
    expect(messagesOf(schema.safeParse({ email: 'nope' }))).toEqual([
      'Enter a valid email address',
    ]);
  });
});

describe('completeProfileSchema', () => {
  const valid = {
    fullName: 'Skye Favour',
    password: 'longenough1',
    confirmPassword: 'longenough1',
  };

  it('accepts a name and matching passwords', () => {
    expect(completeProfileSchema.safeParse(valid).success).toBe(true);
  });

  it('asks for a name', () => {
    expect(messagesOf(completeProfileSchema.safeParse({ ...valid, fullName: ' ' }))).toEqual([
      'Enter your full name',
    ]);
  });

  it('asks for at least 8 characters', () => {
    const result = completeProfileSchema.safeParse({
      ...valid,
      password: 'short',
      confirmPassword: 'short',
    });

    expect(messagesOf(result)).toEqual(['Use at least 8 characters']);
  });

  it('asks for the passwords to match', () => {
    const result = completeProfileSchema.safeParse({ ...valid, confirmPassword: 'different123' });

    expect(messagesOf(result)).toEqual(['Passwords do not match']);
  });
});
