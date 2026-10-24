import { USER_TYPES } from '../lib/session';
import { accessFor, canAccess, PAGE_ACCESS } from './access';
import { APP_PLACEHOLDERS } from './routeMap';

describe('page access', () => {
  it('lists every app page explicitly', () => {
    APP_PLACEHOLDERS.forEach(({ path }) => expect(Object.keys(PAGE_ACCESS)).toContain(path));
  });

  it('opens unlisted addresses to every user type', () => {
    expect(accessFor('/anything-else')).toEqual(USER_TYPES);
  });

  it.each(USER_TYPES)('opens the dashboard to %s', (userType) => {
    expect(canAccess(userType, '/dashboard')).toBe(true);
  });

  it('keeps the assessment and programmes for beginners', () => {
    expect(canAccess('beginner', '/assessment/results')).toBe(true);
    expect(canAccess('beginner', '/programmes/product-design')).toBe(true);
    expect(canAccess('recruiter', '/assessment')).toBe(false);
  });

  it('matches addresses that carry an id', () => {
    expect(canAccess('self-test', '/tests/abc')).toBe(true);
    expect(canAccess('beginner', '/tests/abc')).toBe(false);
  });

  it('keeps candidates for recruiters and the team for organizations', () => {
    expect(canAccess('recruiter', '/candidates/abc')).toBe(true);
    expect(canAccess('organization', '/candidates')).toBe(false);
    expect(canAccess('organization', '/team/heatmap')).toBe(true);
    expect(canAccess('recruiter', '/team/heatmap')).toBe(false);
  });
});
