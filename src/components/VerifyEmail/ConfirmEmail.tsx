import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ApiError } from '../../lib/api/ApiError';
import { describeError } from '../../lib/api/describeError';
import { accountQueries } from '../../lib/api/queries';
import { useUser } from '../../lib/user';
import { Alert } from '../Alert';
import { AUTH_PATHS, AuthText, AuthTitle, CardAuthLayout } from '../Auth';
import { Button } from '../Button';
import { PRIMARY_ACTION } from '../ErrorPage';
import { Spinner } from '../Loader';
import { ResendEmail } from './ResendEmail';

const isExpired = (error: unknown) =>
  error instanceof ApiError && (error.status === 410 || error.code?.toLowerCase() === 'expired');

export const ConfirmEmail = ({ token }: { token: string }) => {
  const user = useUser();
  const verification = useQuery(accountQueries.verifyEmail(token));

  if (verification.isPending) {
    return (
      <CardAuthLayout>
        <div className="flex flex-col items-center gap-4 text-center">
          <Spinner size="lg" label="Confirming your email" />
          <AuthText aria-hidden="true">Confirming your email…</AuthText>
        </div>
      </CardAuthLayout>
    );
  }

  if (verification.isSuccess) {
    return (
      <CardAuthLayout>
        <AuthTitle>Email confirmed</AuthTitle>
        <AuthText className="mt-6">Thanks, your email address is confirmed.</AuthText>
        <Link
          to={user ? AUTH_PATHS.getStarted : AUTH_PATHS.signIn}
          className={`${PRIMARY_ACTION} mt-6 w-full`}
        >
          {user ? 'Continue' : 'Sign in'}
        </Link>
      </CardAuthLayout>
    );
  }

  if (isExpired(verification.error)) {
    return (
      <CardAuthLayout>
        <AuthTitle>This link has expired</AuthTitle>
        <AuthText className="mt-6">The link is too old or has already been used.</AuthText>
        <div className="mt-6">
          {user ? (
            <ResendEmail label="Send me a new email" sentMessage="We have sent a new email." />
          ) : (
            <Link to={AUTH_PATHS.signIn} className={`${PRIMARY_ACTION} w-full`}>
              Sign in
            </Link>
          )}
        </div>
      </CardAuthLayout>
    );
  }

  return (
    <CardAuthLayout>
      <AuthTitle>We could not confirm your email</AuthTitle>
      <div className="mt-6 flex flex-col gap-4">
        <Alert variant="error">{describeError(verification.error)}</Alert>
        <Button variant="secondary" onClick={() => void verification.refetch()}>
          Try again
        </Button>
      </div>
    </CardAuthLayout>
  );
};
