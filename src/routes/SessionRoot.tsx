import { Outlet } from 'react-router-dom';
import { SessionProvider } from '../lib/session';

export const SessionRoot = () => (
  <SessionProvider>
    <Outlet />
  </SessionProvider>
);
