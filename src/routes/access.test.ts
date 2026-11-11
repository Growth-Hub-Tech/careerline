import { USER_TYPES } from '../lib/user';
import { accessFor, PAGE_ACCESS } from './access';

// The routes ask accessFor with their own path patterns (src/routes/index.tsx)
describe('page access', () => {
  it('keeps the users page for organisations', () => {
    expect(PAGE_ACCESS['/users']).toEqual(['organization']);
    expect(accessFor('/users')).not.toContain('recruiter');
  });

  it('opens unlisted addresses to every user type', () => {
    expect(accessFor('/anything-else')).toEqual(USER_TYPES);
    expect(accessFor('/dashboard')).toEqual(USER_TYPES);
  });

  it('keeps the assessment and programmes for beginners', () => {
    expect(accessFor('/assessment')).toEqual(['beginner']);
    expect(accessFor('/programmes/:programmeId')).toContain('beginner');
  });

  it('keeps a test page for professionals and lets anyone sent a test take it', () => {
    expect(accessFor('/tests/:testId')).toContain('self-test');
    expect(accessFor('/tests/:testId')).not.toContain('beginner');
    expect(accessFor('/tests/:testId/attempt')).toEqual(USER_TYPES);
  });

  it('keeps candidates for recruiters and the team for organizations', () => {
    expect(accessFor('/candidates')).toContain('recruiter');
    expect(accessFor('/candidates')).not.toContain('organization');
    expect(accessFor('/team/heatmap')).toContain('organization');
    expect(accessFor('/team/heatmap')).not.toContain('recruiter');
  });
});
