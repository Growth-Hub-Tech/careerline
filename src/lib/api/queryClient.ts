import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './ApiError';

const MINUTE = 60_000;

// How long a reply counts as fresh before a page that shows it asks again
export const STALE_TIME = {
  default: 30_000,
  // The signed-in account and its organisation change rarely and mutations update them
  record: 5 * MINUTE,
  // Catalogues: plans, credit packs, tests, skills, roles, the questionnaire
  reference: 10 * MINUTE,
} as const;

const MAX_RETRIES = 1;

// Only a dropped connection or a server error is worth one more try; a 4xx will not change
export const shouldRetry = (failureCount: number, error: unknown) =>
  failureCount < MAX_RETRIES &&
  error instanceof ApiError &&
  (error.isNetwork || error.status >= 500);

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME.default,
      // A test in progress or a half-filled form must not reload when the tab regains focus
      refetchOnWindowFocus: false,
      retry: shouldRetry,
    },
    mutations: {
      retry: false,
    },
  },
});
