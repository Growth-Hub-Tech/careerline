import { useState } from 'react';
import { useNavigate, type To } from 'react-router-dom';
import { LuChevronDown, LuMenu, LuX } from 'react-icons/lu';
import { Button } from '../Button';

interface NavLink {
  readonly label: string;
  readonly hasDropdown?: boolean;
}

const NAV_LINKS: readonly NavLink[] = [
  { label: 'Home' },
  { label: 'Products', hasDropdown: true },
  { label: 'Resources', hasDropdown: true },
  { label: 'Pricing' },
];

export const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (path: To) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <nav className="w-full border-b border-[#f2f4f7] bg-[#f1f2fc]">
      <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-6 lg:px-8">
        <button
          type="button"
          className="text-[17px] font-bold tracking-tight text-[#1f2a44]"
          onClick={() => handleNavigate('/')}
        >
          CareerLine AI
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ label, hasDropdown }) => (
            <button
              key={label}
              type="button"
              className="flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-[#063ccd]"
            >
              {label}
              {hasDropdown && <LuChevronDown size={14} />}
            </button>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-6 md:flex">
          <button
            type="button"
            className="shrink-0 text-sm font-medium whitespace-nowrap text-gray-600 hover:text-[#063ccd]"
            onClick={() => handleNavigate('/sign-in')}
          >
            Log in
          </button>
          <Button
            variant="primary"
            className="rounded-full bg-[#063ccd] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#052fa3]"
            onClick={() => handleNavigate('/question')}
          >
            Take a test
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="text-[#1f2a44] md:hidden"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? <LuX size={24} /> : <LuMenu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="flex flex-col gap-4 border-t border-[#f2f4f7] px-6 py-5 md:hidden">
          {NAV_LINKS.map(({ label }) => (
            <button
              key={label}
              type="button"
              className="text-left text-sm font-medium text-gray-600"
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            className="text-left text-sm font-medium text-gray-600"
            onClick={() => handleNavigate('/sign-in')}
          >
            Log in
          </button>
          <Button
            variant="primary"
            className="w-fit rounded-full bg-[#063ccd] px-4 py-3 text-sm font-semibold text-white hover:bg-[#052fa3]"
            onClick={() => handleNavigate('/question')}
          >
            Take a test
          </Button>
        </div>
      )}
    </nav>
  );
};
