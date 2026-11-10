import type { Invitation } from '../api';
import type { Status } from '../../components/StatusLabel';

export const SHORTLIST_LIMIT = 25;

export const INVITATION_STATUS: Record<
  Invitation['status'],
  { readonly label: string; readonly tone: Status }
> = {
  sent: { label: 'Sent', tone: 'info' },
  accepted: { label: 'In progress', tone: 'warning' },
  completed: { label: 'Completed', tone: 'success' },
  expired: { label: 'Expired', tone: 'neutral' },
  revoked: { label: 'Cancelled', tone: 'neutral' },
};
