import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NoAccess } from './NoAccess';

const setup = () =>
  render(
    <MemoryRouter>
      <NoAccess />
    </MemoryRouter>,
  );

describe('NoAccess', () => {
  it('says the person has no access', () => {
    setup();

    expect(
      screen.getByRole('heading', { level: 1, name: "You don't have access to this page" }),
    ).toBeInTheDocument();
  });

  it('shows the 403 code as decoration', () => {
    setup();

    expect(screen.getByTestId('error-code')).toHaveTextContent('403');
  });

  it('links to the homepage', () => {
    setup();

    expect(screen.getByRole('link', { name: 'Go to homepage' })).toHaveAttribute('href', '/');
  });

  it('offers signing in with a different account', () => {
    setup();

    expect(screen.getByRole('link', { name: 'Sign in with another account' })).toHaveAttribute(
      'href',
      '/sign-in',
    );
  });

  it('links to the contact page', () => {
    setup();

    expect(screen.getByRole('link', { name: 'Contact us' })).toHaveAttribute('href', '/contact');
  });
});
