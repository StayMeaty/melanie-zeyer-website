import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '../types';

interface FontComparisonProps {
  showHeader?: boolean;
}

const FontComparison: React.FC<FontComparisonProps> = ({
  showHeader = true
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const styles: Record<string, React.CSSProperties> = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: APP_CONFIG.colors.background,
      padding: isMobile ? '1.5rem 1rem' : '2rem',
      position: 'relative',
    },
    header: {
      fontSize: isMobile ? '1.5rem' : 'clamp(1.8rem, 4vw, 2.5rem)',
      fontWeight: '600',
      color: APP_CONFIG.colors.primary,
      textAlign: 'center',
      lineHeight: '1.2',
      marginBottom: isMobile ? '2rem' : '3rem',
      fontFamily: 'Arimo, sans-serif',
    },
    cardsContainer: {
      display: 'flex',
      gap: isMobile ? '1.5rem' : '2rem',
      maxWidth: '1200px',
      width: '100%',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: '2rem',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'stretch' : 'flex-start',
    },
    card: {
      flex: '1',
      minWidth: isMobile ? 'auto' : '400px',
      backgroundColor: '#FFFFFF',
      borderRadius: '1rem',
      padding: isMobile ? '1.5rem' : '2rem',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
    },
    cardHover: {
      transform: isMobile ? 'scale(1.02)' : 'scale(1.05)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    },
    h1Professional: {
      fontSize: isMobile ? '1.4rem' : 'clamp(1.8rem, 3vw, 2.2rem)',
      fontWeight: '700',
      color: APP_CONFIG.colors.primary,
      marginBottom: '1rem',
      lineHeight: '1.2',
      fontFamily: '"Alan Sans", sans-serif',
    },
    h1Creative: {
      fontSize: isMobile ? '1.4rem' : 'clamp(1.8rem, 3vw, 2.2rem)',
      fontWeight: '700',
      color: APP_CONFIG.colors.primary,
      marginBottom: '1rem',
      lineHeight: '1.2',
      fontFamily: 'Kodchasan, sans-serif',
    },
    h2Professional: {
      fontSize: isMobile ? '1.15rem' : 'clamp(1.3rem, 2.5vw, 1.6rem)',
      fontWeight: '600',
      color: APP_CONFIG.colors.primary,
      marginBottom: '0.8rem',
      lineHeight: '1.3',
      fontFamily: '"Alan Sans", sans-serif',
    },
    h2Creative: {
      fontSize: isMobile ? '1.15rem' : 'clamp(1.3rem, 2.5vw, 1.6rem)',
      fontWeight: '600',
      color: APP_CONFIG.colors.primary,
      marginBottom: '0.8rem',
      lineHeight: '1.3',
      fontFamily: 'Kodchasan, sans-serif',
    },
    h3Professional: {
      fontSize: isMobile ? '0.95rem' : 'clamp(1rem, 2vw, 1.3rem)',
      fontWeight: '600',
      color: APP_CONFIG.colors.secondary,
      marginBottom: '1rem',
      lineHeight: '1.4',
      fontFamily: '"Alan Sans", sans-serif',
    },
    h3Creative: {
      fontSize: isMobile ? '0.95rem' : 'clamp(1rem, 2vw, 1.3rem)',
      fontWeight: '600',
      color: APP_CONFIG.colors.secondary,
      marginBottom: '1rem',
      lineHeight: '1.4',
      fontFamily: 'Kodchasan, sans-serif',
    },
    quote: {
      fontSize: isMobile ? '0.85rem' : 'clamp(1rem, 1.8vw, 1.2rem)',
      fontStyle: 'italic',
      color: APP_CONFIG.colors.secondary,
      borderLeft: `4px solid ${APP_CONFIG.colors.accent}`,
      paddingLeft: '1rem',
      marginBottom: '1.5rem',
      lineHeight: '1.6',
      fontFamily: 'Arimo, sans-serif',
    },
    paragraph: {
      fontSize: isMobile ? '0.8rem' : 'clamp(0.9rem, 1.5vw, 1rem)',
      color: APP_CONFIG.colors.secondary,
      lineHeight: '1.7',
      marginBottom: '1.5rem',
      fontFamily: 'Arimo, sans-serif',
    },
    infoBox: {
      padding: isMobile ? '0.75rem' : '1rem',
      backgroundColor: `${APP_CONFIG.colors.primary}15`,
      borderRadius: '0.5rem',
      marginTop: '1rem',
    },
    infoTitle: {
      fontSize: isMobile ? '0.9rem' : '1rem',
      fontWeight: '600',
      color: APP_CONFIG.colors.primary,
      marginBottom: '0.5rem',
      fontFamily: 'Arimo, sans-serif',
    },
    infoText: {
      fontSize: isMobile ? '0.75rem' : '0.85rem',
      color: APP_CONFIG.colors.secondary,
      lineHeight: '1.5',
      fontFamily: 'Arimo, sans-serif',
    },
  };

  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div style={styles.container}>
      {showHeader && (
        <h1 style={styles.header}>Wählen Sie Ihre Schriftart-Kombination</h1>
      )}

      <div style={styles.cardsContainer}>
        {/* Option 1: Professional */}
        <div
          style={{
            ...styles.card,
            ...(hoveredCard === 'professional' ? styles.cardHover : {})
          }}
          onMouseEnter={() => setHoveredCard('professional')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h1 style={styles.h1Professional}>Große Überschrift</h1>
          <h2 style={styles.h2Professional}>Mittlere Überschrift</h2>
          <h3 style={styles.h3Professional}>Kleine Überschrift</h3>
          
          <blockquote style={styles.quote}>
            "Design ist nicht nur, wie es aussieht und sich anfühlt. Design ist, wie es funktioniert."
            <br />— Steve Jobs
          </blockquote>

          <p style={styles.paragraph}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
            nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in 
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>

          <div style={styles.infoBox}>
            <h4 style={styles.infoTitle}>Option 1 – Seriös & professionell</h4>
            <p style={styles.infoText}>
              <strong>Fließtext:</strong> Arimo (gut lesbar, neutral, ideal für längere Texte)<br />
              <strong>Überschriften:</strong> Alan Sans (modern, klar, hebt sich gut ab)<br />
              → Wirkt sauber, strukturiert und eignet sich besonders für eine seriöse oder beratende Website.
            </p>
          </div>
        </div>

        {/* Option 2: Creative */}
        <div
          style={{
            ...styles.card,
            ...(hoveredCard === 'creative' ? styles.cardHover : {})
          }}
          onMouseEnter={() => setHoveredCard('creative')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <h1 style={styles.h1Creative}>Große Überschrift</h1>
          <h2 style={styles.h2Creative}>Mittlere Überschrift</h2>
          <h3 style={styles.h3Creative}>Kleine Überschrift</h3>
          
          <blockquote style={styles.quote}>
            "Design ist nicht nur, wie es aussieht und sich anfühlt. Design ist, wie es funktioniert."
            <br />— Steve Jobs
          </blockquote>

          <p style={styles.paragraph}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
            nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in 
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>

          <div style={styles.infoBox}>
            <h4 style={styles.infoTitle}>Option 2 – Etwas kreativer & individueller</h4>
            <p style={styles.infoText}>
              <strong>Fließtext:</strong> Arimo<br />
              <strong>Überschriften:</strong> Kodchasan (freundlicher, individueller Charakter)<br />
              → Diese Kombination wirkt etwas „persönlicher" und kreativer, kann aber bei zu verspielter Anwendung weniger professionell erscheinen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontComparison;