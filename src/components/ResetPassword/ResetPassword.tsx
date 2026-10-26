import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { describeAuthError } from '../../lib/api/describeError';
import { applyFieldErrors } from '../../lib/forms/applyFieldErrors';
import { forgotPasswordSchema, type ForgotPasswordValues } from '../../lib/validation/auth';
import { Alert } from '../Alert';
import { AUTH_PATHS, AuthText, AuthTitle, CardAuthLayout, DashedLink, TextField } from '../Auth';
import { Button } from '../Button';

interface ResetPasswordProps {
  readonly onSubmit?: (values: ForgotPasswordValues) => Promise<void>;
}

export const ResetPassword = ({ onSubmit }: ResetPasswordProps) => {
  const [formError, setFormError] = useState<string>();
  const [sentTo, setSentTo] = useState<string>();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(undefined);
    setSentTo(undefined);

    try {
      await onSubmit?.(values);
      setSentTo(values.email);
    } catch (error) {
      if (!applyFieldErrors(error, ['email'], setError)) {
        setFormError(describeAuthError(error));
      }
    }
  });

  return (
    <CardAuthLayout showActions>
      <AuthTitle>Reset your password</AuthTitle>

      <AuthText className="mt-6">
        Enter the email address on your account and we will send you a link to reset your password.
      </AuthText>

      <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-6">
        {formError && <Alert variant="error">{formError}</Alert>}
        {sentTo && (
          <Alert variant="success">
            If an account exists for {sentTo}, we have sent a link to reset the password.
          </Alert>
        )}

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" variant="secondary" isLoading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <div className="mt-8">
        <DashedLink to={AUTH_PATHS.signIn}>Sign in instead</DashedLink>
      </div>
    </CardAuthLayout>
  );
};
