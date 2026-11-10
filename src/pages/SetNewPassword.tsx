import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Alert } from '../components/Alert';
import {
  AUTH_PATHS,
  AuthText,
  AuthTitle,
  CardAuthLayout,
  DashedLink,
  TextField,
} from '../components/Auth';
import { Button } from '../components/Button';
import { authApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { describeError } from '../lib/api/describeError';

const newPasswordSchema = z
  .object({
    password: z.string().min(8, 'Use at least 8 characters'),
    repeat: z.string(),
  })
  .refine((values) => values.password === values.repeat, {
    message: 'The passwords do not match',
    path: ['repeat'],
  });

type NewPasswordValues = z.infer<typeof newPasswordSchema>;

const LinkProblem = ({ message }: { message: string }) => (
  <div className="mt-6 flex flex-col gap-6">
    <Alert variant="error">{message}</Alert>
    <DashedLink to={AUTH_PATHS.forgotPassword}>Ask for a new link</DashedLink>
  </div>
);

const NewPasswordForm = ({ token }: { token: string }) => {
  const [isDone, setIsDone] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [error, setError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: '', repeat: '' },
  });

  const submit = handleSubmit(async (values) => {
    setError(undefined);
    try {
      await authApi.confirmPasswordReset(token, values.password);
      setIsDone(true);
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 410) setIsExpired(true);
      else setError(describeError(submitError));
    }
  });

  if (isExpired) return <LinkProblem message="This reset link has expired or was already used." />;

  if (isDone) {
    return (
      <div className="mt-6 flex flex-col gap-6">
        <Alert variant="success">Your password was changed. Sign in with your new password.</Alert>
        <DashedLink to={AUTH_PATHS.signIn}>Sign in</DashedLink>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-6">
      {error && <Alert variant="error">{error}</Alert>}
      <TextField
        label="New password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <TextField
        label="Repeat new password"
        type="password"
        autoComplete="new-password"
        error={errors.repeat?.message}
        {...register('repeat')}
      />
      <Button type="submit" variant="secondary" isLoading={isSubmitting}>
        Set new password
      </Button>
    </form>
  );
};

export const SetNewPassword = () => {
  const [params] = useSearchParams();
  const token = params.get('token');

  return (
    <CardAuthLayout showActions>
      <AuthTitle>Choose a new password</AuthTitle>
      <AuthText className="mt-6">
        Use at least 8 characters. Every device signed in to your account will be signed out.
      </AuthText>
      {token ? (
        <NewPasswordForm token={token} />
      ) : (
        <LinkProblem message="This reset link is incomplete." />
      )}
    </CardAuthLayout>
  );
};
