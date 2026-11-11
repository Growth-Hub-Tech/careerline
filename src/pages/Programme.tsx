import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, useParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FlowHeader } from '../components/FlowHeader';
import { PageLoader } from '../components/Loader';
import { ProgrammeCard } from '../components/ProgrammeCard';
import { LoadFailed } from '../components/PageState';
import { hasStatus } from '../lib/api/ApiError';
import { describeError } from '../lib/api/describeError';
import {
  beginnerQueries,
  profileQueries,
  programmeQueries,
  selectBudget,
  useRecordProgrammeClick,
} from '../lib/api/queries';

const ProgrammeFrame = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-dvh flex-col bg-white">
    <FlowHeader label="Beginner path" showBrand />
    {children}
  </div>
);

// The programme with, when the questionnaire has been answered, why it was recommended
const ProgrammeDetails = ({ id }: { id: number }) => {
  const recordClick = useRecordProgrammeClick();
  const query = useQuery(programmeQueries.detail(id));
  const recommendations = useQuery(beginnerQueries.recommendations());
  const { data: budget = null } = useQuery({ ...profileQueries.detail(), select: selectBudget });
  const programme = query.data;

  if (!programme && query.isError) {
    if (hasStatus(query.error, 404)) return <Navigate to="/page-not-found" replace />;

    return (
      <ProgrammeFrame>
        <main className="flex flex-1 items-center justify-center px-5">
          <LoadFailed error={query.error} onRetry={() => void query.refetch()} />
        </main>
      </ProgrammeFrame>
    );
  }

  if (!programme || recommendations.isPending) {
    return (
      <ProgrammeFrame>
        <PageLoader title="Loading the programme" className="flex-1" />
      </ProgrammeFrame>
    );
  }

  const path = recommendations.data;
  const recommendation = path?.recommendations.find(
    (item) => item.programme?.programme_id === programme.programme_id,
  );

  const open = () =>
    recordClick.mutate(
      { programmeId: programme.programme_id, click: { source: 'beginner_path' } },
      { onSuccess: (click) => window.location.assign(click.redirect_url) },
    );

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
            {recordClick.isError && (
              <Alert variant="error">{describeError(recordClick.error)}</Alert>
            )}
            <div className="pt-4">
              <Button
                variant="deep"
                fullWidth={false}
                isLoading={recordClick.isPending || recordClick.isSuccess}
                onClick={open}
              >
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

export const Programme = () => {
  const { programmeId } = useParams();
  const id = Number(programmeId);

  if (!Number.isInteger(id) || id <= 0) {
    return <Navigate to="/page-not-found" replace />;
  }

  return <ProgrammeDetails key={id} id={id} />;
};
