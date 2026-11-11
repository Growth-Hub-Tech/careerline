import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from '..';
import { fetchAll } from '../fetchAll';
import { queryClient, STALE_TIME } from '../queryClient';
import { queryKeys } from '../queryKeys';
import { API_ROUTES } from '../routes';
import type {
  Acknowledgement,
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
  RosterResult,
  TargetSet,
  Targets,
  TeamMemberCreate,
  TeamMemberPage,
} from '../types';

const PAGE_SIZE = 50;

const meQuery = () =>
  queryOptions({
    queryKey: queryKeys.organisation.me,
    queryFn: ({ signal }) => apiGet<Organisation>(API_ROUTES.organisations.me, { signal }),
    staleTime: STALE_TIME.record,
  });

// The signed-in user belongs to one organisation: every query below finds its id through the
// cached organisation record, so pages never fetch or pass it
const organisationId = async () => (await queryClient.ensureQueryData(meQuery())).organisation_id;

export const organisationQueries = {
  me: meQuery,

  users: () =>
    queryOptions({
      queryKey: queryKeys.organisation.users,
      queryFn: async ({ signal }) =>
        (
          await apiGet<OrganisationUserList>(
            API_ROUTES.organisations.users(await organisationId()),
            {
              signal,
            },
          )
        ).items,
    }),

  members: () =>
    queryOptions({
      queryKey: queryKeys.organisation.members,
      queryFn: async ({ signal }) => {
        const path = API_ROUTES.organisations.members(await organisationId());
        return fetchAll((offset) =>
          apiGet<TeamMemberPage>(path, { query: { limit: PAGE_SIZE, offset }, signal }),
        );
      },
    }),

  audits: () =>
    queryOptions({
      queryKey: queryKeys.organisation.audits,
      queryFn: async ({ signal }) => {
        const path = API_ROUTES.organisations.audits(await organisationId());
        return fetchAll((offset) =>
          apiGet<AuditPage>(path, { query: { limit: PAGE_SIZE, offset }, signal }),
        );
      },
    }),

  audit: (auditId: number) =>
    queryOptions({
      queryKey: queryKeys.organisation.audit(auditId),
      queryFn: async ({ signal }) =>
        apiGet<Audit>(API_ROUTES.organisations.audit(await organisationId(), auditId), { signal }),
    }),

  auditDeltas: (auditId: number) =>
    queryOptions({
      queryKey: queryKeys.organisation.auditDeltas(auditId),
      queryFn: async ({ signal }) =>
        apiGet<AuditDeltas>(API_ROUTES.organisations.deltas(await organisationId(), auditId), {
          signal,
        }),
    }),

  heatmap: (groupBy: HeatmapGrouping, auditId?: number) =>
    queryOptions({
      queryKey: queryKeys.organisation.heatmap(groupBy, auditId),
      queryFn: async ({ signal }) =>
        apiGet<Heatmap>(API_ROUTES.organisations.heatmap(await organisationId()), {
          query: { group_by: groupBy, audit_id: auditId },
          signal,
        }),
    }),

  targets: () =>
    queryOptions({
      queryKey: queryKeys.organisation.targets,
      queryFn: async ({ signal }) =>
        apiGet<Targets>(API_ROUTES.organisations.targets(await organisationId()), { signal }),
    }),
};

type Users = readonly OrganisationUser[];

export const useAddOrganisationUser = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ email, role }: { email: string; role: OrganisationRole }) =>
      apiPost<OrganisationUser>(API_ROUTES.organisations.users(await organisationId()), {
        email,
        role,
      }),
    onSuccess: (added) =>
      client.setQueryData<Users>(queryKeys.organisation.users, (users = []) => [...users, added]),
  });
};

export const useChangeOrganisationRole = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ learnerId, role }: { learnerId: number; role: OrganisationRole }) =>
      apiPatch<OrganisationUser>(API_ROUTES.organisations.user(await organisationId(), learnerId), {
        role,
      }),
    onSuccess: (changed) =>
      client.setQueryData<Users>(queryKeys.organisation.users, (users = []) =>
        users.map((user) => (user.learner_id === changed.learner_id ? changed : user)),
      ),
  });
};

export const useRemoveOrganisationUser = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (learnerId: number) =>
      apiDelete<Acknowledgement>(API_ROUTES.organisations.user(await organisationId(), learnerId)),
    onSuccess: (_reply, learnerId) =>
      client.setQueryData<Users>(queryKeys.organisation.users, (users = []) =>
        users.filter((user) => user.learner_id !== learnerId),
      ),
  });
};

// A new staff list changes the members, the seats on the organisation record and the heatmap
export const useUploadRoster = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (members: readonly TeamMemberCreate[]) =>
      apiPost<RosterResult>(API_ROUTES.organisations.members(await organisationId()), { members }),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.organisation.all }),
  });
};

// Starting an audit (or a re-test) invites people, so their status changes too
const useAuditMutation = <T>(start: (organisationId: number, input: T) => Promise<Audit>) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: T) => start(await organisationId(), input),
    onSuccess: () =>
      Promise.all([
        client.invalidateQueries({ queryKey: queryKeys.organisation.audits }),
        client.invalidateQueries({ queryKey: queryKeys.organisation.members }),
      ]),
  });
};

export const useStartAudit = () =>
  useAuditMutation((id, audit: AuditCreate) =>
    apiPost<Audit>(API_ROUTES.organisations.audits(id), audit),
  );

export const useRetestAudit = () =>
  useAuditMutation((id, auditId: number) =>
    apiPost<Audit>(API_ROUTES.organisations.retest(id, auditId), {
      send_invitations: true,
    } satisfies AuditRetest),
  );

export const useSetTargets = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (items: readonly TargetSet[]) =>
      apiPut<Targets>(API_ROUTES.organisations.targets(await organisationId()), { items }),
    onSuccess: (targets) => {
      client.setQueryData(queryKeys.organisation.targets, targets);
      return client.invalidateQueries({ queryKey: queryKeys.organisation.heatmaps });
    },
  });
};
