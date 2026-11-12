import type { AssessmentSummary, Role } from '../api';
import { member } from '../../test/fixtures/organisation';
import { assignedTestTitle, auditFor, pageCount, pageOf } from './assignments';

const role = (roleId: number, testIds: number[]): Role => ({
  role_id: roleId,
  title: `Role ${roleId}`,
  slug: `role-${roleId}`,
  track: 'tech',
  summary: '',
  description: '',
  skills: [],
  test_ids: testIds,
});

const test = (testId: number, title: string): AssessmentSummary => ({
  test_id: testId,
  title,
  skill_id: testId - 200,
  skill_name: title,
  levels: ['MID'],
  format: 'adaptive',
  question_count: 16,
  duration_minutes: 30,
  price_credits: 2,
  role_ids: [],
});

describe('assignedTestTitle', () => {
  const tests = [test(201, 'Frontend Web Development'), test(202, 'Backend Development')];

  it('names the main test of the role', () => {
    expect(assignedTestTitle(role(1, [202, 201]), tests)).toBe('Backend Development');
  });

  it('has no test when the role has none or it is not listed', () => {
    expect(assignedTestTitle(role(1, []), tests)).toBeNull();
    expect(assignedTestTitle(role(1, [299]), tests)).toBeNull();
    expect(assignedTestTitle(undefined, tests)).toBeNull();
  });
});

describe('auditFor', () => {
  it('sends tests to the confirmed people in their roles', () => {
    const members = [
      member(1, { role_id: 1 }),
      member(2, { role_id: 2 }),
      member(3, { role_id: 1 }),
    ];

    expect(auditFor(members, new Set([1, 3]), new Date('2026-11-12T10:00:00Z'))).toEqual({
      name: 'Staff audit 12 Nov 2026',
      role_ids: [1],
      member_ids: [1, 3],
      send_invitations: true,
    });
  });
});

describe('paging', () => {
  const items = Array.from({ length: 45 }, (_, index) => index);

  it('counts the pages, with at least one', () => {
    expect(pageCount(45, 20)).toBe(3);
    expect(pageCount(0, 20)).toBe(1);
  });

  it('returns the items of one page', () => {
    expect(pageOf(items, 1, 20)).toEqual(items.slice(0, 20));
    expect(pageOf(items, 3, 20)).toEqual([40, 41, 42, 43, 44]);
  });
});
