import type { createApiClient } from './client';
import { fetchAll } from './fetchAll';
import type { ResultDetail, ResultPage, ResultReport } from './types';

type Client = ReturnType<typeof createApiClient>;

const PAGE_SIZE = 50;

export const createResultsApi = (client: Client) => ({
  list: () =>
    fetchAll((offset) =>
      client.get<ResultPage>('/results', { query: { limit: PAGE_SIZE, offset } }),
    ),

  get: (resultId: number) => client.get<ResultDetail>(`/results/${resultId}`),

  getReport: (resultId: number) => client.get<ResultReport>(`/results/${resultId}/report`),

  regenerateReport: (resultId: number) => client.post<ResultReport>(`/results/${resultId}/report`),
});
