import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { describeAuthError } from '../../lib/api/describeError';
import { applyFieldErrors } from '../../lib/forms/applyFieldErrors';
import { userNeedsType, useSignIn, useUserStore } from '../../lib/user';
import { signInSchema, type SignInValues } from '../../lib/validation/auth';
import { Alert } from '../Alert';
import { AUTH_PATHS, AuthTitle, DashedLink, SplitAuthLayout, TextField } from '../Auth';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';

export const SignIn = () => {
  const navigate = useNavigate();
  const location = useLocation() as {
    state: { from?: { pathname: string; search?: string; hash?: string } } | null;
  };
  const from = location.state?.from;
  const signIn = useSignIn();
  const [formError, setFormError] = useState<string>();
  const [hadExpired] = useState(() => useUserStore.getState().expired);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '', remember: false },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(undefined);

    try {
      await signIn.mutateAsync(values);
      const { user } = useUserStore.getState();
      const next =
        user && userNeedsType(user)
          ? AUTH_PATHS.getStarted
          : from
            ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
            : '/dashboard';
      navigate(next, { replace: true });
    } catch (error) {
      if (!applyFieldErrors(error, ['email', 'password'], setError)) {
        setFormError(describeAuthError(error));
      }
    }
  });

  return (
    <SplitAuthLayout>
      <AuthTitle>Welcome Back</AuthTitle>
      <p className="mt-3 text-[16px] text-slate-700">Welcome back! Please enter your details.</p>
      {hadExpired && (
        <Alert variant="info" className="mt-4">
          Your session has ended. Sign in again to carry on where you left off.
        </Alert>
      )}

      <form onSubmit={submit} noValidate className="mt-10 flex flex-col">
        {formError && (
          <Alert variant="error" className="mb-6">
            {formError}
          </Alert>
        )}

        <div className="flex flex-col gap-5">
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            error={errors.email?.message}
            {...register('email')}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <Checkbox label="Remember me" {...register('remember')} />
          <Link
            to={AUTH_PATHS.forgotPassword}
            className="rounded text-[14px] font-semibold text-indigo-700 hover:text-indigo-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Forgot password
          </Link>
        </div>

        <Button type="submit" isLoading={isSubmitting} className="mt-6">
          Sign in
        </Button>
      </form>

      <div className="mt-10 text-center">
        <DashedLink to={AUTH_PATHS.signUp}>Create your account instead</DashedLink>
      </div>
    </SplitAuthLayout>
  );
};
