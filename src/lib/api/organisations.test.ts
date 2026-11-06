import { createApiClient } from './client';
import { createOrganisationsApi, createRolesApi } from './organisations';

const reply = (data: unknown) =>
  new Response(JSON.stringify({ success: true, data }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

const EMPTY_PAGE = { items: [], total: 0, limit: 50, offset: 0 };

const setup = (...bodies: unknown[]) => {
  const fetcher = vi.fn<typeof fetch>();
  bodies.forEach((body) => fetcher.mockResolvedValueOnce(reply(body)));
  const client = createApiClient({
    baseUrl: 'https://api.example.test/api/v1',
    getToken: () => 'token-123',
    fetcher,
  });

  return { fetcher, organisations: createOrganisationsApi(client), roles: createRolesApi(client) };
};

const calls = (fetcher: ReturnType<typeof setup>['fetcher']) =>
  fetcher.mock.calls.map(([input, init]) => `${init?.method ?? 'GET'} ${String(input)}`);

const bodyOf = (fetcher: ReturnType<typeof setup>['fetcher'], index: number) =>
  JSON.parse(String(fetcher.mock.calls[index][1]?.body)) as unknown;

describe('organisations api', () => {
  it('reads the organisation, its team and its audits', async () => {
    const { fetcher, organisations } = setup({ organisation_id: 41 }, EMPTY_PAGE, EMPTY_PAGE, {
      audit_id: 3,
    });

    await organisations.me();
    await organisations.listMembers(41);
    await organisations.listAudits(41);
    await organisations.getAudit(41, 3);

    expect(calls(fetcher)).toEqual([
      'GET https://api.example.test/api/v1/organisations/me',
      'GET https://api.example.test/api/v1/organisations/41/members?limit=50&offset=0',
      'GET https://api.example.test/api/v1/organisations/41/audits?limit=50&offset=0',
      'GET https://api.example.test/api/v1/organisations/41/audits/3',
    ]);
  });

  it('uploads the staff list and starts an audit', async () => {
    const { fetcher, organisations } = setup({ added: 1 }, { audit_id: 3 });
    const member = { full_name: 'Ada Obi', email: 'ada@example.com', department: null, role_id: 1 };

    await organisations.uploadRoster(41, [member]);
    await organisations.startAudit(41, { name: 'Q4', role_ids: [1], send_invitations: true });

    expect(calls(fetcher)).toEqual([
      'POST https://api.example.test/api/v1/organisations/41/members',
      'POST https://api.example.test/api/v1/organisations/41/audits',
    ]);
    expect(bodyOf(fetcher, 0)).toEqual({ members: [member] });
    expect(bodyOf(fetcher, 1)).toEqual({ name: 'Q4', role_ids: [1], send_invitations: true });
  });

  it('reads the heatmap for a grouping and an audit', async () => {
    const { fetcher, organisations } = setup({ rows: [] }, { rows: [] });

    await organisations.heatmap(41, 'member', 3);
    await organisations.heatmap(41, 'department');

    expect(calls(fetcher)).toEqual([
      'GET https://api.example.test/api/v1/organisations/41/heatmap?group_by=member&audit_id=3',
      'GET https://api.example.test/api/v1/organisations/41/heatmap?group_by=department',
    ]);
  });

  it('reads and replaces the targets', async () => {
    const { fetcher, organisations } = setup({ items: [] }, { items: [] });
    const target = { role_id: 1, skill_id: 2, target_level: 'MID' as const, due_date: null };

    await organisations.getTargets(41);
    await organisations.setTargets(41, [target]);

    expect(calls(fetcher)).toEqual([
      'GET https://api.example.test/api/v1/organisations/41/targets',
      'PUT https://api.example.test/api/v1/organisations/41/targets',
    ]);
    expect(bodyOf(fetcher, 1)).toEqual({ items: [target] });
  });
});

describe('organisation users', () => {
  it('lists, adds, changes and removes users', async () => {
    const { fetcher, organisations } = setup(
      { items: [], total: 0 },
      { learner_id: 5 },
      { learner_id: 5 },
      { status: 'accepted' },
    );

    await organisations.listUsers(41);
    await organisations.addUser(41, 'ada@kora.example', 'admin');
    await organisations.changeRole(41, 5, 'recruiter');
    await organisations.removeUser(41, 5);

    expect(calls(fetcher)).toEqual([
      'GET https://api.example.test/api/v1/organisations/41/users',
      'POST https://api.example.test/api/v1/organisations/41/users',
      'PATCH https://api.example.test/api/v1/organisations/41/users/5',
      'DELETE https://api.example.test/api/v1/organisations/41/users/5',
    ]);
    expect(bodyOf(fetcher, 1)).toEqual({ email: 'ada@kora.example', role: 'admin' });
    expect(bodyOf(fetcher, 2)).toEqual({ role: 'recruiter' });
  });
});

describe('roles api', () => {
  it('lists every role', async () => {
    const { fetcher, roles } = setup({ items: [{ role_id: 1 }], total: 1, limit: 100, offset: 0 });

    expect(await roles.list()).toEqual([{ role_id: 1 }]);
    expect(calls(fetcher)).toEqual([
      'GET https://api.example.test/api/v1/roles?limit=100&offset=0',
    ]);
  });
});
