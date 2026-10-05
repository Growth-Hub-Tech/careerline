import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LuChevronDown, LuMenu, LuX } from 'react-icons/lu';
import logo from '../../assests/careerline.png';

interface NavChild {
  readonly label: string;
  readonly path: string;
}

interface NavItem {
  readonly label: string;
  readonly path?: string;
  readonly children?: readonly NavChild[];
}

const TAKE_TEST_PATH = '/beginner/sign-up';

const NAV_ITEMS: readonly NavItem[] = [
  { label: 'For Individuals', path: '/individuals' },
  { label: 'For Organizations', path: '/organizations' },
  { label: 'For Recruiters', path: '/recruiters' },
  { label: 'How it works', path: '/how-it-works' },
];

const linkBase =
  'flex items-center gap-1 rounded-md text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C5CCF]';

export const Navbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

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
      className="sticky top-0 z-50 w-full border-b-2 border-[#F2F4F7] bg-white/95 backdrop-blur"
    >
      <div className="mx-auto grid h-20 w-full max-w-7xl grid-cols-[1fr_auto] items-center px-5 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-8">
        <button
          type="button"
          className="flex h-full items-center justify-self-start self-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C5CCF]"
          onClick={() => go('/')}
          aria-label="CareerLine AI home"
        >
          <img
            src={logo}
            alt="CareerLine AI"
            decoding="async"
            className="block h-8 w-auto object-contain object-center [image-rendering:-webkit-optimized-contrast]"
          />
        </button>

        <ul className="hidden items-center gap-10 lg:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            const colour = active ? 'text-[#6C5CCF]' : 'text-[#4A4560] hover:text-[#6C5CCF]';

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
                  <ul className="absolute left-1/2 top-full mt-3 min-w-48 -translate-x-1/2 rounded-xl border border-[#eceef4] bg-white p-2 shadow-lg">
                    {item.children.map((child) => (
                      <li key={child.path}>
                        <button
                          type="button"
                          className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#4A4560] hover:bg-[#f4f2fc] hover:text-[#6C5CCF]"
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

        <div className="hidden items-center justify-self-end gap-6 lg:flex">
          <button
            type="button"
            className={`${linkBase} whitespace-nowrap text-[#1a1a2e] hover:text-[#6C5CCF]`}
            onClick={() => go('/sign-in')}
          >
            Log in
          </button>
          <button
            className="whitespace-nowrap rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            onClick={() => go(TAKE_TEST_PATH)}
          >
            Take a test
          </button>
        </div>

        <button
          type="button"
          className="justify-self-end rounded-md p-1 text-[#4A3F8C] lg:hidden"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? <LuX size={24} /> : <LuMenu size={24} />}
        </button>
      </div>

      {isMenuOpen && (
        <div
          id="mobile-menu"
          className="flex h-[calc(100dvh-5rem)] flex-col border-t border-[#eceef4] bg-white lg:hidden"
        >
          <ul className="flex-1 overflow-y-auto px-5 py-2 sm:px-6">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);

              if (!item.children) {
                return (
                  <li key={item.label} className="border-b border-[#eceef4]">
                    <button
                      type="button"
                      className={`w-full py-4 text-left text-base font-medium ${
                        active ? 'text-[#6C5CCF]' : 'text-[#4A4560]'
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
                <li key={item.label} className="border-b border-[#eceef4]">
                  <button
                    type="button"
                    className={`flex w-full items-center justify-between py-4 text-left text-base font-medium ${
                      active ? 'text-indigo-600' : 'text-[#4A4560]'
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
                            className="w-full py-2.5 text-left text-sm text-[#4A4560] hover:text-[#6C5CCF]"
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

          <div className="flex flex-col gap-3 border-t border-[#eceef4] px-5 py-5 sm:px-6">
            <button
              className="w-full rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              onClick={() => go(TAKE_TEST_PATH)}
            >
              Take a test
            </button>
            <button
              type="button"
              className="w-full rounded-full border border-[#d9d5f0] px-4 py-3 text-sm font-semibold text-[#1a1a2e] hover:border-[#6C5CCF] hover:text-[#6C5CCF]"
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
