import type { Audit, TeamMember } from '../api';
import type { Status } from '../../components/StatusLabel';

export const AUDIT_STATUS: Record<
  Audit['status'],
  { readonly label: string; readonly tone: Status }
> = {
  draft: { label: 'Draft', tone: 'neutral' },
  in_progress: { label: 'In progress', tone: 'warning' },
  completed: { label: 'Completed', tone: 'success' },
};

export const MEMBER_STATUS: Record<
  TeamMember['status'],
  { readonly label: string; readonly tone: Status }
> = {
  not_invited: { label: 'Not invited', tone: 'neutral' },
  invited: { label: 'Invited', tone: 'info' },
  in_progress: { label: 'In progress', tone: 'warning' },
  completed: { label: 'Completed', tone: 'success' },
};
