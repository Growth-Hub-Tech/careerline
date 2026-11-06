import { useCallback, useState, type ReactNode } from 'react';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { PRIMARY_ACTION, SECONDARY_ACTION } from '../components/ErrorPage';
import { PageLoader } from '../components/Loader';
import { invitationsApi, type InvitationPublic } from '../lib/api';
import { describeError } from '../lib/api/describeError';
import { formatDate } from '../lib/format';
import { useRequest } from '../lib/hooks/useRequest';
import { useSession } from '../lib/session';
import { saveAttempt } from '../lib/tests/attemptStore';

const Frame = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-5 py-12 sm:px-8">
    <h1 className="font-heading text-[28px] leading-[1.25] font-bold text-slate-950">{title}</h1>
    {children}
  </div>
);

const InvalidLink = () => (
  <Frame title="This link is invalid or has expired">
    <p className="text-[15px] text-slate-600">
      The test link may have been cancelled, used already, or it is too old. Ask the person who sent
      it for a new link.
    </p>
  </Frame>
);

const Details = ({ invitation }: { invitation: InvitationPublic }) => (
  <dl className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-[15px] sm:grid-cols-[auto_1fr] sm:gap-x-6">
    <dt className="text-slate-500">Test</dt>
    <dd className="font-semibold text-slate-900">{invitation.test_title}</dd>
    <dt className="text-slate-500">Time</dt>
    <dd className="text-slate-900">{invitation.duration_minutes} minutes, in one sitting</dd>
    <dt className="text-slate-500">Link works until</dt>
    <dd className="text-slate-900">{formatDate(invitation.expires_at)}</dd>
  </dl>
);

const StartTest = ({ token, invitation }: { token: string; invitation: InvitationPublic }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useSession();
  const [agreed, setAgreed] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string>();
  const isStarted = invitation.status === 'accepted' && invitation.attempt_id !== null;

  const open = (attemptId: number) => {
    saveAttempt({
      testId: invitation.test_id,
      title: invitation.test_title,
      attemptId,
    });
    navigate(`/tests/${invitation.test_id}/attempt`);
  };

  const start = async () => {
    setIsStarting(true);
    setError(undefined);
    try {
      const accepted = await invitationsApi.accept(token);
      if (accepted.attempt_id === null) throw new Error('The test could not be started.');
      open(accepted.attempt_id);
    } catch (startError) {
      setError(describeError(startError));
      setIsStarting(false);
    }
  };

  if (!session) {
    return (
      <div className="flex flex-wrap gap-3">
        <Link to="/sign-in" state={{ from: location }} className={`${PRIMARY_ACTION} w-fit`}>
          Sign in to continue
        </Link>
        <Link to="/sign-up" className={`${SECONDARY_ACTION} w-fit`}>
          Create an account
        </Link>
      </div>
    );
  }

  if (isStarted && invitation.attempt_id !== null) {
    const attemptId = invitation.attempt_id;
    return (
      <Button fullWidth={false} className="self-start" onClick={() => open(attemptId)}>
        Continue the test
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert variant="error">{error}</Alert>}
      <Button
        fullWidth={false}
        className="self-start"
        disabled={!agreed}
        isLoading={isStarting}
        onClick={start}
      >
        Agree and start the test
      </Button>
      <Checkbox
        label={`I agree to share this result with ${invitation.invited_by}`}
        checked={agreed}
        onChange={(event) => setAgreed(event.target.checked)}
      />
    </div>
  );
};

const InvitationDetails = ({ token }: { token: string }) => {
  const load = useCallback(() => invitationsApi.open(token), [token]);
  const { state } = useRequest(load);

  if (state.status === 'loading') {
    return <PageLoader title="Checking your invitation" className="flex-1" />;
  }

  if (state.status === 'error') return <InvalidLink />;

  const invitation = state.data;
  if (invitation.status === 'expired' || invitation.status === 'revoked') return <InvalidLink />;

  const title = `${invitation.invited_by} has asked you to take a test`;

  if (invitation.status === 'completed') {
    return (
      <Frame title={title}>
        <Details invitation={invitation} />
        <p className="text-[15px] text-slate-700">
          You have finished this test. {invitation.invited_by} has your result.
        </p>
      </Frame>
    );
  }

  return (
    <Frame title={title}>
      <p className="text-[15px] text-slate-600">Hello {invitation.full_name}.</p>
      {invitation.message && (
        <blockquote className="border-l-4 border-indigo-200 pl-4 text-[15px] text-slate-700 italic">
          {invitation.message}
        </blockquote>
      )}
      <Details invitation={invitation} />
      <section className="flex flex-col gap-2 rounded-2xl bg-indigo-50 p-5 text-[14px] leading-[1.6] text-slate-700">
        <h2 className="text-[16px] font-semibold text-slate-900">What you are agreeing to</h2>
        <p>
          {invitation.invited_by} will see your score, level, strengths and weaknesses for this test
          only. They will not see your other results or your answers. You can take back access later
          in your privacy settings.
        </p>
      </section>
      <StartTest token={token} invitation={invitation} />
    </Frame>
  );
};

export const Invitation = () => {
  const { token } = useParams();

  if (!token) return <Navigate to="/page-not-found" replace />;

  return <InvitationDetails key={token} token={token} />;
};
