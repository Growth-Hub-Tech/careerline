import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LuChevronDown, LuMenu, LuX } from 'react-icons/lu';
import { Button } from '../Button';

interface NavChild {
  readonly label: string;
  readonly path: string;
}

interface NavItem {
  readonly label: string;
  readonly path?: string;
  readonly children?: readonly NavChild[];
}

// Update the paths/children to match your real routes.
const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home', path: '/' },
  {
    label: 'Products',
    children: [
      { label: 'Skill tests', path: '/products/skill-tests' },
      { label: 'Career paths', path: '/products/career-paths' },
    ],
  },
  {
    label: 'Resources',
    children: [
      { label: 'Blog', path: '/resources/blog' },
      { label: 'Guides', path: '/resources/guides' },
    ],
  },
  { label: 'Pricing', path: '/pricing' },
];

const linkBase =
  'flex items-center gap-1 rounded-md text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#063ccd]';

export const Navbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Close everything when the route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // Close desktop dropdown on outside click or Escape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Prevent background scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const go = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
    setOpenDropdown(null);
  };

  const isActive = (item: NavItem) =>
    item.path === pathname || item.children?.some((c) => pathname.startsWith(c.path));

  const toggleDropdown = (label: string) =>
    setOpenDropdown((prev) => (prev === label ? null : label));

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 w-full border-b border-[#e4e7f5] bg-[#f1f2fc]/95 backdrop-blur"
    >
      {/* 3-column grid keeps the links truly centered regardless of logo/actions width */}
      <div className="mx-auto grid h-20 w-full max-w-[1280px] grid-cols-[1fr_auto] items-center px-5 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        {/* Logo */}
        <button
          type="button"
          className="justify-self-start text-[17px] font-bold tracking-tight text-[#1f2a44]"
          onClick={() => go('/')}
        >
          CareerLine AI
        </button>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            const colour = active ? 'text-[#063ccd]' : 'text-gray-600 hover:text-[#063ccd]';

            if (!item.children) {
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    className={`${linkBase} ${colour}`}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => item.path && go(item.path)}
                  >
                    {item.label}
                  </button>
                </li>
              );
            }

            const open = openDropdown === item.label;
            return (
              <li key={item.label} className="relative">
                <button
                  type="button"
                  className={`${linkBase} ${colour}`}
                  aria-haspopup="true"
                  aria-expanded={open}
                  onClick={() => toggleDropdown(item.label)}
                >
                  {item.label}
                  <LuChevronDown
                    size={14}
                    className={`transition-transform ${open ? 'rotate-180' : ''}`}
                  />
                </button>

                {open && (
                  <ul className="absolute left-1/2 top-full mt-3 min-w-48 -translate-x-1/2 rounded-xl border border-[#e4e7f5] bg-white p-2 shadow-lg">
                    {item.children.map((child) => (
                      <li key={child.path}>
                        <button
                          type="button"
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-[#f1f2fc] hover:text-[#063ccd]"
                          onClick={() => go(child.path)}
                        >
                          {child.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        {/* Desktop actions */}
        <div className="hidden items-center justify-self-end gap-6 lg:flex">
          <button
            type="button"
            className={`${linkBase} whitespace-nowrap text-gray-600 hover:text-[#063ccd]`}
            onClick={() => go('/sign-in')}
          >
            Log in
          </button>
          <Button
            variant="primary"
            className="rounded-full bg-[#063ccd] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#052fa3]"
            onClick={() => go('/question')}
          >
            Take a test
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="justify-self-end rounded-md p-1 text-[#1f2a44] lg:hidden"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? <LuX size={24} /> : <LuMenu size={24} />}
        </button>
      </div>

      {/* Mobile menu: links on top, actions pinned at the bottom */}
      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="flex h-[calc(100dvh-5rem)] flex-col border-t border-[#e4e7f5] bg-[#f1f2fc] lg:hidden"
        >
          <ul className="flex-1 overflow-y-auto px-5 py-2 sm:px-6">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);

              if (!item.children) {
                return (
                  <li key={item.label} className="border-b border-[#e4e7f5]">
                    <button
                      type="button"
                      className={`w-full py-4 text-left text-base font-medium ${
                        active ? 'text-[#063ccd]' : 'text-[#1f2a44]'
                      }`}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => item.path && go(item.path)}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              }

              const open = openDropdown === item.label;
              return (
                <li key={item.label} className="border-b border-[#e4e7f5]">
                  <button
                    type="button"
                    className={`flex w-full items-center justify-between py-4 text-left text-base font-medium ${
                      active ? 'text-[#063ccd]' : 'text-[#1f2a44]'
                    }`}
                    aria-expanded={open}
                    onClick={() => toggleDropdown(item.label)}
                  >
                    {item.label}
                    <LuChevronDown
                      size={18}
                      className={`transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {open && (
                    <ul className="pb-3 pl-3">
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <button
                            type="button"
                            className="w-full py-2.5 text-left text-sm text-gray-600 hover:text-[#063ccd]"
                            onClick={() => go(child.path)}
                          >
                            {child.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-3 border-t border-[#e4e7f5] px-5 py-5 sm:px-6">
            <Button
              variant="primary"
              className="w-full rounded-full bg-[#063ccd] px-4 py-3 text-sm font-semibold text-white hover:bg-[#052fa3]"
              onClick={() => go('/question')}
            >
              Take a test
            </Button>
            <button
              type="button"
              className="w-full rounded-full border border-[#c9cff0] px-4 py-3 text-sm font-semibold text-[#1f2a44] hover:border-[#063ccd] hover:text-[#063ccd]"
              onClick={() => go('/sign-in')}
            >
              Log in
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
