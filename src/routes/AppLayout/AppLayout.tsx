import { Suspense, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { PageLoader } from '../../components/Loader';
import { AppShell } from '../../components/AppShell';
import { NAV_BY_TYPE } from '../../components/AppShell/navigation';
import { accountsApi, authApi } from '../../lib/api';
import { readSession, USER_TYPE_LABELS, userTypeFor, useSession } from '../../lib/session';

// On load, the account's organisation role corrects the user type remembered in this browser
// (a new device has none). A reply for a session that has since changed or ended is ignored; on
// failure the type stays as it is (a 401 ends the session through the API client).
const useAccountUserType = (email: string | undefined) => {
  const { signIn } = useSession();

  useEffect(() => {
    if (!email) return undefined;
    let active = true;

    accountsApi.me().then(
      (account) => {
        const current = readSession();
        if (!active || current?.user.email !== email) return;
        const userType = userTypeFor(email, account.organisation_role);
        if (userType && userType !== current.user.userType) {
          signIn({ user: { ...current.user, userType } });
        }
      },
      () => undefined,
    );

    return () => {
      active = false;
    };
  }, [email, signIn]);
};

export const AppLayout = () => {
  const { session, signOut } = useSession();
  const navigate = useNavigate();
  useAccountUserType(session?.user.email);

  if (!session) return null;

  const { name, userType } = session.user;

  const onSignOut = () => {
    void authApi.logout().catch(() => undefined);
    signOut();
    navigate('/sign-in', { replace: true });
  };

  return (
    <AppShell
      user={{ name, role: USER_TYPE_LABELS[userType] }}
      navigation={NAV_BY_TYPE[userType]}
      onSignOut={onSignOut}
    >
      <Suspense fallback={<PageLoader title="Loading" className="flex-1" />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
};
