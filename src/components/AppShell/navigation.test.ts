import { USER_TYPES } from '../../lib/session';
import { canAccess } from '../../routes/access';
import { NAV_BY_TYPE } from './navigation';

describe('navigation per user type', () => {
  it.each(USER_TYPES)('only links %s to pages it may open', (userType) => {
    const { main, footer } = NAV_BY_TYPE[userType];

    [...main, ...footer].forEach(({ path }) => expect(canAccess(userType, path)).toBe(true));
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
});
