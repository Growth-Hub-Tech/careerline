import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser, type UserType } from '../../lib/user';

interface RequireAccessProps {
  readonly allow?: readonly UserType[];
}

// The only sign-in and user-type check for pages: everything under it has a signed-in user
export const RequireAccess = ({ allow }: RequireAccessProps) => {
  const user = useUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  if (allow && !allow.includes(user.userType)) {
    return <Navigate to="/no-access" replace />;
  }

  return <Outlet />;
};
