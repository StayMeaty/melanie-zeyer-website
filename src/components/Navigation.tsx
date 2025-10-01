import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { APP_CONFIG } from '../types';

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const styles: Record<string, React.CSSProperties> = {
    header: {
      backgroundColor: '#FFFFFF',
      borderBottom: `1px solid ${APP_CONFIG.colors.secondary}20`,
      padding: '1rem 2rem',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      backdropFilter: 'blur(10px)',
      background: 'rgba(255, 255, 255, 0.95)',
    },
    nav: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: APP_CONFIG.colors.primary,
      textDecoration: 'none',
      fontFamily: "'Sumana', serif",
    },
    navMenu: {
      display: 'flex',
      gap: '2rem',
      listStyle: 'none',
      margin: 0,
      padding: 0,
    },
    navMenuMobile: {
      display: 'none',
      flexDirection: 'column',
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(10px)',
      borderTop: `1px solid ${APP_CONFIG.colors.secondary}20`,
      padding: '1rem 2rem',
      gap: '1rem',
      listStyle: 'none',
      margin: 0,
    },
    navMenuMobileOpen: {
      display: 'flex',
    },
    navLink: {
      color: APP_CONFIG.colors.secondary,
      textDecoration: 'none',
      fontSize: '1rem',
      fontWeight: '500',
      fontFamily: "'Arimo', sans-serif",
      transition: 'color 0.3s ease',
      cursor: 'pointer',
      padding: '0.5rem 0',
    },
    navLinkActive: {
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
    },
    hamburger: {
      display: 'none',
      flexDirection: 'column',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0.5rem',
      gap: '0.25rem',
    },
    hamburgerLine: {
      width: '24px',
      height: '2px',
      backgroundColor: APP_CONFIG.colors.primary,
      transition: 'all 0.3s ease',
      transformOrigin: 'center',
    },
    hamburgerLineOpen1: {
      transform: 'rotate(45deg) translate(6px, 6px)',
    },
    hamburgerLineOpen2: {
      opacity: 0,
    },
    hamburgerLineOpen3: {
      transform: 'rotate(-45deg) translate(6px, -6px)',
    },
  };

  // Media query styles for mobile
  const mobileStyles = `
    @media (max-width: 768px) {
      .nav-menu-desktop {
        display: none !important;
      }
      .hamburger {
        display: flex !important;
      }
    }
  `;

  return (
    <>
      <style>{mobileStyles}</style>
      <header style={styles.header}>
        <nav style={styles.nav}>
          <NavLink to="/preview" style={styles.logo}>
            Melanie Zeyer
          </NavLink>
          
          <ul 
            className="nav-menu-desktop"
            style={styles.navMenu}
          >
            <li>
              <NavLink 
                to="/preview" 
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
                end
              >
                Startseite
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/preview/ueber-mich" 
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
              >
                Über mich
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/preview/kurse" 
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
              >
                Kurse
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/preview/coaching" 
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
              >
                Coaching
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/preview/faq" 
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
              >
                FAQ
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/preview/blog" 
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
              >
                Blog
              </NavLink>
            </li>
          </ul>

          <button 
            className="hamburger"
            style={styles.hamburger}
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            <span 
              style={{
                ...styles.hamburgerLine,
                ...(isMobileMenuOpen ? styles.hamburgerLineOpen1 : {}),
              }}
            />
            <span 
              style={{
                ...styles.hamburgerLine,
                ...(isMobileMenuOpen ? styles.hamburgerLineOpen2 : {}),
              }}
            />
            <span 
              style={{
                ...styles.hamburgerLine,
                ...(isMobileMenuOpen ? styles.hamburgerLineOpen3 : {}),
              }}
            />
          </button>

          <ul 
            style={{
              ...styles.navMenuMobile,
              ...(isMobileMenuOpen ? styles.navMenuMobileOpen : {}),
            }}
          >
            <li>
              <NavLink 
                to="/preview" 
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
                onClick={() => setIsMobileMenuOpen(false)}
                end
              >
                Startseite
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/preview/ueber-mich" 
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Über mich
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/preview/kurse" 
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Kurse
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/preview/coaching" 
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Coaching
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/preview/faq" 
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/preview/blog" 
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
};

export default Navigation;