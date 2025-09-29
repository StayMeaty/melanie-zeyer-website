import React from 'react';
import { APP_CONFIG } from '../types';

interface FontComparisonProps {
  title?: string;
}

const FontComparison: React.FC<FontComparisonProps> = ({
  title = "Schriftarten-Vergleich"
}) => {
  const styles: Record<string, React.CSSProperties> = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: APP_CONFIG.colors.background,
      padding: '2rem',
      position: 'relative',
    },
    header: {
      fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
      fontWeight: '600',
      color: APP_CONFIG.colors.primary,
      textAlign: 'center',
      lineHeight: '1.2',
      marginBottom: '3rem',
      fontFamily: 'Arimo, sans-serif',
    },
    cardsContainer: {
      display: 'flex',
      gap: '2rem',
      maxWidth: '1200px',
      width: '100%',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: '2rem',
    },
    card: {
      flex: '1',
      minWidth: '450px',
      backgroundColor: '#FFFFFF',
      borderRadius: '1rem',
      padding: '2rem',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
    },
    cardHover: {
      transform: 'scale(1.05)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    },
    h1Professional: {
      fontSize: 'clamp(1.8rem, 3vw, 2.2rem)',
      fontWeight: '700',
      color: APP_CONFIG.colors.primary,
      marginBottom: '1rem',
      lineHeight: '1.2',
      fontFamily: '"Alan Sans", sans-serif',
    },
    h1Creative: {
      fontSize: 'clamp(1.8rem, 3vw, 2.2rem)',
      fontWeight: '700',
      color: APP_CONFIG.colors.primary,
      marginBottom: '1rem',
      lineHeight: '1.2',
      fontFamily: 'Kodchasan, sans-serif',
    },
    h2Professional: {
      fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
      fontWeight: '600',
      color: APP_CONFIG.colors.primary,
      marginBottom: '0.8rem',
      lineHeight: '1.3',
      fontFamily: '"Alan Sans", sans-serif',
    },
    h2Creative: {
      fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
      fontWeight: '600',
      color: APP_CONFIG.colors.primary,
      marginBottom: '0.8rem',
      lineHeight: '1.3',
      fontFamily: 'Kodchasan, sans-serif',
    },
    h3Professional: {
      fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
      fontWeight: '500',
      color: APP_CONFIG.colors.primary,
      marginBottom: '1.5rem',
      lineHeight: '1.4',
      fontFamily: '"Alan Sans", sans-serif',
    },
    h3Creative: {
      fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
      fontWeight: '500',
      color: APP_CONFIG.colors.primary,
      marginBottom: '1.5rem',
      lineHeight: '1.4',
      fontFamily: 'Kodchasan, sans-serif',
    },
    quote: {
      fontSize: 'clamp(1rem, 1.8vw, 1.1rem)',
      fontStyle: 'italic',
      color: APP_CONFIG.colors.secondary,
      marginBottom: '1.5rem',
      lineHeight: '1.6',
      borderLeft: `4px solid ${APP_CONFIG.colors.accent}`,
      paddingLeft: '1rem',
      fontFamily: 'Arimo, sans-serif',
    },
    paragraph: {
      fontSize: 'clamp(0.9rem, 1.6vw, 1rem)',
      color: APP_CONFIG.colors.secondary,
      lineHeight: '1.7',
      marginBottom: '0',
      fontFamily: 'Arimo, sans-serif',
    },
    infoBox: {
      backgroundColor: '#f8f9fa',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginTop: '1.5rem',
      borderLeft: `4px solid ${APP_CONFIG.colors.accent}`,
    },
    infoTitle: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: APP_CONFIG.colors.primary,
      marginBottom: '0.5rem',
      fontFamily: 'Arimo, sans-serif',
    },
    infoText: {
      fontSize: '0.8rem',
      color: APP_CONFIG.colors.secondary,
      lineHeight: '1.5',
      margin: '0',
      fontFamily: 'Arimo, sans-serif',
    },
  };

  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);

  const germanLorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.";

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>{title}</h1>
      
      <div style={styles.cardsContainer}>
        {/* Professional Option - Arimo + Alan Sans */}
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
            "Design ist nicht nur, wie es aussieht und sich anfühlt. Design ist, wie es funktioniert." - Steve Jobs
          </blockquote>
          
          <p style={styles.paragraph}>
            {germanLorem}
          </p>
          
          <div style={styles.infoBox}>
            <div style={styles.infoTitle}>Option 1: Professional</div>
            <p style={styles.infoText}>
              <strong>Überschriften:</strong> Alan Sans - Modern und professionell<br/>
              <strong>Fließtext:</strong> Arimo - Klar und gut lesbar<br/>
              <strong>Charakter:</strong> Seriös, vertrauenswürdig, zeitgemäß
            </p>
          </div>
        </div>

        {/* Creative Option - Arimo + Kodchasan */}
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
            "Design ist nicht nur, wie es aussieht und sich anfühlt. Design ist, wie es funktioniert." - Steve Jobs
          </blockquote>
          
          <p style={styles.paragraph}>
            {germanLorem}
          </p>
          
          <div style={styles.infoBox}>
            <div style={styles.infoTitle}>Option 2: Creative</div>
            <p style={styles.infoText}>
              <strong>Überschriften:</strong> Kodchasan - Einzigartig und ausdrucksstark<br/>
              <strong>Fließtext:</strong> Arimo - Klar und gut lesbar<br/>
              <strong>Charakter:</strong> Kreativ, individuell, freundlich
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FontComparison;