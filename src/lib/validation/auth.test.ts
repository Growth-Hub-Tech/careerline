import {
  completeProfileSchema,
  forgotPasswordSchema,
  LIMITS,
  newPassword,
  signInSchema,
  signUpSchema,
} from './auth';

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
    phone: '08012345678',
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

  it('asks for a phone number that looks like one', () => {
    const result = completeProfileSchema.safeParse({ ...valid, phone: 'abc' });

    expect(messagesOf(result)).toEqual(['Enter a valid phone number']);
  });

  it('asks for a phone number that looks like one', () => {
    const result = completeProfileSchema.safeParse({ ...valid, phone: 'abc' });

    expect(messagesOf(result)).toEqual(['Enter a valid phone number']);
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

describe('the limits the API accepts', () => {
  const profile = {
    fullName: 'Skye Favour',
    phone: '08012345678',
    password: 'long-enough-1',
    confirmPassword: 'long-enough-1',
  };
  const emailOf = (length: number) => `${'a'.repeat(length - '@example.com'.length)}@example.com`;

  it('accepts values that fill each field', () => {
    const password = 'p'.repeat(LIMITS.password);
    expect(
      completeProfileSchema.safeParse({
        fullName: 'N'.repeat(LIMITS.name),
        phone: '0'.repeat(LIMITS.phone),
        password,
        confirmPassword: password,
      }).success,
    ).toBe(true);
    expect(signUpSchema.safeParse({ email: emailOf(LIMITS.email) }).success).toBe(true);
  });

  it.each([
    ['fullName', 'N'.repeat(101), 'Use 100 characters or fewer'],
    ['phone', '0'.repeat(21), 'Use 20 characters or fewer'],
  ])('refuses a %s one character too long', (field, value, message) => {
    expect(messagesOf(completeProfileSchema.safeParse({ ...profile, [field]: value }))).toContain(
      message,
    );
  });

  it('refuses a password over 128 characters, as the API does', () => {
    const long = 'p'.repeat(129);
    expect(
      messagesOf(
        completeProfileSchema.safeParse({ ...profile, password: long, confirmPassword: long }),
      ),
    ).toContain('Use 128 characters or fewer');
    expect(newPassword.safeParse(long).success).toBe(false);
  });

  it('refuses an email over 100 characters', () => {
    expect(messagesOf(signUpSchema.safeParse({ email: emailOf(101) }))).toEqual([
      'Use 100 characters or fewer',
    ]);
  });
});
