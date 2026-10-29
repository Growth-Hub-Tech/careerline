import { createCatalogApi } from './catalog';
import { createApiClient } from './client';

const setup = (pages: unknown[]) => {
  const fetcher = vi.fn<typeof fetch>();
  pages.forEach((body) =>
    fetcher.mockResolvedValueOnce(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    ),
  );
  const client = createApiClient({
    baseUrl: 'https://api.example.test/api/v1',
    getToken: () => 'token-123',
    fetcher,
  });

  return { fetcher, api: createCatalogApi(client) };
};

const urls = (fetcher: ReturnType<typeof setup>['fetcher']) =>
  fetcher.mock.calls.map(([input]) => String(input));

describe('catalog api', () => {
  it('collects every skill across pages', async () => {
    const { fetcher, api } = setup([
      {
        success: true,
        data: { skills: [{ skill_id: 1 }, { skill_id: 2 }], total: 3, limit: 2, offset: 0 },
      },
      { success: true, data: { skills: [{ skill_id: 3 }], total: 3, limit: 2, offset: 2 } },
    ]);

    const skills = await api.listSkills();

    expect(skills.map((skill) => skill.skill_id)).toEqual([1, 2, 3]);
    expect(urls(fetcher)).toEqual([
      'https://api.example.test/api/v1/skills/?limit=50&offset=0',
      'https://api.example.test/api/v1/skills/?limit=50&offset=2',
    ]);
  });

  it('collects every test across pages', async () => {
    const { fetcher, api } = setup([
      { success: true, data: { items: [{ test_id: 201 }], total: 1, limit: 50, offset: 0 } },
    ]);

    const tests = await api.listTests();

    expect(tests).toEqual([{ test_id: 201 }]);
    expect(urls(fetcher)).toEqual(['https://api.example.test/api/v1/tests?limit=50&offset=0']);
  });
});
