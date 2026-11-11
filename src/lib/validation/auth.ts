import * as z from 'zod';

// The longest values the API accepts (the account's database columns, and a password cap)
export const LIMITS = { name: 100, email: 100, phone: 20, password: 128 } as const;

const tooLong = (limit: number) => `Use ${limit} characters or fewer`;

const email = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(LIMITS.email, tooLong(LIMITS.email))
  .pipe(z.email('Enter a valid email address'));

export const fullName = z.string().trim().max(LIMITS.name, tooLong(LIMITS.name));
export const phone = z.string().trim().max(LIMITS.phone, tooLong(LIMITS.phone));
export const newPassword = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(LIMITS.password, tooLong(LIMITS.password));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean(),
});

export const signUpSchema = z.object({ email });

export const forgotPasswordSchema = z.object({ email });

export const completeProfileSchema = z
  .object({
    fullName: fullName.min(2, 'Enter your full name'),
    phone: phone.regex(/^\+?[\d\s()-]{7,}$/, 'Enter a valid phone number'),
    password: newPassword,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type CompleteProfileValues = z.infer<typeof completeProfileSchema>;
