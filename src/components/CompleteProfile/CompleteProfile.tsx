import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Navigate, useNavigate } from 'react-router-dom';
import { describeAuthError } from '../../lib/api/describeError';
import { authActions } from '../../lib/auth/actions';
import { applyFieldErrors } from '../../lib/forms/applyFieldErrors';
import { clearPendingEmail, readPendingEmail, useSession, type Session } from '../../lib/session';
import { completeProfileSchema, type CompleteProfileValues } from '../../lib/validation/auth';
import { Alert } from '../Alert';
import { AUTH_PATHS, AuthTitle, SplitAuthLayout, TextField } from '../Auth';
import { Button } from '../Button';

type ProfileSubmission = CompleteProfileValues & { email: string };

interface CompleteProfileProps {
  readonly email?: string;
  readonly onSubmit?: (values: ProfileSubmission) => Promise<Session | undefined>;
}

const registerWithApi = ({ email, fullName, phone, password }: ProfileSubmission) =>
  authActions.register({ email, fullName, phone, password });

export const CompleteProfile = ({
  email: emailProp,
  onSubmit = registerWithApi,
}: CompleteProfileProps) => {
  const email = emailProp ?? readPendingEmail() ?? '';
  const navigate = useNavigate();
  const { signIn } = useSession();
  const [formError, setFormError] = useState<string>();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CompleteProfileValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: { fullName: '', phone: '', password: '', confirmPassword: '' },
  });

  const submit = handleSubmit(async (values) => {
    setFormError(undefined);

    try {
      const session = await onSubmit({ email, ...values });
      if (session) signIn(session);
      clearPendingEmail();
      navigate(AUTH_PATHS.getStarted);
    } catch (error) {
      if (!applyFieldErrors(error, ['fullName', 'phone', 'password'], setError)) {
        setFormError(describeAuthError(error));
      }
    }
  });

  if (!email) {
    return <Navigate to={AUTH_PATHS.signUp} replace />;
  }

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
            label="Phone number"
            type="tel"
            autoComplete="tel"
            placeholder="Enter your phone number"
            error={errors.phone?.message}
            {...register('phone')}
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
