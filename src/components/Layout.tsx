import React from 'react';
import { Outlet } from 'react-router-dom';
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
  };

  // Mobile responsive styles
  const mobileStyles = `
    @media (max-width: 768px) {
      .layout-main {
        padding: 2rem 1rem 1rem !important;
        margin-top: 5rem !important;
      }
    }
  `;

  return (
    <>
      <style>{mobileStyles}</style>
      <div style={styles.container}>
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