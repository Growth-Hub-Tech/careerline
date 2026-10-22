import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink } from 'react-router-dom';
import type { IconType } from 'react-icons';
import {
  LuBell,
  LuChartColumn,
  LuClipboardCheck,
  LuHouse,
  LuLayoutDashboard,
  LuLifeBuoy,
  LuListTodo,
  LuMenu,
  LuSettings,
  LuUsers,
  LuX,
} from 'react-icons/lu';
import logo from '../../assests/careerline.png';

interface ShellUser {
  readonly name: string;
  readonly role: string;
}

interface NavEntry {
  readonly label: string;
  readonly path: string;
  readonly icon: IconType;
  readonly end?: boolean;
}

const MAIN_NAV: readonly NavEntry[] = [
  { label: 'Home', path: '/', icon: LuHouse, end: true },
  { label: 'Dashboard', path: '/dashboard', icon: LuLayoutDashboard },
  { label: 'Assessment', path: '/assessment', icon: LuClipboardCheck },
  { label: 'Tasks', path: '/tasks', icon: LuListTodo },
  { label: 'Reporting', path: '/reports', icon: LuChartColumn },
  { label: 'Users', path: '/users', icon: LuUsers },
];

const FOOTER_NAV: readonly NavEntry[] = [
  { label: 'Support', path: '/support', icon: LuLifeBuoy },
  { label: 'Settings', path: '/settings', icon: LuSettings },
];

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

const NavItem = ({ entry, onNavigate }: { entry: NavEntry; onNavigate: () => void }) => {
  const Icon = entry.icon;

  return (
    <li>
      <NavLink
        to={entry.path}
        end={entry.end}
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex h-11 items-center gap-3 rounded-lg px-3 text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
            isActive
              ? 'bg-white/15 text-white'
              : 'text-indigo-100 hover:bg-white/10 hover:text-white'
          }`
        }
      >
        <Icon size={20} aria-hidden="true" />
        {entry.label}
      </NavLink>
    </li>
  );
};

interface AppShellProps {
  readonly user: ShellUser;
  readonly children: ReactNode;
}

export const AppShell = ({ user, children }: AppShellProps) => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="app-sidebar"
            onClick={() => setOpen((prev) => !prev)}
            className="-ml-1 cursor-pointer rounded-md p-1 text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 lg:hidden"
          >
            {open ? <LuX size={24} aria-hidden="true" /> : <LuMenu size={24} aria-hidden="true" />}
          </button>

          <Link
            to="/"
            aria-label="CareerLine AI home"
            className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <img src={logo} alt="" decoding="async" className="block h-7 w-auto sm:h-8" />
          </Link>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <button
            type="button"
            aria-label="Notifications"
            className="cursor-pointer rounded-full p-2 text-slate-700 transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <LuBell size={20} aria-hidden="true" />
          </button>

          <div className="flex items-center gap-3">
            <span
              data-testid="user-avatar"
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full bg-indigo-100 text-[14px] font-semibold text-indigo-800"
            >
              {getInitials(user.name)}
            </span>
            <div className="hidden leading-tight sm:block">
              <p className="text-[14px] font-medium text-slate-950">{user.name}</p>
              <p className="text-[12px] text-slate-500">{user.role}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {open && (
          <div
            data-testid="sidebar-backdrop"
            aria-hidden="true"
            onClick={close}
            className="fixed inset-0 top-20 z-20 bg-slate-950/40 lg:hidden"
          />
        )}

        <aside
          id="app-sidebar"
          data-testid="app-sidebar"
          data-open={open}
          className={`fixed top-20 bottom-0 left-0 z-30 w-[260px] flex-col bg-indigo-800 ${
            open ? 'flex' : 'hidden'
          } lg:sticky lg:top-20 lg:bottom-auto lg:z-auto lg:flex lg:h-[calc(100dvh-5rem)] lg:w-[240px] lg:shrink-0`}
        >
          <nav
            aria-label="Main"
            className="flex flex-1 flex-col justify-between overflow-y-auto p-4"
          >
            <ul className="flex flex-col gap-1">
              {MAIN_NAV.map((entry) => (
                <NavItem key={entry.path} entry={entry} onNavigate={close} />
              ))}
            </ul>
            <ul className="flex flex-col gap-1">
              {FOOTER_NAV.map((entry) => (
                <NavItem key={entry.path} entry={entry} onNavigate={close} />
              ))}
            </ul>
          </nav>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col bg-indigo-50">{children}</main>
      </div>
    </div>
  );
};
