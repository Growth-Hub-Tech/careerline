import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { NAV_BY_TYPE } from '../components/AppShell/navigation';
import { SessionProvider } from '../lib/session';
import { MainLayout } from './MainLayout/MainLayout';
import { NoFooterLayout } from './NoFooterLayout/NoFooterLayout';
import { TestFrame } from './TestFrame/TestFrame';

const LAYOUTS = [
  {
    name: 'signed-in app',
    element: (
      <AppShell
        user={{ name: 'Skye Favour', role: 'Professional' }}
        navigation={NAV_BY_TYPE['self-test']}
        onSignOut={vi.fn()}
      >
        <p>Page</p>
      </AppShell>
    ),
  },
  { name: 'public site', element: <MainLayout /> },
  { name: 'plain pages', element: <NoFooterLayout /> },
  { name: 'test screen', element: <TestFrame /> },
];

describe('skip link', () => {
  it.each(LAYOUTS)('is the first thing the keyboard reaches on the $name', async ({ element }) => {
    render(
      <MemoryRouter>
        <SessionProvider>
          <Routes>
            <Route path="/" element={element} />
          </Routes>
        </SessionProvider>
      </MemoryRouter>,
    );

    await userEvent.tab();

    const link = screen.getByRole('link', { name: 'Skip to main content' });
    expect(link).toHaveFocus();
    expect(link).toHaveAttribute('href', '#main');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main');
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1');
  });
});
