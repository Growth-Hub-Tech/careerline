import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { QuestionFlow, Loading, Recommendation } from '../components';
import { BodyText, HeadingText, SmallText } from '../components';
import { apiService, ApiError } from '../services/api';
import { mapAnswers } from '../utils/mapAnswers';
import type { RecommendationItem } from '../types/api';
import { Button } from '../components/Button';

type QuestionPageState = 'question' | 'loading' | 'recommendation' | 'error';

function resolveErrorMessage(error: unknown): { heading: string; body: string } {
  if (error instanceof ApiError) {
    if (error.status >= 500) {
      return {
        heading: 'The AI service is temporarily unavailable',
        body: 'Our backend could not reach the AI provider right now. This is usually a temporary issue — please wait a moment and try again.',
      };
    }
    if (error.status === 422) {
      return {
        heading: 'Invalid submission',
        body: 'Some of your answers could not be processed. Please go back and review your responses.',
      };
    }
    if (error.status === 429) {
      return {
        heading: 'Too many requests',
        body: 'The service is busy right now. Please wait a moment and try again.',
      };
    }
  }
  return {
    heading: 'Something went wrong',
    body: "We couldn't generate your recommendations. Please check your connection and try again.",
  };
}

interface ErrorStateProps {
  error: unknown;
  onRetry: () => void;
}

const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  const { heading, body } = resolveErrorMessage(error);
  const detail = error instanceof ApiError ? error.detail : null;

  return (
    <div className="d-flex items-center justify-center" style={{ minHeight: '100vh' }}>
      <div
        className="d-flex flex-column items-center gap-6 text-center"
        style={{ maxWidth: '480px', padding: '24px' }}
      >
        <HeadingText weight="semibold">{heading}</HeadingText>
        <BodyText>{body}</BodyText>
        {detail && (
          <SmallText variant="secondary" style={{ opacity: 0.6, fontFamily: 'monospace' }}>
            {detail}
          </SmallText>
        )}
        <div style={{ width: '200px' }}>
          <Button variant="primary" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
};

export const Question = () => {
  const [pageState, setPageState] = useState<QuestionPageState>('question');
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [recommendationId, setRecommendationId] = useState('');
  const [submitError, setSubmitError] = useState<unknown>(null);

  const { mutate: submitOnboarding } = useMutation({
    mutationFn: (answers: Record<string, string>) => {
      const payload = mapAnswers(answers);
      console.log('[Question] Mapped onboard payload:', payload);
      return apiService.submitOnboarding(payload);
    },
    onMutate: () => {
      console.log('[Question] Submitting onboarding answers to API…');
      setPageState('loading');
    },
    onSuccess: (response) => {
      console.log('[Question] Onboard response received:', response);
      setRecommendations(response.recommendations);
      setRecommendationId(response.recommendation_id);
      setPageState('recommendation');
    },
    onError: (error) => {
      console.error('[Question] Onboard submission failed:', error);
      setSubmitError(error);
      setPageState('error');
    },
  });

  if (pageState === 'error') {
    return (
      <ErrorState
        error={submitError}
        onRetry={() => {
          setSubmitError(null);
          setPageState('question');
        }}
      />
    );
  }

  return (
    <>
      {pageState === 'question' && (
        <QuestionFlow onComplete={(answers) => submitOnboarding(answers)} />
      )}
      {pageState === 'loading' && <Loading />}
      {pageState === 'recommendation' && (
        <Recommendation items={recommendations} recommendationId={recommendationId} />
      )}
    </>
  );
};
