import { Outlet } from 'react-router-dom';
import { OfflineBanner } from '../components/OfflineBanner';
import { UserProvider } from '../lib/user';

export const SessionRoot = () => (
  <UserProvider>
    <OfflineBanner />
    <Outlet />
  </UserProvider>
);
