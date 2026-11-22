import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useResetPassword } from '../../lib/api/queries';
import { describeAuthError } from '../../lib/api/describeError';
import { applyFieldErrors } from '../../lib/forms/applyFieldErrors';
import {
  RESET_PIN,
  resetPasswordSchema,
  type ResetPasswordValues,
} from '../../lib/validation/auth';
import { Alert } from '../Alert';
import { AUTH_PATHS, AuthText, AuthTitle, CardAuthLayout, DashedLink, TextField } from '../Auth';
import { Button } from '../Button';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const resetPassword = useResetPassword();
  const [formError, setFormError] = useState<string>();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '', pin: '', password: '', confirmPassword: '' },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(undefined);
    try {
      await resetPassword.mutateAsync(values);
      navigate(AUTH_PATHS.signIn, { replace: true, state: { passwordReset: true } });
    } catch (error) {
      if (!applyFieldErrors(error, ['email', 'pin'], setError)) {
        setFormError(describeAuthError(error));
      }
    }
  });

  return (
    <CardAuthLayout showActions>
      <AuthTitle>Reset your password</AuthTitle>
      <AuthText className="mt-6">
        Enter the email on your account, the reset PIN and a new password. Every device signed in to
        your account will be signed out.
      </AuthText>

      <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-6">
        {formError && <Alert variant="error">{formError}</Alert>}
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Reset PIN"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={10}
          placeholder="Enter the reset PIN"
          hint={`Your reset PIN is ${RESET_PIN}.`}
          error={errors.pin?.message}
          {...register('pin')}
        />
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        <TextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" variant="secondary" isLoading={isSubmitting}>
          Reset password
        </Button>
      </form>

      <div className="mt-8">
        <DashedLink to={AUTH_PATHS.signIn}>Sign in instead</DashedLink>
      </div>
    </CardAuthLayout>
  );
};
