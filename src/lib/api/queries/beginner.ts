import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '..';
import { STALE_TIME } from '../queryClient';
import { queryKeys } from '../queryKeys';
import { API_ROUTES } from '../routes';
import type {
  BeginnerPath,
  Budget,
  IntakeQuestionnaire,
  IntakeSubmission,
  Profile,
  ProgrammeClick,
  ProgrammeClickRequest,
  SkillHistory,
  SkillProfile,
} from '../types';

export const beginnerQueries = {
  intake: () =>
    queryOptions({
      queryKey: queryKeys.beginner.intake,
      queryFn: ({ signal }) => apiGet<IntakeQuestionnaire>(API_ROUTES.beginner.intake, { signal }),
      staleTime: STALE_TIME.reference,
    }),

  // 404 until the questionnaire has been answered
  recommendations: () =>
    queryOptions({
      queryKey: queryKeys.beginner.recommendations,
      queryFn: ({ signal }) =>
        apiGet<BeginnerPath>(API_ROUTES.beginner.recommendations, { signal }),
    }),
};

export const profileQueries = {
  detail: () =>
    queryOptions({
      queryKey: queryKeys.profile.detail,
      queryFn: ({ signal }) => apiGet<Profile>(API_ROUTES.profile.detail, { signal }),
    }),

  skills: () =>
    queryOptions({
      queryKey: queryKeys.profile.skills,
      queryFn: ({ signal }) => apiGet<SkillProfile>(API_ROUTES.profile.skills, { signal }),
    }),

  skillHistory: (skillId: number) =>
    queryOptions({
      queryKey: queryKeys.profile.skillHistory(skillId),
      queryFn: ({ signal }) =>
        apiGet<SkillHistory>(API_ROUTES.profile.skillHistory, {
          query: { skill_id: skillId },
          signal,
        }),
    }),
};

// The budget from the questionnaire, for flagging programmes that cost more
export const selectBudget = (profile: Profile): Budget | null => profile.budget ?? null;

// The ranked paths come back with the reply; the results page shows them without asking again
export const useSubmitIntake = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (submission: IntakeSubmission) =>
      apiPost<BeginnerPath>(API_ROUTES.beginner.intake, submission),
    onSuccess: (path) => client.setQueryData(queryKeys.beginner.recommendations, path),
  });
};

export const useRecordProgrammeClick = () =>
  useMutation({
    mutationFn: ({ programmeId, click }: { programmeId: number; click: ProgrammeClickRequest }) =>
      apiPost<ProgrammeClick>(API_ROUTES.programmes.clicks(programmeId), click),
  });
