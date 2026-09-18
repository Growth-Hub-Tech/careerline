import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../Button';
import { Link, useNavigate } from 'react-router-dom';
import './SignIn.scss';

const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export const SignIn = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (values: SignInFormValues) => {
    // TODO: wire up to auth endpoint
    console.log(values);
    navigate('/dashboard');
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        <span className="signin-logo">CareerLine AI</span>
        <h1 className="signin-title">Welcome back</h1>
        <p className="signin-subtitle">Sign in to continue to your dashboard.</p>

        <form className="signin-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="signin-field">
            <label htmlFor="email" className="signin-label">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="signin-input"
              {...register('email')}
            />
            {errors.email && <span className="signin-error">{errors.email.message}</span>}
          </div>

          <div className="signin-field">
            <label htmlFor="password" className="signin-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="signin-input"
              {...register('password')}
            />
            {errors.password && <span className="signin-error">{errors.password.message}</span>}
          </div>

          <div className="signin-forgot-row">
            <Link to="/forgot-password" className="signin-forgot-link">
              Forgot your password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="signin-submit-btn"
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            Sign in
          </Button>
        </form>

        <p className="signin-footer">
          New to CareerLine AI? Choose your path from the homepage to create an account.
        </p>
      </div>
    </div>
  );
};
