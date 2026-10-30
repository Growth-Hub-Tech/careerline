import { useCallback, useState, type ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FlowHeader } from '../components/FlowHeader';
import { PageLoader } from '../components/Loader';
import { ProgrammeCard } from '../components/ProgrammeCard';
import { beginnerApi, programmesApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { describeError } from '../lib/api/describeError';
import { loadBudget } from '../lib/beginner/budget';
import { useRequest } from '../lib/hooks/useRequest';

const openUrl = (url: string) => window.location.assign(url);

const ProgrammeFrame = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-dvh flex-col bg-white">
    <FlowHeader label="Beginner path" showBrand />
    {children}
  </div>
);

interface ProgrammeDetailsProps {
  readonly id: number;
  readonly onOpen: (url: string) => void;
}

const ProgrammeDetails = ({ id, onOpen }: ProgrammeDetailsProps) => {
  const [clickError, setClickError] = useState<string>();
  const [isOpening, setIsOpening] = useState(false);

  const load = useCallback(async () => {
    const [programme, path] = await Promise.all([
      programmesApi.get(id),
      beginnerApi.getRecommendations().catch(() => undefined),
    ]);
    return { programme, path };
  }, [id]);
  const { state, retry } = useRequest(load);
  const { state: budgetState } = useRequest(loadBudget);
  const budget = budgetState.status === 'success' ? budgetState.data : null;

  if (state.status === 'error') {
    if (state.error instanceof ApiError && state.error.status === 404) {
      return <Navigate to="/page-not-found" replace />;
    }

    return (
      <ProgrammeFrame>
        <main className="flex flex-1 items-center justify-center px-5">
          <div className="flex w-full max-w-[480px] flex-col gap-4">
            <Alert variant="error">{describeError(state.error)}</Alert>
            <Button fullWidth={false} onClick={retry}>
              Try again
            </Button>
          </div>
        </main>
      </ProgrammeFrame>
    );
  }

  if (state.status === 'loading') {
    return (
      <ProgrammeFrame>
        <PageLoader title="Loading the programme" className="flex-1" />
      </ProgrammeFrame>
    );
  }

  const { programme, path } = state.data;
  const recommendation = path?.recommendations.find(
    (item) => item.programme?.programme_id === programme.programme_id,
  );

  const open = async () => {
    setClickError(undefined);
    setIsOpening(true);

    try {
      const click = await programmesApi.recordClick(programme.programme_id, {
        source: 'beginner_path',
      });
      onOpen(click.redirect_url);
    } catch (error) {
      setClickError(describeError(error));
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <ProgrammeFrame>
      <main className="w-full max-w-[1200px] px-5 py-10 sm:px-10 lg:px-20">
        <h1 className="text-[32px] leading-[1.2] font-bold text-slate-800">
          {recommendation?.title ?? programme.name}
        </h1>
        {recommendation && (
          <p className="mt-3 text-[15px] text-slate-600">
            Your {recommendation.rank === 1 ? 'top ' : ''}recommended path, based on a{' '}
            {recommendation.match_score}% match with your assessment answers.
          </p>
        )}

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.75fr_1fr]">
          <ProgrammeCard programme={programme} budget={budget} headingLevel={2}>
            <p className="max-w-[60ch] text-[15px] leading-[1.55] text-slate-600">
              {programme.summary}
            </p>
            {clickError && <Alert variant="error">{clickError}</Alert>}
            <div className="pt-4">
              <Button variant="deep" fullWidth={false} isLoading={isOpening} onClick={open}>
                View programme details
              </Button>
            </div>
          </ProgrammeCard>

          {recommendation && recommendation.reasons.length > 0 && (
            <Card title="Why this programme" headingLevel={2} className="p-6">
              <ul className="flex flex-col gap-6 text-[13px] leading-[1.5] text-slate-600">
                {recommendation.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </main>
    </ProgrammeFrame>
  );
};

interface ProgrammeProps {
  readonly onOpen?: (url: string) => void;
}

export const Programme = ({ onOpen = openUrl }: ProgrammeProps) => {
  const { programmeId } = useParams();
  const id = Number(programmeId);

  if (!Number.isInteger(id) || id <= 0) {
    return <Navigate to="/page-not-found" replace />;
  }

  return <ProgrammeDetails key={id} id={id} onOpen={onOpen} />;
};
