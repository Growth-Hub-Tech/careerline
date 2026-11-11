import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { PageLoader } from '../Loader';
import { hasStatus } from '../../lib/api/ApiError';
import { describeError } from '../../lib/api/describeError';

interface LoadFailedProps {
  readonly error: unknown;
  readonly onRetry: () => void;
  readonly className?: string;
}

export const LoadFailed = ({ error, onRetry, className = '' }: LoadFailedProps) => (
  <div className={`flex w-full max-w-[480px] flex-col gap-4 ${className}`}>
    <Alert variant="error">{describeError(error)}</Alert>
    <Button fullWidth={false} onClick={onRetry}>
      Try again
    </Button>
  </div>
);

interface QueryLike<T> {
  readonly data: T | undefined;
  readonly isError: boolean;
  readonly error: unknown;
  readonly refetch: () => unknown;
}

interface QueryStateProps<T> {
  readonly query: QueryLike<T>;
  readonly loadingTitle: string;
  // Something that does not exist (404) goes to the not-found page
  readonly redirectOnNotFound?: boolean;
  readonly loaderClassName?: string;
  readonly errorClassName?: string;
  readonly children: (data: T) => ReactNode;
}

// Loading, failed with a way to try again, or the data. Data already shown stays when a later
// refresh fails.
export const QueryState = <T,>({
  query,
  loadingTitle,
  redirectOnNotFound = false,
  loaderClassName = 'flex-1',
  errorClassName,
  children,
}: QueryStateProps<T>) => {
  if (query.data !== undefined) return children(query.data);

  if (query.isError) {
    if (redirectOnNotFound && hasStatus(query.error, 404)) {
      return <Navigate to="/page-not-found" replace />;
    }
    return (
      <LoadFailed
        error={query.error}
        onRetry={() => void query.refetch()}
        className={errorClassName}
      />
    );
  }

  return <PageLoader title={loadingTitle} className={loaderClassName} />;
};
