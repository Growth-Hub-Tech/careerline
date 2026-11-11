import { USER_TYPES } from '../../lib/session';
import { accessFor } from '../../routes/access';
import { NAV_BY_TYPE } from './navigation';

describe('navigation per user type', () => {
  it.each(USER_TYPES)('only links %s to pages it may open', (userType) => {
    const { main, footer } = NAV_BY_TYPE[userType];

    [...main, ...footer].forEach(({ path }) => expect(accessFor(path)).toContain(userType));
  });

  it.each(USER_TYPES)('gives %s a dashboard, support and settings', (userType) => {
    const { main, footer } = NAV_BY_TYPE[userType];
    const paths = [...main, ...footer].map(({ path }) => path);

    expect(paths).toEqual(expect.arrayContaining(['/dashboard', '/support', '/settings']));
  });

  it.each(USER_TYPES)('has no repeated links in the %s menu', (userType) => {
    const { main, footer } = NAV_BY_TYPE[userType];
    const paths = [...main, ...footer].map(({ path }) => path);

    expect(new Set(paths).size).toBe(paths.length);
  });

  it.each(USER_TYPES)('never sends %s out to the public homepage', (userType) => {
    const { main, footer } = NAV_BY_TYPE[userType];

    expect([...main, ...footer].map(({ path }) => path)).not.toContain('/');
  });

  it.each(['self-test', 'recruiter'] as const)('links %s to its credits', (userType) => {
    const { main, footer } = NAV_BY_TYPE[userType];

    expect([...main, ...footer].map(({ path }) => path)).toContain('/credits');
  });

  it.each(USER_TYPES)('gives %s the privacy centre', (userType) => {
    expect(NAV_BY_TYPE[userType].footer.map(({ path }) => path)).toContain('/settings/privacy');
  });

  it('links organisations to the plans they can buy', () => {
    expect(NAV_BY_TYPE.organization.main.map(({ path }) => path)).toContain('/pricing');
  });

  it.each(USER_TYPES)('gives %s its billing', (userType) => {
    expect(NAV_BY_TYPE[userType].footer.map(({ path }) => path)).toContain('/billing');
  });
});
