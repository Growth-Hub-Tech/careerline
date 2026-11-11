import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { rememberPendingEmail } from '../../lib/user';
import { signUpSchema, type SignUpValues } from '../../lib/validation/auth';
import { AUTH_PATHS, AuthTitle, DashedLink, SplitAuthLayout, TextField } from '../Auth';
import { Button } from '../Button';

// The email is kept for the next step (Complete profile), which creates the account
export const SignUp = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '' },
  });

  const submit = handleSubmit((values) => {
    rememberPendingEmail(values.email);
    navigate(AUTH_PATHS.completeProfile);
  });

  return (
    <SplitAuthLayout>
      <AuthTitle>Create your free account</AuthTitle>

      <form onSubmit={submit} noValidate className="mt-10 flex flex-col gap-8">
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
