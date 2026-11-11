import { queryOptions } from '@tanstack/react-query';
import { apiGet } from '..';
import { hasStatus } from '../ApiError';
import { fetchAll } from '../fetchAll';
import { STALE_TIME } from '../queryClient';
import { queryKeys } from '../queryKeys';
import { API_ROUTES } from '../routes';
import type {
  AssessmentAccess,
  AssessmentDetail,
  AssessmentPage,
  Programme,
  ProgrammePage,
  Role,
  RolePage,
  SkillsPage,
} from '../types';

const PAGE_SIZE = 50;

export const catalogQueries = {
  skills: () =>
    queryOptions({
      queryKey: queryKeys.catalog.skills,
      queryFn: ({ signal }) =>
        fetchAll(async (offset) => {
          const page = await apiGet<SkillsPage>(API_ROUTES.catalog.skills, {
            query: { limit: PAGE_SIZE, offset },
            signal,
          });
          return { items: page.skills, total: page.total };
        }),
      staleTime: STALE_TIME.reference,
    }),

  tests: () =>
    queryOptions({
      queryKey: queryKeys.catalog.tests,
      queryFn: ({ signal }) =>
        fetchAll((offset) =>
          apiGet<AssessmentPage>(API_ROUTES.catalog.tests, {
            query: { limit: PAGE_SIZE, offset },
            signal,
          }),
        ),
      staleTime: STALE_TIME.reference,
    }),

  test: (testId: number) =>
    queryOptions({
      queryKey: queryKeys.catalog.test(testId),
      queryFn: ({ signal }) =>
        apiGet<AssessmentDetail>(API_ROUTES.catalog.test(testId), { signal }),
      staleTime: STALE_TIME.reference,
    }),

  // Whether this user can start the test now (credits, plan); it changes as they spend credits.
  // null when it has to be paid for first (the API says 402).
  access: (testId: number) =>
    queryOptions({
      queryKey: queryKeys.catalog.access(testId),
      queryFn: async ({ signal }) => {
        try {
          return await apiGet<AssessmentAccess>(API_ROUTES.catalog.access(testId), { signal });
        } catch (error) {
          if (hasStatus(error, 402)) return null;
          throw error;
        }
      },
    }),
};

export const roleQueries = {
  list: () =>
    queryOptions({
      queryKey: queryKeys.roles.list,
      queryFn: ({ signal }) =>
        fetchAll((offset) =>
          apiGet<RolePage>(API_ROUTES.roles.list, { query: { limit: 100, offset }, signal }),
        ),
      staleTime: STALE_TIME.reference,
    }),

  detail: (roleId: number) =>
    queryOptions({
      queryKey: queryKeys.roles.detail(roleId),
      queryFn: ({ signal }) => apiGet<Role>(API_ROUTES.roles.detail(roleId), { signal }),
      staleTime: STALE_TIME.reference,
    }),
};

export const programmeQueries = {
  detail: (programmeId: number) =>
    queryOptions({
      queryKey: queryKeys.programmes.detail(programmeId),
      queryFn: ({ signal }) =>
        apiGet<Programme>(API_ROUTES.programmes.detail(programmeId), { signal }),
      staleTime: STALE_TIME.reference,
    }),

  // The three programmes shown for a role
  forRole: (roleId: number) =>
    queryOptions({
      queryKey: queryKeys.programmes.forRole(roleId),
      queryFn: async ({ signal }) =>
        (
          await apiGet<ProgrammePage>(API_ROUTES.programmes.list, {
            query: { role_id: roleId, limit: 3, offset: 0 },
            signal,
          })
        ).items,
      staleTime: STALE_TIME.reference,
    }),
};
