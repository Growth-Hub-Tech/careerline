import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ApiError } from '../../../services/api';
import { submitAssessment } from '../api';
import { questions } from '../data/questions';
import type { AssessmentPhase, CareerPath } from '../types';
import { Intake } from './Intake';
import { Processing } from './Processing';
import { Recommendations } from './Recommendations';

const resolveError = (error: unknown): { heading: string; body: string; detail: string | null } => {
  if (error instanceof ApiError) {
    if (error.status >= 500) {
      return {
        heading: 'The AI service is temporarily unavailable',
        body: 'Our backend could not reach the AI provider right now. Please wait a moment and try again.',
        detail: `${error.status} ${error.detail ?? ''}`.trim(),
      };
    }
    if (error.status === 422) {
      return {
        heading: 'Invalid submission',
        body: 'Some of your answers could not be processed. Please go back and review your responses.',
        detail: `${error.status} ${error.detail ?? ''}`.trim(),
      };
    }
    if (error.status === 429) {
      return {
        heading: 'Too many requests',
        body: 'The service is busy right now. Please wait a moment and try again.',
        detail: `${error.status} ${error.detail ?? ''}`.trim(),
      };
    }
    return {
      heading: 'Something went wrong',
      body: "We couldn't generate your recommendations. Please try again.",
      detail: `${error.status} ${error.detail ?? ''}`.trim(),
    };
  }

  return {
    heading: 'Something went wrong',
    body: "We couldn't generate your recommendations. Please check your connection and try again.",
    detail: error instanceof Error ? error.message : null,
  };
};

export const Assessment = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<AssessmentPhase>('questions');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [startAt, setStartAt] = useState(0);
  const [submitError, setSubmitError] = useState<unknown>(null);

  const { mutate } = useMutation({
    mutationFn: submitAssessment,
    onMutate: () => setPhase('processing'),
    onSuccess: (result) => {
      setPaths(result);
      setPhase('results');
    },
    onError: (error) => {
      console.error('[Assessment] submission failed:', error);
      setSubmitError(error);
      setPhase('error');
    },
  });

  if (phase === 'processing') return <Processing />;

  if (phase === 'results') {
    return (
      <Recommendations
        paths={paths}
        onStartLearning={(path) => navigate('/beginner/programme', { state: { path } })}
        onDownloadReport={() => undefined}
      />
    );
  }

  if (phase === 'error') {
    const { heading, body, detail } = resolveError(submitError);

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center">
        <h1 className="text-2xl font-bold text-[#1f2a44]">{heading}</h1>
        <p className="max-w-105 text-sm text-[#6b7280]">{body}</p>
        {detail && (
          <p className="max-w-105 font-mono text-xs text-[#6b7280] opacity-60">{detail}</p>
        )}
        <button
          type="button"
          onClick={() => {
            setSubmitError(null);
            setStartAt(questions.length - 1);
            setPhase('questions');
          }}
          className="h-11 w-50 rounded-lg bg-[#D99A1B] text-sm font-bold text-white transition-colors hover:bg-[#c48b16]"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <Intake
      answers={answers}
      startAt={startAt}
      onAnswer={(id, option) => setAnswers((prev) => ({ ...prev, [id]: option }))}
      onComplete={() => mutate(answers)}
    />
  );
};
