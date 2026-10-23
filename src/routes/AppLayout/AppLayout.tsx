import { Outlet } from 'react-router-dom';
import { AppShell } from '../../components/AppShell';
import { SAMPLE_USER } from '../../data/sampleUser';

export const AppLayout = () => (
  <AppShell user={SAMPLE_USER}>
    <Outlet />
  </AppShell>
);
