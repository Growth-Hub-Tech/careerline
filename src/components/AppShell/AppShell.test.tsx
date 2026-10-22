import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppShell } from './AppShell';

const USER = { name: 'Skye Favour', role: 'Beginner' };

const NAV_LINKS: readonly [string, string][] = [
  ['Home', '/'],
  ['Dashboard', '/dashboard'],
  ['Assessment', '/assessment'],
  ['Tasks', '/tasks'],
  ['Reporting', '/reports'],
  ['Users', '/users'],
  ['Support', '/support'],
  ['Settings', '/settings'],
];

const setup = (address = '/dashboard') =>
  render(
    <MemoryRouter initialEntries={[address]}>
      <AppShell user={USER}>
        <p>Page content</p>
      </AppShell>
    </MemoryRouter>,
  );

const mainNav = () => screen.getByRole('navigation', { name: 'Main' });
const sidebar = () => screen.getByTestId('app-sidebar');

describe('AppShell', () => {
  it('links the logo to the homepage', () => {
    setup();

    expect(screen.getByRole('link', { name: 'CareerLine AI home' })).toHaveAttribute('href', '/');
  });

  it('renders the page content inside main', () => {
    setup();

    expect(within(screen.getByRole('main')).getByText('Page content')).toBeInTheDocument();
  });

  it.each(NAV_LINKS)('has a %s link in the main navigation', (name, href) => {
    setup();

    expect(within(mainNav()).getByRole('link', { name })).toHaveAttribute('href', href);
  });

  it('marks only the current page', () => {
    setup('/tasks');

    expect(within(mainNav()).getByRole('link', { name: 'Tasks' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(mainNav()).getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('keeps a section current on its nested addresses', () => {
    setup('/assessment/results');

    expect(within(mainNav()).getByRole('link', { name: 'Assessment' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('does not mark Home as current on other pages', () => {
    setup('/dashboard');

    expect(within(mainNav()).getByRole('link', { name: 'Home' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it("shows the person's name and role", () => {
    setup();

    expect(screen.getByText('Skye Favour')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });

  it('shows initials as a decorative avatar', () => {
    setup();

    expect(screen.getByTestId('user-avatar')).toHaveTextContent('SF');
    expect(screen.getByTestId('user-avatar')).toHaveAttribute('aria-hidden', 'true');
  });

  it('has a notifications button', () => {
    setup();

    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('starts with the menu closed', () => {
    setup();

    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(sidebar()).toHaveAttribute('data-open', 'false');
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument();
  });

  it('opens and closes from the menu button', async () => {
    setup();

    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(sidebar()).toHaveAttribute('data-open', 'true');

    await userEvent.click(screen.getByRole('button', { name: 'Close menu' }));
    expect(sidebar()).toHaveAttribute('data-open', 'false');
  });

  it('closes on Escape', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    await userEvent.keyboard('{Escape}');

    expect(sidebar()).toHaveAttribute('data-open', 'false');
  });

  it('closes when the backdrop is clicked', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    await userEvent.click(screen.getByTestId('sidebar-backdrop'));

    expect(sidebar()).toHaveAttribute('data-open', 'false');
  });

  it('closes when a link is chosen', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }));

    await userEvent.click(within(mainNav()).getByRole('link', { name: 'Tasks' }));

    expect(sidebar()).toHaveAttribute('data-open', 'false');
  });
});
