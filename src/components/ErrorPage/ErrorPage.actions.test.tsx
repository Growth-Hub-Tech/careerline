import { render, screen } from '@testing-library/react';
import { ErrorPage } from './ErrorPage';

describe('ErrorPage actions', () => {
  it('lets the actions wrap instead of squeezing them', () => {
    render(
      <ErrorPage code="403" title="No access" description="Not allowed">
        <a href="/">Go to homepage</a>
        <a href="/sign-in">Sign in with another account</a>
      </ErrorPage>,
    );

    const actions = screen.getByRole('link', { name: 'Go to homepage' }).parentElement;

    expect(actions).toHaveClass('sm:flex-wrap');
    expect(actions).toHaveClass('max-w-[560px]');
  });
});
