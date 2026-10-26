import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { describeAuthError } from '../../lib/api/describeError';
import { applyFieldErrors } from '../../lib/forms/applyFieldErrors';
import { completeProfileSchema, type CompleteProfileValues } from '../../lib/validation/auth';
import { Alert } from '../Alert';
import { AUTH_PATHS, AuthTitle, SplitAuthLayout, TextField } from '../Auth';
import { Button } from '../Button';

interface CompleteProfileProps {
  readonly email?: string;
  readonly onSubmit?: (values: CompleteProfileValues & { email: string }) => Promise<void>;
}

export const CompleteProfile = ({ email = '', onSubmit }: CompleteProfileProps) => {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string>();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CompleteProfileValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: { fullName: '', password: '', confirmPassword: '' },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(undefined);

    try {
      await onSubmit?.({ email, ...values });
      navigate(AUTH_PATHS.getStarted);
    } catch (error) {
      if (!applyFieldErrors(error, ['fullName', 'password'], setError)) {
        setFormError(describeAuthError(error));
      }
    }
  });

  return (
    <SplitAuthLayout>
      <AuthTitle>Welcome to Careerline</AuthTitle>

      <form onSubmit={submit} noValidate className="mt-10 flex flex-col">
        {formError && (
          <Alert variant="error" className="mb-6">
            {formError}
          </Alert>
        )}

        <div className="flex flex-col gap-4">
          <TextField
            label="Email"
            type="email"
            defaultValue={email}
            placeholder="example@email.com"
            readOnly
          />
          <TextField
            label="Full name"
            autoComplete="name"
            placeholder="Enter your full name"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a password"
            error={errors.password?.message}
            {...register('password')}
          />
          <TextField
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        <Button
          type="submit"
          fullWidth={false}
          isLoading={isSubmitting}
          className="mt-8 self-start"
        >
          Continue
        </Button>
      </form>
    </SplitAuthLayout>
  );
};
