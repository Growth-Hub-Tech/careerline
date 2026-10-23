import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from './Dashboard';

const setup = () =>
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );

describe('Dashboard', () => {
  it('welcomes the person by first name', () => {
    setup();

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome, Skye!' })).toBeInTheDocument();
    expect(
      screen.getByText('Take your first step to knowing your ideal career path'),
    ).toBeInTheDocument();
  });

  it('invites them to start the assessment', () => {
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
    setup();

    expect(
      screen.getByText(/An AI powered career clarity test - answer a few questions/),
    ).toBeInTheDocument();
  });

  it.each(['Your Top 3 Strengths', 'Roles That Match You', 'Explore Your Path'])(
    'shows the %s card',
    (title) => {
      setup();

      expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
    },
  );
});
