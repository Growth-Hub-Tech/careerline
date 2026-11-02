import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { SessionProvider, type UserType } from '../../lib/session';
import { signInAs } from '../../test/session';
import { RequireAccess } from './RequireAccess';

const SignInProbe = () => {
  const { state } = useLocation() as { state: { from?: { pathname: string } } | null };

  return <p>Sign in page, from {state?.from?.pathname}</p>;
};

const setup = (allow?: readonly UserType[]) =>
  render(
    <MemoryRouter initialEntries={['/private']}>
      <SessionProvider>
        <Routes>
          <Route element={<RequireAccess allow={allow} />}>
            <Route path="/private" element={<p>Private page</p>} />
          </Route>
          <Route path="/sign-in" element={<SignInProbe />} />
          <Route path="/no-access" element={<p>No access page</p>} />
        </Routes>
      </SessionProvider>
    </MemoryRouter>,
  );

describe('RequireAccess', () => {
  it('sends signed-out visitors to sign in and remembers where they were going', () => {
    setup();

    expect(screen.getByText('Sign in page, from /private')).toBeInTheDocument();
  });

  it('lets any signed-in user through when no types are listed', () => {
    signInAs('recruiter');

    setup();

    expect(screen.getByText('Private page')).toBeInTheDocument();
  });

  it('lets a listed user type through', () => {
    signInAs('recruiter');

    setup(['recruiter', 'organization']);

    expect(screen.getByText('Private page')).toBeInTheDocument();
  });

  it('sends an unlisted user type to the no access page', () => {
    signInAs('beginner');

    setup(['recruiter']);

    expect(screen.getByText('No access page')).toBeInTheDocument();
    expect(screen.queryByText('Private page')).not.toBeInTheDocument();
  });
});
