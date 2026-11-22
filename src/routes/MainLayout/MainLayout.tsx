import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { PageLoader } from '../../components/Loader';
import { Footer } from '../../components/Footer';
import { Navbar } from '../../components/Navbar';
import { MAIN_ID, SkipLink } from '../../components/SkipLink';

export const MainLayout = () => (
  <div>
    <SkipLink />
    <Navbar />
    <main id={MAIN_ID} tabIndex={-1} className="focus:outline-none">
      <Suspense fallback={<PageLoader title="Loading" />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
  </div>
);
