import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../Button';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import './ResetPassword.scss';

const resetPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const ResetPassword = () => {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    // TODO: wire up to auth endpoint
    console.log(values);
    setSubmitted(true);
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <h1 className="reset-password-title">Reset your password</h1>
        <p className="reset-password-subtitle">
          Enter the email address on your account and we will send you a link to reset your
          password.
        </p>

        {submitted ? (
          <p className="reset-password-success">
            If an account exists for that email, a reset link is on its way.
          </p>
        ) : (
          <form className="reset-password-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="reset-password-field">
              <label htmlFor="email" className="reset-password-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="reset-password-input"
                {...register('email')}
              />
              {errors.email && <span className="reset-password-error">{errors.email.message}</span>}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="reset-password-submit-btn"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              Send reset link
            </Button>
          </form>
        )}

        <div className="reset-password-back-row">
          <Link to="/sign-in" className="reset-password-back-link">
            Return to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
