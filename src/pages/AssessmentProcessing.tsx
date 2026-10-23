import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLoader } from '../components/Loader';

interface AssessmentProcessingProps {
  readonly delayMs?: number;
}

export const AssessmentProcessing = ({ delayMs = 2500 }: AssessmentProcessingProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(
      () => navigate('/assessment/results', { replace: true }),
      delayMs,
    );
    return () => window.clearTimeout(timer);
  }, [delayMs, navigate]);

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
