import { Link } from 'react-router-dom';
import { ErrorPage, PRIMARY_ACTION, SECONDARY_ACTION } from '../ErrorPage';

export const NoAccess = () => (
  <ErrorPage
    code="403"
    title="You don't have access to this page"
    description="Your account doesn't have permission to view this. Sign in with a different account, or get in touch if you think this is a mistake."
  >
    <Link to="/" className={PRIMARY_ACTION}>
      Go to homepage
    </Link>
    <Link to="/sign-in" className={SECONDARY_ACTION}>
      Sign in with another account
    </Link>
    <p className="w-full text-center text-[12px] text-slate-500 sm:order-last">
      Need access?{' '}
      <Link to="/contact" className="font-medium text-indigo-800 hover:underline">
        Contact us
      </Link>
    </p>
  </ErrorPage>
);
