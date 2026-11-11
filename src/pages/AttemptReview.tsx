import { useId } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, Navigate, useParams } from 'react-router-dom';
import { LuCheck, LuX } from 'react-icons/lu';
import { PageLoader } from '../components/Loader';
import { LoadFailed } from '../components/PageState';
import { StatusLabel } from '../components/StatusLabel';
import type { ReviewItem } from '../lib/api';
import { hasStatus } from '../lib/api/ApiError';
import { attemptQueries } from '../lib/api/queries';

// Fuller explanations are written in the background: ask every 3 seconds until they are there.
// If asking fails, the short explanations stay.
const POLL_INTERVAL = 3000;

const Question = ({ item }: { item: ReviewItem }) => {
  const headingId = useId();

  return (
    <article
      aria-labelledby={headingId}
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 id={headingId} className="max-w-[60ch] text-[18px] font-semibold text-slate-900">
          Question {item.position}: {item.question_text}
        </h2>
        <StatusLabel status={item.is_correct ? 'success' : 'error'}>
          {item.is_correct ? 'Right' : 'Wrong'}
        </StatusLabel>
      </div>
      <p className="text-[13px] text-slate-500">{item.subskill_name}</p>
      <ul className="flex flex-col gap-2">
        {item.options.map((option) => (
          <li
            key={option.option_id}
            className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3 text-[15px] ${
              option.is_correct
                ? 'border-teal-600 bg-teal-50'
                : option.chosen
                  ? 'border-red-300 bg-red-50'
                  : 'border-slate-200'
            }`}
          >
            <span className="text-slate-800">{option.option_text}</span>
            <span className="flex gap-3 text-[13px] font-medium">
              {option.chosen && (
                <span className="inline-flex items-center gap-1 text-slate-700">
                  {!option.is_correct && <LuX size={14} aria-hidden="true" />}
                  Your answer
                </span>
              )}
              {option.is_correct && (
                <span className="inline-flex items-center gap-1 text-teal-800">
                  <LuCheck size={14} aria-hidden="true" />
                  Right answer
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {item.selected_option_id === null && (
        <p className="text-[14px] text-slate-600">Not answered before the time ran out.</p>
      )}
      <div className="flex flex-col gap-1 rounded-lg bg-gray-50 px-4 py-3">
        <p className="text-[15px] leading-[1.6] text-slate-700">{item.explanation}</p>
        {item.explanation_source === 'ai' && (
          <p className="text-[12px] text-slate-500">Explained by CareerLine AI</p>
        )}
      </div>
    </article>
  );
};

const ReviewDetails = ({ attemptId }: { attemptId: number }) => {
  const query = useQuery({
    ...attemptQueries.review(attemptId),
    refetchInterval: ({ state }) =>
      state.status !== 'error' && state.data?.ai_explanations === 'generating'
        ? POLL_INTERVAL
        : false,
  });
  const review = query.data;
  const isWriting = review?.ai_explanations === 'generating' && !query.isError;

  if (!review) {
    if (!query.isError) return <PageLoader title="Loading your answers" className="flex-1" />;
    if (hasStatus(query.error, 404)) return <Navigate to="/page-not-found" replace />;
    if (hasStatus(query.error, 409)) {
      return (
        <p className="text-[15px] text-slate-600">
          You can review your answers once the test is finished.
        </p>
      );
    }
    return <LoadFailed error={query.error} onRetry={() => void query.refetch()} />;
  }

  const { items } = review;
  const right = items.filter((item) => item.is_correct).length;

  return (
    <>
      <p className="text-[16px] font-medium text-slate-800">
        {right} of {items.length} right
      </p>
      {isWriting && (
        <p role="status" className="text-[14px] text-slate-600">
          Writing fuller explanations. They appear here in a few seconds.
        </p>
      )}
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <Question key={item.question_id} item={item} />
        ))}
      </div>
    </>
  );
};

export const AttemptReview = () => {
  const { attemptId } = useParams();
  const id = Number(attemptId);

  if (!Number.isInteger(id) || id <= 0) {
    return <Navigate to="/page-not-found" replace />;
  }

  return (
    <div className="flex w-full max-w-[900px] flex-col gap-6 px-5 py-10 sm:px-20">
      <Link
        to="/reports"
        className="w-fit text-[14px] font-medium text-indigo-700 underline hover:text-indigo-900"
      >
        Back to reports
      </Link>
      <h1 className="text-[32px] leading-[1.25] font-bold text-slate-700">Review your answers</h1>
      <ReviewDetails key={id} attemptId={id} />
    </div>
  );
};
