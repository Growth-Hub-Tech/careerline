import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider, writeSession } from '../lib/session';
import { signInAs } from '../test/session';
import { Dashboard } from './Dashboard';

const setup = () =>
  render(
    <MemoryRouter>
      <SessionProvider>
        <Dashboard />
      </SessionProvider>
    </MemoryRouter>,
  );

describe('Dashboard', () => {
  it('welcomes the signed-in person by first name', () => {
    signInAs();

    setup();

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome, Skye!' })).toBeInTheDocument();
    expect(
      screen.getByText('Take your first step to knowing your ideal career path'),
    ).toBeInTheDocument();
  });

  it('uses whoever is signed in, not a fixed name', () => {
    writeSession({
      token: 'token',
      user: { name: 'Adaeze Obi Nwosu', email: 'ada@example.com', userType: 'beginner' },
    });

    setup();

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome, Adaeze!' })).toBeInTheDocument();
  });

  it('copes with extra spaces and a single name', () => {
    writeSession({
      token: 'token',
      user: { name: '  Tunde  ', email: 'tunde@example.com', userType: 'beginner' },
    });

    setup();

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome, Tunde!' })).toBeInTheDocument();
  });

  it('greets without a name when nobody is signed in', () => {
    setup();

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome!' })).toBeInTheDocument();
  });

  it('invites them to start the assessment', () => {
    signInAs();

    setup();

    expect(
      screen.getByRole('heading', { level: 2, name: /Not sure where to start/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Take Assessment Test' })).toHaveAttribute(
      'href',
      '/assessment',
    );
  });

  it('explains the test', () => {
    signInAs();

    setup();

    expect(
      screen.getByText(/An AI powered career clarity test - answer a few questions/),
    ).toBeInTheDocument();
  });

  it.each(['Your Top 3 Strengths', 'Roles That Match You', 'Explore Your Path'])(
    'shows the %s card',
    (title) => {
      signInAs();

      setup();

      expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
    },
  );
});
