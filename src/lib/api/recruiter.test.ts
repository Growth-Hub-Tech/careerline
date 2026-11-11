import { createApiClient } from './client';
import { createInvitationsApi, createRecruiterApi } from './recruiter';

const reply = (data: unknown) =>
  new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

const setup = (...bodies: unknown[]) => {
  const fetcher = vi.fn<typeof fetch>();
  bodies.forEach((body) => fetcher.mockResolvedValueOnce(reply(body)));
  const client = createApiClient({
    baseUrl: 'https://api.example.test/api/v1',
    fetcher,
  });

  return {
    fetcher,
    recruiter: createRecruiterApi(client),
    invitations: createInvitationsApi(client),
  };
};

const calls = (fetcher: ReturnType<typeof setup>['fetcher']) =>
  fetcher.mock.calls.map(([input, init]) => `${init?.method ?? 'GET'} ${String(input)}`);

const bodyOf = (fetcher: ReturnType<typeof setup>['fetcher'], index = 0) =>
  JSON.parse(String(fetcher.mock.calls[index][1]?.body)) as unknown;

describe('recruiter api', () => {
  it('collects every candidate across pages', async () => {
    const { fetcher, recruiter } = setup(
      { items: [{ candidate_id: 1 }], total: 2, limit: 1, offset: 0 },
      { items: [{ candidate_id: 2 }], total: 2, limit: 1, offset: 1 },
    );

    const candidates = await recruiter.listCandidates();

    expect(candidates.map((candidate) => candidate.candidate_id)).toEqual([1, 2]);
    expect(calls(fetcher)[0]).toBe(
      'GET https://api.example.test/api/v1/recruiter/candidates?limit=50&offset=0',
    );
  });

  it('adds a candidate', async () => {
    const { fetcher, recruiter } = setup({ candidate_id: 7 });

    await recruiter.addCandidate({ full_name: 'Ada Obi', email: 'ada@example.com', role_id: 3 });

    expect(calls(fetcher)).toEqual(['POST https://api.example.test/api/v1/recruiter/candidates']);
    expect(bodyOf(fetcher)).toEqual({ full_name: 'Ada Obi', email: 'ada@example.com', role_id: 3 });
  });

  it('reads a candidate and their report', async () => {
    const { fetcher, recruiter } = setup({ candidate_id: 7 }, { candidate_id: 7 });

    await recruiter.getCandidate(7);
    await recruiter.getReport(7);

    expect(calls(fetcher)).toEqual([
      'GET https://api.example.test/api/v1/recruiter/candidates/7',
      'GET https://api.example.test/api/v1/recruiter/candidates/7/report',
    ]);
  });
});

describe('invitations api', () => {
  it('sends, lists and revokes invitations', async () => {
    const { fetcher, invitations } = setup(
      { invitation_id: 4 },
      { items: [], total: 0, limit: 50, offset: 0 },
      { invitation_id: 4 },
    );

    await invitations.send({
      kind: 'candidate',
      email: 'ada@example.com',
      full_name: 'Ada Obi',
      test_id: 202,
      candidate_id: 7,
      expires_in_days: 7,
    });
    await invitations.list();
    await invitations.revoke(4);

    expect(calls(fetcher)).toEqual([
      'POST https://api.example.test/api/v1/invitations',
      'GET https://api.example.test/api/v1/invitations?limit=50&offset=0',
      'POST https://api.example.test/api/v1/invitations/4/revoke',
    ]);
    expect(bodyOf(fetcher)).toMatchObject({ test_id: 202, candidate_id: 7, expires_in_days: 7 });
  });

  it('opens an invitation and accepts it', async () => {
    const { fetcher, invitations } = setup({ token: 'a b' }, { token: 'a b' });

    await invitations.open('a b');
    await invitations.accept('a b');

    expect(calls(fetcher)).toEqual([
      'GET https://api.example.test/api/v1/invitations/token/a%20b',
      'POST https://api.example.test/api/v1/invitations/token/a%20b/accept',
    ]);
  });
});
