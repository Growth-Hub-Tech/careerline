// import { Button } from '../Button';
// import logo from '../../assests/careerLine.svg';
// import './Navbar.scss';
// import { useTheme } from '../../hooks/useTheme';
// import { MdLightMode, MdDarkMode } from 'react-icons/md';
// import { useState, useEffect, useCallback } from 'react';
// import { Link, useNavigate } from 'react-router-dom';

// export const Navbar = () => {
//   const navigate = useNavigate();
//   const [scrolled, setScrolled] = useState(false);
//   const [menuOpen, setMenuOpen] = useState(false);
//   const { theme, setTheme } = useTheme();

//   useEffect(() => {
//     const handleScroll = () => {
//       setScrolled(window.scrollY > 20);
//     };

//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   useEffect(() => {
//     if (menuOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = '';
//     }
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, [menuOpen]);

//   const toggleTheme = () => {
//     setTheme(theme === 'light' ? 'dark' : 'light');
//   };

//   const toggleMenu = useCallback(() => {
//     setMenuOpen((prev) => !prev);
//   }, []);

//   const closeMenu = useCallback(() => {
//     setMenuOpen(false);
//   }, []);

//   const handleNavigation = useCallback(
//     (path: string) => {
//       navigate(path);
//       closeMenu();
//     },
//     [navigate, closeMenu],
//   );

//   const getIcon = () => {
//     if (theme === 'light') return <MdLightMode size={24} />;
//     return <MdDarkMode size={24} />;
//   };

//   return (
//     <>
//       <nav className={scrolled ? 'scrolled' : ''}>
//         <div className="logo">
//           <a href="/">
//             <img src={logo} alt="careerline logo" />
//           </a>
//         </div>

//         <div className="nav-actions desktop-nav">
//           <Link to="/contact">Contact</Link>
//           <Button variant="primary" onClick={() => navigate('/question')}>
//             Take A Test
//           </Button>
//           <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
//             {getIcon()}
//           </button>
//         </div>

//         <div className="mobile-nav-controls">
//           <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
//             {getIcon()}
//           </button>
//           <button
//             className={`hamburger ${menuOpen ? 'active' : ''}`}
//             onClick={toggleMenu}
//             aria-label="Toggle menu"
//             aria-expanded={menuOpen}
//           >
//             <span className="hamburger-line" />
//             <span className="hamburger-line" />
//             <span className="hamburger-line" />
//           </button>
//         </div>
//       </nav>

//       <div className={`mobile-menu-overlay ${menuOpen ? 'active' : ''}`} onClick={closeMenu} />

//       <div className={`mobile-menu ${menuOpen ? 'active' : ''}`}>
//         <div className="mobile-menu-content">
//           <Link to="/contact" className="mobile-nav-link" onClick={closeMenu}>
//             Contact
//           </Link>
//           <div className="mobile-menu-divider" />
//           <div className="mobile-menu-cta">
//             <Button variant="primary" onClick={() => handleNavigation('/question')}>
//               Take A Test
//             </Button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

import { Button } from '../Button';
import './Navbar.scss';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav>
      <span className="logo">CareerLine AI</span>

      <div className="nav-actions">
        <Button variant="primary" className="nav-cta-btn" onClick={() => navigate('/question')}>
          Get started
        </Button>
        <span className="nav-signin" onClick={() => navigate('/sign-in')}>
          Sign in
        </span>
      </div>
    </nav>
  );
};
