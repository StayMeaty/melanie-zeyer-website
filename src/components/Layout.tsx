import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';
import { APP_CONFIG } from '../types';

const Layout: React.FC = () => {
  const styles: Record<string, React.CSSProperties> = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: APP_CONFIG.colors.background,
      fontFamily: "'Arimo', sans-serif",
    },
    main: {
      flex: 1,
      marginTop: '5rem', // Account for fixed header
      padding: '4rem 2rem 2rem',
      maxWidth: '1200px',
      margin: '5rem auto 0',
      width: '100%',
    },
    backButton: {
      position: 'fixed',
      top: '2rem',
      left: '2rem',
      backgroundColor: APP_CONFIG.colors.accent,
      color: '#333',
      padding: '0.75rem 1.5rem',
      borderRadius: '2rem',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '0.9rem',
      fontFamily: "'Arimo', sans-serif",
      zIndex: 100,
      transition: 'transform 0.3s ease',
      display: 'inline-block',
    },
  };

  // Mobile responsive styles
  const mobileStyles = `
    @media (max-width: 768px) {
      .layout-main {
        padding: 2rem 1rem 1rem !important;
        margin-top: 5rem !important;
      }
      .back-button {
        top: 1rem !important;
        left: 1rem !important;
        padding: 0.5rem 1rem !important;
        font-size: 0.8rem !important;
      }
    }
  `;

  return (
    <>
      <style>{mobileStyles}</style>
      <div style={styles.container}>
        <Link 
          to="/" 
          className="back-button"
          style={styles.backButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ← Zurück
        </Link>

        <Navigation />
        
        <main 
          className="layout-main"
          style={styles.main}
        >
          <Outlet />
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Layout;