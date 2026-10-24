import { Outlet } from 'react-router-dom';
import { AppShell } from '../../components/AppShell';
import { NAV_BY_TYPE } from '../../components/AppShell/navigation';
import { USER_TYPE_LABELS, useSession } from '../../lib/session';

export const AppLayout = () => {
  const { session } = useSession();

  if (!session) return null;

  const { name, userType } = session.user;

  return (
    <AppShell user={{ name, role: USER_TYPE_LABELS[userType] }} navigation={NAV_BY_TYPE[userType]}>
      <Outlet />
    </AppShell>
  );
};
