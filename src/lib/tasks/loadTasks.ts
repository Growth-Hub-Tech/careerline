import { beginnerApi, invitationsApi, organisationsApi, resultsApi } from '../api';
import { ApiError } from '../api/ApiError';
import type { UserType } from '../session';

interface Task {
  readonly id: string;
  readonly text: string;
  readonly to: string;
  readonly action: string;
  readonly waiting?: boolean;
}

const isMissing = (error: unknown) => error instanceof ApiError && error.status === 404;

const beginnerTasks = async (): Promise<Task[]> => {
  const path = await beginnerApi.getRecommendations().catch((error: unknown) => {
    if (isMissing(error)) return null;
    throw error;
  });
  if (!path || path.recommendations.length === 0) {
    return [
      {
        id: 'questionnaire',
        text: 'Answer the career questionnaire to get your career paths.',
        to: '/assessment',
        action: 'Start the questionnaire',
      },
    ];
  }
  const [top] = path.recommendations;
  return [
    {
      id: 'paths',
      text: 'Read why each career path fits you.',
      to: '/assessment/results',
      action: 'See your career paths',
    },
    ...(top.programme
      ? [
          {
            id: 'programme',
            text: `Look at ${top.programme.name}, the programme for your top path.`,
            to: `/programmes/${top.programme.programme_id}`,
            action: 'View programme',
          },
        ]
      : []),
  ];
};

const professionalTasks = async (): Promise<Task[]> => {
  const results = await resultsApi.list();
  if (results.length === 0) {
    return [
      {
        id: 'first-test',
        text: 'Take your first skill test to find your level.',
        to: '/tests',
        action: 'Choose a test',
      },
    ];
  }
  const latest = [...results].sort((a, b) => b.completed_at.localeCompare(a.completed_at))[0];
  return [
    {
      id: 'report',
      text: `Download your ${latest.skill_name} report to keep or share.`,
      to: `/reports/${latest.result_id}`,
      action: 'Open the report',
    },
    {
      id: 'retest',
      text: `Retake ${latest.skill_name} after some practice to measure your progress.`,
      to: `/tests/${latest.test_id}`,
      action: 'Retake the test',
    },
  ];
};

const recruiterTasks = async (): Promise<Task[]> => {
  const invitations = await invitationsApi.list();
  if (invitations.length === 0) {
    return [
      {
        id: 'send',
        text: 'Send your first test to a candidate.',
        to: '/candidates',
        action: 'Send a test',
      },
    ];
  }
  return invitations.flatMap((invitation): Task[] => {
    if (invitation.status === 'completed' && invitation.candidate_id !== null) {
      return [
        {
          id: `report-${invitation.invitation_id}`,
          text: `Read ${invitation.full_name}’s ${invitation.test_title} report.`,
          to: `/candidates/${invitation.candidate_id}`,
          action: 'View report',
        },
      ];
    }
    if (invitation.status === 'sent' || invitation.status === 'accepted') {
      return [
        {
          id: `waiting-${invitation.invitation_id}`,
          text: `Waiting for ${invitation.full_name} to finish ${invitation.test_title}.`,
          to: '/candidates',
          action: 'See tests sent',
          waiting: true,
        },
      ];
    }
    return [];
  });
};

const organisationTasks = async (): Promise<Task[]> => {
  const organisation = await organisationsApi.me();
  const [audits, members] = await Promise.all([
    organisationsApi.listAudits(organisation.organisation_id),
    organisationsApi.listMembers(organisation.organisation_id),
  ]);
  if (members.length === 0) {
    return [
      {
        id: 'roster',
        text: 'Upload your staff list so you can start an audit.',
        to: '/team/import',
        action: 'Upload staff list',
      },
    ];
  }
  const notInvited = members.filter((member) => member.status === 'not_invited').length;
  return [
    ...audits
      .filter((audit) => audit.status === 'in_progress')
      .map((audit) => ({
        id: `audit-${audit.audit_id}`,
        text: `${audit.name}: ${audit.members_completed} of ${audit.members_total} finished.`,
        to: `/team/audits/${audit.audit_id}`,
        action: 'Follow the audit',
        waiting: true,
      })),
    ...(notInvited > 0
      ? [
          {
            id: 'not-invited',
            text: `${notInvited} ${notInvited === 1 ? 'person has' : 'people have'} not been invited to a test yet.`,
            to: '/team/audits/new',
            action: 'Start an audit',
          },
        ]
      : []),
  ];
};

export const loadTasks = (userType: UserType): Promise<Task[]> => {
  if (userType === 'beginner') return beginnerTasks();
  if (userType === 'self-test') return professionalTasks();
  if (userType === 'recruiter') return recruiterTasks();
  return organisationTasks();
};
