import * as z from 'zod';

const email = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .pipe(z.email('Enter a valid email address'));

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean(),
});

export const signUpSchema = z.object({ email });

export const forgotPasswordSchema = z.object({ email });

export const completeProfileSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name'),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s()-]{7,}$/, 'Enter a valid phone number'),
    password: z.string().min(8, 'Use at least 8 characters'),
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
