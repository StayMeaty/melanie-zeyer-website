import React, { useRef, useEffect, useState } from 'react';
import { APP_CONFIG } from '../types';
import Logo from './Logo';
import ParticleEffect from './ParticleEffect';
import SparkleButton from './SparkleButton';

interface ComingSoonProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  title = APP_CONFIG.title,
  subtitle = APP_CONFIG.subtitle,
  showLogo = true
}) => {
  const logoRef = useRef<HTMLDivElement>(null);
  const [logoPosition, setLogoPosition] = useState({ x: 0, y: 0 });

  // Update logo position for particle effect
  useEffect(() => {
    const updateLogoPosition = () => {
      if (logoRef.current) {
        const rect = logoRef.current.getBoundingClientRect();
        setLogoPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    };

    updateLogoPosition();
    window.addEventListener('resize', updateLogoPosition);
    
    return () => {
      window.removeEventListener('resize', updateLogoPosition);
    };
  }, []);
  const styles: Record<string, React.CSSProperties> = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: APP_CONFIG.colors.background,
      position: 'relative',
      zIndex: 2,
      paddingBottom: '5rem', // Space for fixed footer
    },
    heroSection: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
    },
    logoContainer: {
      marginBottom: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heading: {
      fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
      fontWeight: '600',
      color: APP_CONFIG.colors.primary,
      textAlign: 'center',
      lineHeight: '1.2',
      marginBottom: '1rem',
    },
    subtext: {
      fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
      color: APP_CONFIG.colors.secondary,
      textAlign: 'center',
      maxWidth: '600px',
      lineHeight: '1.5',
    },
    footer: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid #E0E0E0',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 4,
    },
    footerLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      textDecoration: 'none',
      color: '#000000',
      fontSize: '0.9rem',
      fontWeight: '500',
      transition: 'opacity 0.2s',
    },
    baskLogo: {
      height: '24px',
      width: 'auto',
    },
  };

  return (
    <div style={styles.container}>
      {/* Particle Effect - render behind everything */}
      <ParticleEffect logoPosition={logoPosition} />

      {/* Hero Section */}
      <div style={styles.heroSection}>
        {showLogo && (
          <div ref={logoRef} style={{...styles.logoContainer, position: 'relative', zIndex: 3}}>
            <Logo alt="Melanie Logo" size={480} />
          </div>
        )}

        <h1 style={styles.heading}>
          {title}
        </h1>

        <p style={styles.subtext}>
          {subtitle}
        </p>

        <div style={{ marginTop: '2rem' }}>
          <SparkleButton variant="secondary">
            Bald verfügbar
          </SparkleButton>
        </div>
      </div>

      {/* Footer with Bask Tech logo */}
      <div style={styles.footer}>
        <a
          href="https://www.bask-tech.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.footerLink}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <span>Powered by</span>
          <img
            src="/assets/bask-tech-logo.svg"
            alt="Bask Tech"
            style={styles.baskLogo}
          />
        </a>
      </div>
    </div>
  );
};

export default ComingSoon;