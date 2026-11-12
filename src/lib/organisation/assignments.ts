import type { AssessmentSummary, AuditCreate, Role, TeamMember } from '../api';
import { formatDate } from '../format';

export const assignedTestTitle = (
  role: Role | undefined,
  tests: readonly AssessmentSummary[],
): string | null => {
  const mainTestId = role?.test_ids[0];
  return tests.find((test) => test.test_id === mainTestId)?.title ?? null;
};

export const auditFor = (
  members: readonly TeamMember[],
  assigned: ReadonlySet<number>,
  today: Date,
): AuditCreate => {
  const chosen = members.filter((item) => assigned.has(item.member_id));
  return {
    name: `Staff audit ${formatDate(today)}`,
    role_ids: [...new Set(chosen.map((item) => item.role_id))],
    member_ids: chosen.map((item) => item.member_id),
    send_invitations: true,
  };
};

export const pageCount = (total: number, size: number) => Math.max(1, Math.ceil(total / size));

export const pageOf = <T>(items: readonly T[], page: number, size: number) =>
  items.slice((page - 1) * size, page * size);
