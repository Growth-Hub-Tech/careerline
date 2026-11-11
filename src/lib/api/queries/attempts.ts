import { queryOptions, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { waitForReport } from '../../tests/report';
import { apiGet, apiPatch, apiPost } from '..';
import { fetchAll } from '../fetchAll';
import { queryKeys } from '../queryKeys';
import { API_ROUTES } from '../routes';
import type {
  AnswerRequest,
  AttemptReview,
  AttemptState,
  ResultDetail,
  ResultPage,
  ResultReport,
} from '../types';

const PAGE_SIZE = 50;

export const attemptQueries = {
  // The attempt as it stands: the question being asked, or how it ended
  attempt: (attemptId: number) =>
    queryOptions({
      queryKey: queryKeys.attempts.attempt(attemptId),
      queryFn: ({ signal }) =>
        apiGet<AttemptState>(API_ROUTES.attempts.question(attemptId), { signal }),
    }),

  review: (attemptId: number) =>
    queryOptions({
      queryKey: queryKeys.attempts.review(attemptId),
      queryFn: ({ signal }) =>
        apiGet<AttemptReview>(API_ROUTES.attempts.review(attemptId), { signal }),
    }),
};

export const resultQueries = {
  list: () =>
    queryOptions({
      queryKey: queryKeys.results.list,
      queryFn: ({ signal }) =>
        fetchAll((offset) =>
          apiGet<ResultPage>(API_ROUTES.results.list, {
            query: { limit: PAGE_SIZE, offset },
            signal,
          }),
        ),
    }),

  detail: (resultId: number) =>
    queryOptions({
      queryKey: queryKeys.results.detail(resultId),
      queryFn: ({ signal }) =>
        apiGet<ResultDetail>(API_ROUTES.results.detail(resultId), { signal }),
    }),

  report: (resultId: number) =>
    queryOptions({
      queryKey: queryKeys.results.report(resultId),
      queryFn: ({ signal }) =>
        apiGet<ResultReport>(API_ROUTES.results.report(resultId), { signal }),
    }),
};

// Starting spends a credit (or uses the plan), so what the user can afford changes
const refreshSpending = (client: QueryClient) =>
  Promise.all([
    client.invalidateQueries({ queryKey: queryKeys.payments.credits }),
    client.invalidateQueries({ queryKey: queryKeys.catalog.allAccess }),
  ]);

export const useStartAttempt = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (skillId: number) =>
      apiPost<AttemptState>(API_ROUTES.attempts.start, { skill_id: skillId }),
    onSuccess: (attempt) => {
      client.setQueryData(queryKeys.attempts.attempt(attempt.attempt_id), attempt);
      return refreshSpending(client);
    },
  });
};

// A finished attempt adds a result and moves the skill profile
export const useAnswer = (attemptId: number) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (answer: AnswerRequest) =>
      apiPost<AttemptState>(API_ROUTES.attempts.answer(attemptId), answer),
    onSuccess: (attempt) => {
      client.setQueryData(queryKeys.attempts.attempt(attemptId), attempt);
      if (attempt.status === 'in_progress') return undefined;
      return Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.results.list }),
        client.invalidateQueries({ queryKey: queryKeys.profile.skills }),
        client.invalidateQueries({ queryKey: queryKeys.payments.credits }),
      ]);
    },
  });
};

export const useCancelAttempt = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (attemptId: number) => apiPatch<unknown>(API_ROUTES.attempts.cancel(attemptId)),
    onSuccess: (_reply, attemptId) => {
      client.removeQueries({ queryKey: queryKeys.attempts.attempt(attemptId) });
      return client.invalidateQueries({ queryKey: queryKeys.catalog.allAccess });
    },
  });
};

// The PDF is made in the background: wait for it, and ask for it again if making it failed
export const useDownloadReport = (resultId: number) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const load = () => client.fetchQuery({ ...resultQueries.report(resultId), staleTime: 0 });
      const report = await waitForReport(load);
      if (report.status !== 'failed') return report;

      const regenerating = await apiPost<ResultReport>(API_ROUTES.results.report(resultId));
      client.setQueryData(queryKeys.results.report(resultId), regenerating);
      return waitForReport(load);
    },
  });
};
