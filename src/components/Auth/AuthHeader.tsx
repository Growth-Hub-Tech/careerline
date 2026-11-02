import { Link } from 'react-router-dom';
import logo from '../../assets/careerline.png';
import { AUTH_PATHS } from './roles';

interface AuthHeaderProps {
  /** Centre the content in the 1280px page container (card screens). */
  readonly contained?: boolean;
  /** Show "Log in" and "Take a test" on the right. */
  readonly showActions?: boolean;
}

export const AuthHeader = ({ contained = false, showActions = false }: AuthHeaderProps) => (
  <header className="h-20 w-full shrink-0 border-b border-slate-100 bg-white">
    <div
      className={`flex h-full items-center justify-between px-5 sm:px-8 ${
        contained ? 'mx-auto w-full max-w-[1280px]' : ''
      }`}
    >
      <Link
        to="/"
        aria-label="CareerLine AI home"
        className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <img src={logo} alt="CareerLine AI" decoding="async" className="block h-7 w-auto sm:h-8" />
      </Link>

      {showActions && (
        <nav className="flex items-center gap-4 sm:gap-7">
          <Link
            to={AUTH_PATHS.signIn}
            className="rounded-md text-[15px] font-medium text-slate-950 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-[16px]"
          >
            Log in
          </Link>
          <Link
            to={AUTH_PATHS.signUp}
            className="inline-flex h-10 items-center rounded-lg bg-indigo-600 px-4 text-[15px] font-medium whitespace-nowrap text-white transition-colors hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:h-12 sm:text-[16px]"
          >
            Take a test
          </Link>
        </nav>
      )}
    </div>
  </header>
);
