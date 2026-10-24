import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession, type UserType } from '../../lib/session';

interface RequireAccessProps {
  readonly allow?: readonly UserType[];
}

export const RequireAccess = ({ allow }: RequireAccessProps) => {
  const { session } = useSession();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  if (allow && !allow.includes(session.user.userType)) {
    return <Navigate to="/no-access" replace />;
  }

  return <Outlet />;
};
