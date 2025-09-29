import React from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../types';

const Startseite: React.FC = () => {
  const styles: Record<string, React.CSSProperties> = {
    hero: {
      textAlign: 'center',
      marginBottom: '4rem',
      padding: '3rem 0',
    },
    title: {
      fontSize: 'clamp(2.5rem, 6vw, 4rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '700',
      fontFamily: "'Sumana', serif",
      marginBottom: '1.5rem',
      lineHeight: '1.2',
    },
    subtitle: {
      fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
      color: APP_CONFIG.colors.secondary,
      fontWeight: '400',
      fontFamily: "'Arimo', sans-serif",
      lineHeight: '1.6',
      maxWidth: '800px',
      margin: '0 auto 2rem',
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
    section: {
      marginBottom: '4rem',
      padding: '3rem',
      backgroundColor: '#FFFFFF',
      borderRadius: '1rem',
      boxShadow: '0 2px 20px rgba(0, 0, 0, 0.05)',
    },
    sectionTitle: {
      fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '1.5rem',
      textAlign: 'center',
    },
    sectionContent: {
      color: APP_CONFIG.colors.secondary,
      lineHeight: '1.8',
      fontSize: '1.1rem',
      fontFamily: "'Arimo', sans-serif",
      textAlign: 'center',
      maxWidth: '800px',
      margin: '0 auto',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      marginTop: '3rem',
    },
    card: {
      padding: '2.5rem',
      backgroundColor: `${APP_CONFIG.colors.primary}05`,
      borderRadius: '1rem',
      borderLeft: `4px solid ${APP_CONFIG.colors.accent}`,
      textAlign: 'center',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    cardTitle: {
      fontSize: '1.4rem',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '1rem',
    },
    cardText: {
      color: APP_CONFIG.colors.secondary,
      lineHeight: '1.6',
      fontFamily: "'Arimo', sans-serif",
      marginBottom: '1.5rem',
    },
    cardLink: {
      color: APP_CONFIG.colors.primary,
      textDecoration: 'none',
      fontWeight: '600',
      fontFamily: "'Arimo', sans-serif",
      fontSize: '0.95rem',
      transition: 'color 0.3s ease',
    },
  };

  const mobileStyles = `
    @media (max-width: 768px) {
      .hero-section {
        padding: 2rem 0 !important;
      }
      .section-card {
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
      
      <section className="hero-section" style={styles.hero}>
        <h1 style={styles.title}>
          Willkommen bei [Ihr Name]
        </h1>
        <p style={styles.subtitle}>
          Ihre Expertin für professionelle Beratung, individuelles Coaching und 
          transformative Persönlichkeitsentwicklung. Lorem ipsum dolor sit amet, 
          consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
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
          Jetzt Beratung anfragen
        </Link>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          Warum [Ihr Name]?
        </h2>
        <p style={styles.sectionContent}>
          Mit über [X] Jahren Erfahrung in der Beratung und einem tiefen Verständnis 
          für menschliche Entwicklungsprozesse begleite ich Sie auf Ihrem Weg zu 
          persönlichem und beruflichem Erfolg. Lorem ipsum dolor sit amet, consectetur 
          adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          Meine Leistungen
        </h2>
        <div className="grid-container" style={styles.grid}>
          <div 
            className="section-card"
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <h3 style={styles.cardTitle}>Service 1</h3>
            <p style={styles.cardText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore.
            </p>
            <Link 
              to="/preview/coaching" 
              style={styles.cardLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = APP_CONFIG.colors.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = APP_CONFIG.colors.primary;
              }}
            >
              Mehr erfahren →
            </Link>
          </div>

          <div 
            className="section-card"
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <h3 style={styles.cardTitle}>Service 2</h3>
            <p style={styles.cardText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <Link 
              to="/preview/kurse" 
              style={styles.cardLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = APP_CONFIG.colors.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = APP_CONFIG.colors.primary;
              }}
            >
              Kurse entdecken →
            </Link>
          </div>

          <div 
            className="section-card"
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <h3 style={styles.cardTitle}>Service 3</h3>
            <p style={styles.cardText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore magna.
            </p>
            <Link 
              to="/preview/coaching" 
              style={styles.cardLink}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = APP_CONFIG.colors.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = APP_CONFIG.colors.primary;
              }}
            >
              Business Coaching →
            </Link>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          Bereit für Veränderung?
        </h2>
        <p style={styles.sectionContent}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim 
          veniam, quis nostrud exercitation ullamco laboris.
        </p>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
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
            Kostenloses Erstgespräch vereinbaren
          </Link>
        </div>
      </section>
    </>
  );
};

export default Startseite;