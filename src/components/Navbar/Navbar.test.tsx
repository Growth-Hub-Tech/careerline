import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '../../lib/session';
import { signInAs } from '../../test/session';
import { Navbar } from './Navbar';

const setup = () =>
  render(
    <MemoryRouter initialEntries={['/pricing']}>
      <SessionProvider>
        <Routes>
          <Route path="/pricing" element={<Navbar />} />
          <Route path="/dashboard" element={<h1>Dashboard page</h1>} />
          <Route path="/for-recruiters" element={<h1>Recruiters page</h1>} />
        </Routes>
      </SessionProvider>
    </MemoryRouter>,
  );

describe('Navbar', () => {
  it('offers a log in to visitors', () => {
    setup();

    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Go to dashboard' })).not.toBeInTheDocument();
  });

  it('takes someone signed in back to their dashboard', async () => {
    signInAs('self-test');
    setup();

    expect(screen.queryByRole('button', { name: 'Log in' })).not.toBeInTheDocument();
    await userEvent.click(screen.getAllByRole('button', { name: 'Go to dashboard' })[0]);

    expect(screen.getByRole('heading', { name: 'Dashboard page' })).toBeInTheDocument();
  });

  it('opens the page for each group', async () => {
    setup();

    await userEvent.click(screen.getAllByRole('button', { name: 'For Recruiters' })[0]);

    expect(screen.getByRole('heading', { name: 'Recruiters page' })).toBeInTheDocument();
  });
});
