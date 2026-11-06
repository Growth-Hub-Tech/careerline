import { Outlet } from 'react-router-dom';
import { Navbar } from '../../components';
import { MAIN_ID, SkipLink } from '../../components/SkipLink';

export const NoFooterLayout = () => (
  <div className="flex min-h-screen flex-col">
    <SkipLink />
    <Navbar />
    <main id={MAIN_ID} tabIndex={-1} className="flex flex-1 flex-col focus:outline-none">
      <Outlet />
    </main>
  </div>
);
