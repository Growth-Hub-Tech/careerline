import { useCallback, useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { PageLoader } from '../components/Loader';
import { beginnerApi, type BeginnerPath, type IntakeSubmission } from '../lib/api';
import { describeError } from '../lib/api/describeError';
import { useRequest } from '../lib/hooks/useRequest';

const inflight = new WeakMap<IntakeSubmission, Promise<BeginnerPath>>();

const submitOnce = (submission: IntakeSubmission) => {
  let request = inflight.get(submission);

  if (!request) {
    request = beginnerApi.submitIntake(submission);
    inflight.set(submission, request);
    request.catch(() => inflight.delete(submission));
  }

  return request;
};

export const AssessmentProcessing = () => {
  const navigate = useNavigate();
  const location = useLocation() as { state: { submission?: IntakeSubmission } | null };
  const submission = location.state?.submission;

  const submit = useCallback(
    () => (submission ? submitOnce(submission) : Promise.reject(new Error('No answers to send'))),
    [submission],
  );
  const { state, retry } = useRequest(submit);

  useEffect(() => {
    if (state.status === 'success') {
      navigate('/assessment/results', { replace: true, state: { path: state.data } });
    }
  }, [state, navigate]);

  if (!submission) {
    return <Navigate to="/assessment" replace />;
  }

  if (state.status === 'error') {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-indigo-600 px-5">
        <div className="flex w-full max-w-[480px] flex-col gap-4 rounded-xl bg-white p-6">
          <Alert variant="error">{describeError(state.error)}</Alert>
          <Button fullWidth={false} onClick={retry}>
            Try again
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <PageLoader
        variant="brand"
        fullScreen
        title="Matching your answers to real career paths."
        description="This usually takes a few seconds. CareerLine AI is comparing your responses against the profiles of people who have thrived on each path."
      />
    </main>
  );
};
