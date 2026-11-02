import { useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { PageLoader } from '../components/Loader';
import { ProgrammeCard } from '../components/ProgrammeCard';
import { ProgressBar } from '../components/ProgressBar';
import { beginnerApi, type BeginnerPath } from '../lib/api';
import { describeError } from '../lib/api/describeError';
import { loadBudget } from '../lib/beginner/budget';
import { useRequest } from '../lib/hooks/useRequest';

const MAX_PATHS = 3;

const VIEW_LINK =
  'inline-flex h-11 w-fit items-center justify-center rounded-lg border border-indigo-800 bg-white px-5 text-[15px] font-medium text-indigo-800 transition-colors hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600';

export const AssessmentResults = () => {
  const { state: budgetState } = useRequest(loadBudget);
  const budget = budgetState.status === 'success' ? budgetState.data : null;
  const location = useLocation() as { state: { path?: BeginnerPath } | null };
  const saved = location.state?.path;

  const load = useCallback(
    () => (saved ? Promise.resolve(saved) : beginnerApi.getRecommendations()),
    [saved],
  );
  const { state, retry } = useRequest(load);

  const path = saved ?? (state.status === 'success' ? state.data : undefined);

  if (!path) {
    if (state.status === 'error') {
      return (
        <main className="flex min-h-dvh items-center justify-center bg-white px-5">
          <div className="flex w-full max-w-[480px] flex-col gap-4">
            <Alert variant="error">{describeError(state.error)}</Alert>
            <Button fullWidth={false} onClick={retry}>
              Try again
            </Button>
          </div>
        </main>
      );
    }

    return (
      <main className="bg-white">
        <PageLoader fullScreen title="Loading your results" />
      </main>
    );
  }

  const matches = path.recommendations.slice(0, MAX_PATHS);
  const programmeId = matches[0]?.programme?.programme_id;

  return (
    <main className="flex min-h-dvh flex-col items-center bg-white px-5 py-12 sm:px-8 sm:py-16">
      <div className="flex w-full max-w-[1120px] flex-col gap-10">
        <header className="flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-[24ch] text-[30px] leading-[1.3] font-bold text-slate-950 sm:text-[36px]">
            Congratulations... You have successfully completed your test
          </h1>
          <div className="flex flex-col gap-2">
            <h2 className="text-[24px] leading-[1.3] font-bold text-slate-700 sm:text-[28px]">
              Here are your top {matches.length} recommended career paths
            </h2>
            <p className="text-[14px] text-slate-600">
              These paths are ranked based on your personality, your goals, your available time, and
              your financial capacity.
            </p>
          </div>
        </header>

        <ol aria-label="Recommended career paths" className="flex flex-col gap-4">
          {matches.map((match, index) => {
            const isTop = index === 0;

            return (
              <li
                key={match.role_id}
                data-top={isTop}
                className={`flex flex-col gap-3 rounded-lg border p-5 sm:px-6 ${
                  isTop ? 'border-indigo-800 bg-indigo-50' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-[20px] font-bold text-slate-800">{match.title}</h3>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-semibold ${
                      isTop ? 'bg-amber-500 text-slate-950' : 'bg-gray-100 text-slate-700'
                    }`}
                  >
                    {match.match_score}% match
                  </span>
                </div>
                {match.reasons.map((reason) => (
                  <p key={reason} className="text-[14px] leading-[1.55] text-slate-600">
                    {reason}
                  </p>
                ))}
                <ProgressBar
                  label={match.title}
                  value={match.match_score}
                  variant="teal"
                  size="sm"
                  hideLabel
                  className="max-w-[810px]"
                />
                <ProgrammeCard
                  programme={match.programme}
                  budget={budget}
                  headingLevel={4}
                  className="mt-2"
                >
                  {match.programme && (
                    <Link to={`/programmes/${match.programme.programme_id}`} className={VIEW_LINK}>
                      View programme
                    </Link>
                  )}
                </ProgrammeCard>
              </li>
            );
          })}
        </ol>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-10">
          <Button
            variant="deep"
            fullWidth={false}
            className="min-w-[260px]"
            onClick={() => window.print()}
          >
            Download PDF Report
          </Button>
          {programmeId !== undefined && (
            <Link
              to={`/programmes/${programmeId}`}
              className="inline-flex h-12 min-w-[240px] items-center justify-center rounded-lg bg-amber-500 px-6 text-[16px] font-medium text-slate-950 transition-colors hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Start Learning
            </Link>
          )}
        </div>
      </div>
    </main>
  );
};
