import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { describeAuthError } from '../../lib/api/describeError';
import { applyFieldErrors } from '../../lib/forms/applyFieldErrors';
import { rememberPendingEmail } from '../../lib/session';
import { signUpSchema, type SignUpValues } from '../../lib/validation/auth';
import { Alert } from '../Alert';
import { AUTH_PATHS, AuthTitle, DashedLink, SplitAuthLayout, TextField } from '../Auth';
import { Button } from '../Button';

interface SignUpProps {
  readonly onSubmit?: (values: SignUpValues) => Promise<void>;
}

export const SignUp = ({ onSubmit }: SignUpProps) => {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string>();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '' },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(undefined);

    try {
      await onSubmit?.(values);
      rememberPendingEmail(values.email);
      navigate(AUTH_PATHS.verifyEmail);
    } catch (error) {
      if (!applyFieldErrors(error, ['email'], setError)) {
        setFormError(describeAuthError(error));
      }
    }
  });

  return (
    <SplitAuthLayout>
      <AuthTitle>Create your free account</AuthTitle>

      <form onSubmit={submit} noValidate className="mt-10 flex flex-col gap-8">
        {formError && <Alert variant="error">{formError}</Alert>}

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Button type="submit" isLoading={isSubmitting}>
          Continue with email
        </Button>
      </form>

      <div className="mt-10">
        <DashedLink to={AUTH_PATHS.signIn}>Log in to an existing account</DashedLink>
      </div>
    </SplitAuthLayout>
  );
};
