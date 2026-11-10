import type { createApiClient } from './client';
import { fetchAll } from './fetchAll';
import type {
  Audit,
  AuditCreate,
  AuditDeltas,
  AuditRetest,
  AuditPage,
  Heatmap,
  HeatmapGrouping,
  Organisation,
  OrganisationRole,
  OrganisationUser,
  OrganisationUserList,
  Role,
  RolePage,
  RosterResult,
  TargetSet,
  Targets,
  TeamMemberCreate,
  TeamMemberPage,
} from './types';

type Client = ReturnType<typeof createApiClient>;

const PAGE_SIZE = 50;

export const createOrganisationsApi = (client: Client) => ({
  me: () => client.get<Organisation>('/organisations/me'),

  listUsers: (organisationId: number) =>
    client.get<OrganisationUserList>(`/organisations/${organisationId}/users`),

  addUser: (organisationId: number, email: string, role: OrganisationRole) =>
    client.post<OrganisationUser>(`/organisations/${organisationId}/users`, {
      body: { email, role },
    }),

  changeRole: (organisationId: number, learnerId: number, role: OrganisationRole) =>
    client.patch<OrganisationUser>(`/organisations/${organisationId}/users/${learnerId}`, {
      body: { role },
    }),

  removeUser: (organisationId: number, learnerId: number) =>
    client.delete<unknown>(`/organisations/${organisationId}/users/${learnerId}`),

  listMembers: (organisationId: number) =>
    fetchAll((offset) =>
      client.get<TeamMemberPage>(`/organisations/${organisationId}/members`, {
        query: { limit: PAGE_SIZE, offset },
      }),
    ),

  uploadRoster: (organisationId: number, members: readonly TeamMemberCreate[]) =>
    client.post<RosterResult>(`/organisations/${organisationId}/members`, { body: { members } }),

  listAudits: (organisationId: number) =>
    fetchAll((offset) =>
      client.get<AuditPage>(`/organisations/${organisationId}/audits`, {
        query: { limit: PAGE_SIZE, offset },
      }),
    ),

  startAudit: (organisationId: number, audit: AuditCreate) =>
    client.post<Audit>(`/organisations/${organisationId}/audits`, { body: audit }),

  getAudit: (organisationId: number, auditId: number) =>
    client.get<Audit>(`/organisations/${organisationId}/audits/${auditId}`),

  retestAudit: (
    organisationId: number,
    auditId: number,
    retest: AuditRetest = { send_invitations: true },
  ) =>
    client.post<Audit>(`/organisations/${organisationId}/audits/${auditId}/retest`, {
      body: retest,
    }),

  auditDeltas: (organisationId: number, auditId: number) =>
    client.get<AuditDeltas>(`/organisations/${organisationId}/audits/${auditId}/deltas`),

  heatmap: (organisationId: number, groupBy: HeatmapGrouping, auditId?: number) =>
    client.get<Heatmap>(`/organisations/${organisationId}/heatmap`, {
      query: { group_by: groupBy, audit_id: auditId },
    }),

  getTargets: (organisationId: number) =>
    client.get<Targets>(`/organisations/${organisationId}/targets`),

  setTargets: (organisationId: number, items: readonly TargetSet[]) =>
    client.put<Targets>(`/organisations/${organisationId}/targets`, { body: { items } }),
});

export const createRolesApi = (client: Client) => ({
  list: () =>
    fetchAll((offset) => client.get<RolePage>('/roles', { query: { limit: 100, offset } })),

  get: (roleId: number) => client.get<Role>(`/roles/${roleId}`),
});
