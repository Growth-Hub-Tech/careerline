import { Outlet } from 'react-router-dom';
import { Navbar } from '../../components';

export const NoFooterLayout = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="flex flex-1 flex-col">
      <Outlet />
    </main>
  </div>
);
