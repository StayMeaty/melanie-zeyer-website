import React from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../types';

const UeberMich: React.FC = () => {
  const styles: Record<string, React.CSSProperties> = {
    hero: {
      textAlign: 'center',
      marginBottom: '4rem',
      padding: '2rem 0',
    },
    title: {
      fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '700',
      fontFamily: "'Sumana', serif",
      marginBottom: '1.5rem',
      lineHeight: '1.2',
    },
    subtitle: {
      fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
      color: APP_CONFIG.colors.secondary,
      fontWeight: '400',
      fontFamily: "'Arimo', sans-serif",
      lineHeight: '1.6',
      maxWidth: '700px',
      margin: '0 auto',
    },
    section: {
      marginBottom: '4rem',
      padding: '3rem',
      backgroundColor: '#FFFFFF',
      borderRadius: '1rem',
      boxShadow: '0 2px 20px rgba(0, 0, 0, 0.05)',
    },
    sectionTitle: {
      fontSize: 'clamp(1.8rem, 4vw, 2.2rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '1.5rem',
    },
    sectionContent: {
      color: APP_CONFIG.colors.secondary,
      lineHeight: '1.8',
      fontSize: '1.1rem',
      fontFamily: "'Arimo', sans-serif",
      marginBottom: '1.5rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '2rem',
      marginTop: '2rem',
    },
    card: {
      padding: '2rem',
      backgroundColor: `${APP_CONFIG.colors.primary}05`,
      borderRadius: '0.75rem',
      borderLeft: `4px solid ${APP_CONFIG.colors.accent}`,
    },
    cardTitle: {
      fontSize: '1.3rem',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '1rem',
    },
    cardText: {
      color: APP_CONFIG.colors.secondary,
      lineHeight: '1.6',
      fontFamily: "'Arimo', sans-serif",
    },
    highlight: {
      backgroundColor: `${APP_CONFIG.colors.accent}20`,
      padding: '0.2rem 0.5rem',
      borderRadius: '0.3rem',
      fontWeight: '600',
    },
    ctaSection: {
      textAlign: 'center',
      padding: '3rem',
      backgroundColor: `${APP_CONFIG.colors.primary}08`,
      borderRadius: '1rem',
      marginTop: '3rem',
    },
    ctaButton: {
      display: 'inline-block',
      backgroundColor: APP_CONFIG.colors.accent,
      color: '#333',
      padding: '1rem 2rem',
      borderRadius: '2rem',
      textDecoration: 'none',
      fontWeight: '600',
      fontFamily: "'Arimo', sans-serif",
      fontSize: '1.1rem',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(232, 205, 140, 0.3)',
    },
  };

  const mobileStyles = `
    @media (max-width: 768px) {
      .section-padding {
        padding: 2rem !important;
      }
      .grid-container {
        grid-template-columns: 1fr !important;
        gap: 1.5rem !important;
      }
    }
  `;

  return (
    <>
      <style>{mobileStyles}</style>
      
      <section style={styles.hero}>
        <h1 style={styles.title}>
          Über mich
        </h1>
        <p style={styles.subtitle}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </section>

      <section className="section-padding" style={styles.section}>
        <h2 style={styles.sectionTitle}>[Ihre Geschichte hier]</h2>
        <p style={styles.sectionContent}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea 
          <span style={styles.highlight}> [Ihr Beruf]</span>.
        </p>
        <p style={styles.sectionContent}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
          quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.
        </p>
        <p style={styles.sectionContent}>
          Lorem ipsum dolor sit amet consectetur adipiscing elit <span style={styles.highlight}>[X] Jahre Erfahrung</span> 
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim 
          veniam, quis nostrud exercitation ullamco laboris.
        </p>
      </section>

      <section className="section-padding" style={styles.section}>
        <h2 style={styles.sectionTitle}>[Ihre Qualifikationen]</h2>
        <div className="grid-container" style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>[Qualifikation 1]</h3>
            <p style={styles.cardText}>
              • [Abschluss 1]<br />
              • [Zertifizierung 1]<br />
              • [Zertifizierung 2]<br />
              • [Weiterbildung 1]
            </p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>[Qualifikation 2]</h3>
            <p style={styles.cardText}>
              • [Weiterbildung 1]<br />
              • [Weiterbildung 2]<br />
              • [Weiterbildung 3]<br />
              • [Weiterbildung 4]
            </p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>[Qualifikation 3]</h3>
            <p style={styles.cardText}>
              • [Mitgliedschaft 1]<br />
              • [Mitgliedschaft 2]<br />
              • [Mitgliedschaft 3]<br />
              • [Mitgliedschaft 4]
            </p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>[Qualifikation 4]</h3>
            <p style={styles.cardText}>
              • [X]+ Jahre Erfahrung<br />
              • [X]+ erfolgreiche Projekte<br />
              • [Leistung 1]<br />
              • [Leistung 2]
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding" style={styles.section}>
        <h2 style={styles.sectionTitle}>[Ihr Ansatz]</h2>
        <p style={styles.sectionContent}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
          quis nostrud <span style={styles.highlight}>[Ihre Rolle]</span> 
          exercitation ullamco laboris nisi ut aliquip ex ea commodo.
        </p>
        <p style={styles.sectionContent}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
          quis nostrud exercitation ullamco laboris nisi ut aliquip.
        </p>
        <p style={styles.sectionContent}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
          quis nostrud exercitation ullamco laboris.
        </p>
      </section>

      <section className="section-padding" style={styles.section}>
        <h2 style={styles.sectionTitle}>[Persönliches]</h2>
        <p style={styles.sectionContent}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 
          tempor incididunt ut labore et dolore magna aliqua. [Hobbys] sunt in culpa 
          qui officia deserunt mollit anim id est laborum.
        </p>
        <p style={styles.sectionContent}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit [persönliche Details], 
          sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad 
          minim veniam, quis nostrud exercitation ullamco laboris.
        </p>
        <p style={styles.sectionContent}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 
          tempor incididunt ut labore et dolore magna aliqua. [Philosophie] 
          exercitation ullamco laboris nisi ut aliquip.
        </p>
      </section>

      <div style={styles.ctaSection}>
        <h2 style={styles.sectionTitle}>Lassen Sie uns kennenlernen</h2>
        <p style={styles.sectionContent}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 
          tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <Link 
          to="/preview/coaching" 
          style={styles.ctaButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(232, 205, 140, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(232, 205, 140, 0.3)';
          }}
        >
          Erstgespräch vereinbaren
        </Link>
      </div>
    </>
  );
};

export default UeberMich;