import { account } from '../../test/fixtures/account';
import { USER_STORAGE_KEY, useUserStore, userNeedsType } from './store';

const store = () => useUserStore.getState();

const stored = () => JSON.parse(window.localStorage.getItem(USER_STORAGE_KEY) ?? 'null') as unknown;

describe('user store', () => {
  it('starts with nobody signed in', () => {
    expect(store().user).toBeNull();
  });

  it('signs in from the account, as a beginner until a type is chosen', () => {
    store().signIn(account());

    expect(store().user).toEqual({
      name: 'Skye Favour',
      email: 'skye@example.com',
      userType: 'beginner',
    });
  });

  it('takes the user type from an organisation role', () => {
    store().signIn(account({ organisation_id: 41, organisation_role: 'admin' }));

    expect(store().user?.userType).toBe('organization');
  });

  it('remembers who is signed in and the chosen types, never anything else', () => {
    store().signIn(account());
    store().chooseUserType('self-test');

    expect(stored()).toMatchObject({
      state: {
        user: { email: 'skye@example.com', userType: 'self-test' },
        roles: { 'skye@example.com': 'self-test' },
      },
    });
    expect(JSON.stringify(stored())).not.toMatch(/token|expired/i);
  });

  it('keeps the chosen type for the next sign-in, whatever the capitals in the email', () => {
    store().signIn(account());
    store().chooseUserType('self-test');
    store().signOut();
    store().signIn(account({ email: 'Skye@Example.com' }));

    expect(store().user?.userType).toBe('self-test');
  });

  it('corrects the user from a newer account reply', () => {
    store().signIn(account());
    store().syncAccount(account({ full_name: 'Skye F. Okafor', organisation_role: 'recruiter' }));

    expect(store().user).toMatchObject({ name: 'Skye F. Okafor', userType: 'recruiter' });
  });

  it('ignores an account reply about someone else', () => {
    store().signIn(account());
    store().syncAccount(account({ email: 'ada@example.com', full_name: 'Ada Obi' }));

    expect(store().user?.name).toBe('Skye Favour');
  });

  it('marks a session the API ended until the next sign-in', () => {
    store().signIn(account());
    store().expire();

    expect(store()).toMatchObject({ user: null, expired: true });

    store().signIn(account());
    expect(store().expired).toBe(false);
  });

  it('knows who still has to choose how they will use CareerLine', () => {
    const user = { name: 'Skye Favour', email: 'skye@example.com', userType: 'beginner' } as const;
    expect(userNeedsType(user)).toBe(true);

    store().signIn(account());
    store().chooseUserType('beginner');
    expect(userNeedsType(user)).toBe(false);
  });
});

describe('what the browser kept', () => {
  it('ignores a stored user it cannot trust', async () => {
    const user = { name: 'Skye', email: 'skye@example.com', userType: 'admin' };
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ state: { user }, version: 0 }));

    await useUserStore.persist.rehydrate();

    expect(store().user).toBeNull();
  });

  it('keeps people signed in from the keys used before this store, then removes them', async () => {
    const user = { name: 'Skye Favour', email: 'skye@example.com', userType: 'self-test' };
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.setItem('careerline.session', JSON.stringify({ user }));
    window.localStorage.setItem(
      'careerline.roles',
      JSON.stringify({ 'skye@example.com': 'self-test' }),
    );

    await useUserStore.persist.rehydrate();

    expect(store().user).toEqual(user);
    expect(store().roles).toEqual({ 'skye@example.com': 'self-test' });

    store().chooseUserType('beginner');
    expect(window.localStorage.getItem('careerline.session')).toBeNull();
    expect(window.localStorage.getItem('careerline.roles')).toBeNull();
  });
});
