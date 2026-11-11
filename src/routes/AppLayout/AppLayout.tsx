import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { PageLoader } from '../../components/Loader';
import { AppShell } from '../../components/AppShell';
import { NAV_BY_TYPE } from '../../components/AppShell/navigation';
import { USER_TYPE_LABELS, useCurrentUser, useSignOut } from '../../lib/user';

export const AppLayout = () => {
  const { name, userType } = useCurrentUser();
  const signOut = useSignOut();

  return (
    <AppShell
      user={{ name, role: USER_TYPE_LABELS[userType] }}
      navigation={NAV_BY_TYPE[userType]}
      onSignOut={signOut}
    >
      <Suspense fallback={<PageLoader title="Loading" className="flex-1" />}>
        <Outlet />
      </Suspense>
    </AppShell>
  );
};
