import { Outlet, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/AppShell';
import { NAV_BY_TYPE } from '../../components/AppShell/navigation';
import { USER_TYPE_LABELS, useSession } from '../../lib/session';

export const AppLayout = () => {
  const { session, signOut } = useSession();
  const navigate = useNavigate();

  if (!session) return null;

  const { name, userType } = session.user;

  const onSignOut = () => {
    signOut();
    navigate('/sign-in', { replace: true });
  };

  return (
    <AppShell
      user={{ name, role: USER_TYPE_LABELS[userType] }}
      navigation={NAV_BY_TYPE[userType]}
      onSignOut={onSignOut}
    >
      <Outlet />
    </AppShell>
  );
};
