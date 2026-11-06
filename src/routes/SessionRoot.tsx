import { Outlet } from 'react-router-dom';
import { OfflineBanner } from '../components/OfflineBanner';
import { SessionProvider } from '../lib/session';

export const SessionRoot = () => (
  <SessionProvider>
    <OfflineBanner />
    <Outlet />
  </SessionProvider>
);
