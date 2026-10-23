import { Button } from '../Button';
import { ErrorPage, SECONDARY_ACTION } from '../ErrorPage';

interface ErrorScreenProps {
  readonly onRetry?: () => void;
}

export const ErrorScreen = ({ onRetry }: ErrorScreenProps) => (
  <ErrorPage
    fullScreen
    code="500"
    title="Something went wrong"
    description="An unexpected error stopped this page from loading. Try again, or head back to the homepage."
  >
    {onRetry && (
      <Button fullWidth={false} onClick={onRetry}>
        Try again
      </Button>
    )}
    <a href="/" className={SECONDARY_ACTION}>
      Go to homepage
    </a>
  </ErrorPage>
);
