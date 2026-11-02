import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../lib/api';
import { ApiError } from '../../lib/api/ApiError';
import { describeError } from '../../lib/api/describeError';
import { useRequest } from '../../lib/hooks/useRequest';
import { useSession } from '../../lib/session';
import { Alert } from '../Alert';
import { AUTH_PATHS, AuthText, AuthTitle, CardAuthLayout } from '../Auth';
import { Button } from '../Button';
import { PRIMARY_ACTION } from '../ErrorPage';
import { Spinner } from '../Loader';
import { ResendEmail } from './ResendEmail';

const inflight = new Map<string, Promise<unknown>>();

const verifyOnce = (token: string) => {
  let request = inflight.get(token);

  if (!request) {
    request = authApi.verifyEmail(token);
    inflight.set(token, request);
    request.catch(() => inflight.delete(token));
  }

  return request;
};

const isExpired = (error: unknown) =>
  error instanceof ApiError && (error.status === 410 || error.code?.toLowerCase() === 'expired');

export const ConfirmEmail = ({ token }: { token: string }) => {
  const { session } = useSession();
  const load = useCallback(() => verifyOnce(token), [token]);
  const { state, retry } = useRequest(load);

  if (state.status === 'loading') {
    return (
      <CardAuthLayout>
        <div className="flex flex-col items-center gap-4 text-center">
          <Spinner size="lg" label="Confirming your email" />
          <AuthText aria-hidden="true">Confirming your email…</AuthText>
        </div>
      </CardAuthLayout>
    );
  }

  if (state.status === 'success') {
    return (
      <CardAuthLayout>
        <AuthTitle>Email confirmed</AuthTitle>
        <AuthText className="mt-6">Thanks, your email address is confirmed.</AuthText>
        <Link
          to={session ? AUTH_PATHS.getStarted : AUTH_PATHS.signIn}
          className={`${PRIMARY_ACTION} mt-6 w-full`}
        >
          {session ? 'Continue' : 'Sign in'}
        </Link>
      </CardAuthLayout>
    );
  }

  if (isExpired(state.error)) {
    return (
      <CardAuthLayout>
        <AuthTitle>This link has expired</AuthTitle>
        <AuthText className="mt-6">The link is too old or has already been used.</AuthText>
        <div className="mt-6">
          {session ? (
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
        <Alert variant="error">{describeError(state.error)}</Alert>
        <Button variant="secondary" onClick={retry}>
          Try again
        </Button>
      </div>
    </CardAuthLayout>
  );
};
