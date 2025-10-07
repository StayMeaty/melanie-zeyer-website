import React from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../types';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const styles: Record<string, React.CSSProperties> = {
    footer: {
      backgroundColor: '#FFFFFF',
      borderTop: `1px solid ${APP_CONFIG.colors.secondary}20`,
      padding: '2rem',
      marginTop: 'auto',
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    copyright: {
      color: APP_CONFIG.colors.secondary,
      fontSize: '0.9rem',
      fontFamily: "'Arimo', sans-serif",
    },
    links: {
      display: 'flex',
      gap: '2rem',
      alignItems: 'center',
    },
    link: {
      color: APP_CONFIG.colors.secondary,
      textDecoration: 'none',
      fontSize: '0.9rem',
      fontFamily: "'Arimo', sans-serif",
      transition: 'color 0.3s ease',
    },
    linkHover: {
      color: APP_CONFIG.colors.primary,
    },
  };

  // Media query for mobile
  const mobileStyles = `
    @media (max-width: 768px) {
      .footer-container {
        flex-direction: column !important;
        text-align: center !important;
      }
    }
  `;

  return (
    <>
      <style>{mobileStyles}</style>
      <footer style={styles.footer}>
        <div 
          className="footer-container"
          style={styles.container}
        >
          <div style={styles.copyright}>
            © {currentYear} MZ Coaching. Alle Rechte vorbehalten.
          </div>
          
          <div style={styles.links}>
            <Link 
              to="/preview/impressum" 
              style={styles.link}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = styles.linkHover.color as string;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = styles.link.color as string;
              }}
            >
              Impressum
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;