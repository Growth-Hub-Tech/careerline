import { useCallback, useId, useState, type ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FlowHeader } from '../components/FlowHeader';
import { PageLoader } from '../components/Loader';
import { beginnerApi, programmesApi } from '../lib/api';
import { ApiError } from '../lib/api/ApiError';
import { describeError } from '../lib/api/describeError';
import { formatMoney } from '../lib/format';
import { useRequest } from '../lib/hooks/useRequest';

const MODES: Record<string, string> = {
  online: 'Online',
  in_person: 'In person',
  hybrid: 'Hybrid',
};

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
  const headingId = useId();
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
  const isPartner = programme.provider_type === 'partner';
  const weeks = `${programme.duration_weeks} ${programme.duration_weeks === 1 ? 'week' : 'weeks'}`;
  const facts = [
    programme.provider,
    MODES[programme.mode] ?? programme.mode,
    weeks,
    formatMoney(programme.price),
  ].join(' · ');

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
          <section
            aria-labelledby={headingId}
            className="flex flex-col gap-4 rounded-xl bg-gray-100 p-8"
          >
            <p className="text-[12px] font-semibold tracking-wide text-teal-700 uppercase">
              {isPartner ? 'Partner programme' : 'Recommended programme'}
            </p>
            <h2 id={headingId} className="text-[24px] leading-[1.3] font-bold text-slate-800">
              {programme.name}
            </h2>
            <p className="max-w-[60ch] text-[15px] leading-[1.55] text-slate-600">
              {programme.summary}
            </p>
            <p className="text-[14px] font-medium text-slate-700">{facts}</p>
            {isPartner && (
              <p className="max-w-[60ch] text-[13px] text-slate-600">
                This is a partner programme. CareerLine may earn a referral fee if you enrol.
              </p>
            )}
            {clickError && <Alert variant="error">{clickError}</Alert>}
            <div className="pt-4">
              <Button variant="deep" fullWidth={false} isLoading={isOpening} onClick={open}>
                View programme details
              </Button>
            </div>
          </section>

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
