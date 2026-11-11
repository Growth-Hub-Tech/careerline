import type {
  AuditSummary,
  BeginnerPath,
  Invitation,
  ResultSummary,
  TeamMember,
} from '../api/types';

export interface Task {
  readonly id: string;
  readonly text: string;
  readonly to: string;
  readonly action: string;
  readonly waiting?: boolean;
}

// What to do next, worked out from data the account already has. null: no career paths yet.
export const beginnerTasks = (path: BeginnerPath | null): Task[] => {
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

export const professionalTasks = (results: readonly ResultSummary[]): Task[] => {
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

export const recruiterTasks = (invitations: readonly Invitation[]): Task[] => {
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

export const organisationTasks = (
  audits: readonly AuditSummary[],
  members: readonly TeamMember[],
): Task[] => {
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
