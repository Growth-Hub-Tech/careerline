import type { createApiClient } from './client';
import { fetchAll } from './fetchAll';
import type { AssessmentPage, SkillsPage } from './types';

type Client = ReturnType<typeof createApiClient>;

const PAGE_SIZE = 50;

export const createCatalogApi = (client: Client) => ({
  listSkills: () =>
    fetchAll(async (offset) => {
      const page = await client.get<SkillsPage>('/skills/', {
        query: { limit: PAGE_SIZE, offset },
      });
      return { items: page.skills, total: page.total };
    }),

  listTests: () =>
    fetchAll((offset) =>
      client.get<AssessmentPage>('/tests', { query: { limit: PAGE_SIZE, offset } }),
    ),
});
