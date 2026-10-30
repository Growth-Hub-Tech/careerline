import { createApiClient } from './client';
import { createResultsApi } from './results';

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

  return { fetcher, api: createResultsApi(client) };
};

const calls = (fetcher: ReturnType<typeof setup>['fetcher']) =>
  fetcher.mock.calls.map(([input, init]) => `${init?.method ?? 'GET'} ${String(input)}`);

describe('results api', () => {
  it('collects every past result across pages', async () => {
    const { fetcher, api } = setup([
      { success: true, data: { items: [{ result_id: 1 }], total: 2, limit: 1, offset: 0 } },
      { success: true, data: { items: [{ result_id: 2 }], total: 2, limit: 1, offset: 1 } },
    ]);

    const results = await api.list();

    expect(results.map((result) => result.result_id)).toEqual([1, 2]);
    expect(calls(fetcher)).toEqual([
      'GET https://api.example.test/api/v1/results?limit=50&offset=0',
      'GET https://api.example.test/api/v1/results?limit=50&offset=1',
    ]);
  });

  it('loads one result', async () => {
    const { fetcher, api } = setup([{ success: true, data: { result_id: 31 } }]);

    expect(await api.get(31)).toEqual({ result_id: 31 });
    expect(calls(fetcher)).toEqual(['GET https://api.example.test/api/v1/results/31']);
  });

  it('asks how the PDF report is doing', async () => {
    const { fetcher, api } = setup([{ success: true, data: { status: 'ready' } }]);

    expect(await api.getReport(31)).toEqual({ status: 'ready' });
    expect(calls(fetcher)).toEqual(['GET https://api.example.test/api/v1/results/31/report']);
  });

  it('asks for the PDF report to be made again', async () => {
    const { fetcher, api } = setup([{ success: true, data: { status: 'generating' } }]);

    expect(await api.regenerateReport(31)).toEqual({ status: 'generating' });
    expect(calls(fetcher)).toEqual(['POST https://api.example.test/api/v1/results/31/report']);
  });
});
