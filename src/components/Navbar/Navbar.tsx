import { useState } from 'react';
import { Button } from '../Button';
import './Navbar.scss';
import { useNavigate, type To } from 'react-router-dom';
import indigo from '../../assests/indigo.png';

export const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (path: To) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <nav>
      <div className="logo cursor-pointer flex items-center" onClick={() => handleNavigate('/')}>
        <img src={indigo} alt="CareerLine logo" />
      </div>

      <button
        className="menu-toggle"
        aria-label="Toggle menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((prev) => !prev)}
      >
        {isMenuOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      <div className={`nav-actions${isMenuOpen ? ' open' : ''}`}>
        <Button
          variant="primary"
          className="nav-cta-btn"
          onClick={() => handleNavigate('/question')}
        >
          Get started
        </Button>

        <span className="nav-signin" onClick={() => handleNavigate('/sign-in')}>
          Sign in
        </span>
      </div>
    </nav>
  );
};
