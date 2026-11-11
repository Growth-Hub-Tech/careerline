import { useNavigate } from 'react-router-dom';
import { AuthText, AuthTitle, CardAuthLayout, DashedLink } from '../components/Auth';
import { Button } from '../components/Button';

export const AssessmentStart = () => {
  const navigate = useNavigate();

  return (
    <CardAuthLayout wide>
      <AuthTitle>Start your test</AuthTitle>
      <AuthText className="mt-6">
        Your test is a series of questions about your personality, future goals, time availability
        and financial capacity.
      </AuthText>
      <AuthText className="mt-4">
        Answer honestly. Your answers decide which career paths we recommend.
      </AuthText>
      <Button variant="secondary" className="mt-8" onClick={() => navigate('/assessment')}>
        Start Test
      </Button>
      <div className="mt-6 text-center">
        <DashedLink to="/dashboard">Go to my Dashboard</DashedLink>
      </div>
    </CardAuthLayout>
  );
};
