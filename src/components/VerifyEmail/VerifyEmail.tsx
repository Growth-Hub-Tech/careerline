import { Link } from 'react-router-dom';
import { readPendingEmail, useSession } from '../../lib/session';
import { AUTH_PATHS, AuthText, AuthTitle, CardAuthLayout } from '../Auth';
import { ResendEmail } from './ResendEmail';

export const VerifyEmail = ({ email }: { email?: string }) => {
  const { session } = useSession();
  const address = email ?? readPendingEmail() ?? session?.user.email ?? 'your email address';

  return (
    <CardAuthLayout>
      <AuthTitle>Verify your email</AuthTitle>

      <AuthText className="mt-6">
        We sent a verification link to {address}. Open it to confirm your account. Please check your
        spam folder as well.
      </AuthText>

      <div className="mt-6">
        {session ? (
          <ResendEmail label="Resend email" sentMessage="We have sent the email again." />
        ) : (
          <AuthText>
            <Link
              to={AUTH_PATHS.signIn}
              className="font-medium text-indigo-700 underline hover:text-indigo-900"
            >
              Sign in
            </Link>{' '}
            to send the email again.
          </AuthText>
        )}
      </div>
    </CardAuthLayout>
  );
};
