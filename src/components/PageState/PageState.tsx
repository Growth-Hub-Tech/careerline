import { Alert } from '../Alert';
import { Button } from '../Button';
import { describeError } from '../../lib/api/describeError';

interface LoadFailedProps {
  readonly error: unknown;
  readonly onRetry: () => void;
}

export const LoadFailed = ({ error, onRetry }: LoadFailedProps) => (
  <div className="flex w-full max-w-[480px] flex-col gap-4">
    <Alert variant="error">{describeError(error)}</Alert>
    <Button fullWidth={false} onClick={onRetry}>
      Try again
    </Button>
  </div>
);
