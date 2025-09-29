import React from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../types';

const WebsitePreview: React.FC = () => {
  const styles: Record<string, React.CSSProperties> = {
    container: {
      minHeight: '100vh',
      backgroundColor: APP_CONFIG.colors.background,
      fontFamily: 'Arimo, sans-serif',
    },
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
    },
    navMenu: {
      display: 'flex',
      gap: '2rem',
      listStyle: 'none',
      margin: 0,
      padding: 0,
    },
    navLink: {
      color: APP_CONFIG.colors.secondary,
      textDecoration: 'none',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'color 0.3s ease',
      cursor: 'pointer',
    },
    main: {
      marginTop: '5rem',
      padding: '4rem 2rem',
      maxWidth: '1200px',
      margin: '5rem auto 0',
    },
    hero: {
      textAlign: 'center',
      marginBottom: '4rem',
    },
    title: {
      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '700',
      marginBottom: '1rem',
      lineHeight: '1.2',
    },
    subtitle: {
      fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
      color: APP_CONFIG.colors.secondary,
      fontWeight: '400',
      lineHeight: '1.5',
      maxWidth: '800px',
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
      fontSize: 'clamp(1.5rem, 3vw, 2rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      marginBottom: '1.5rem',
    },
    sectionContent: {
      color: APP_CONFIG.colors.secondary,
      lineHeight: '1.8',
      fontSize: '1rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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
      fontSize: '1.25rem',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      marginBottom: '1rem',
    },
    cardText: {
      color: APP_CONFIG.colors.secondary,
      lineHeight: '1.6',
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
      zIndex: 100,
      transition: 'transform 0.3s ease',
      display: 'inline-block',
    },
  };

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.backButton}>
        ← Zurück
      </Link>

      <header style={styles.header}>
        <nav style={styles.nav}>
          <a href="#" style={styles.logo}>
            Melanie Zeyer
          </a>
          <ul style={styles.navMenu}>
            <li>
              <a href="#about" style={styles.navLink}>
                Über mich
              </a>
            </li>
            <li>
              <a href="#services" style={styles.navLink}>
                Leistungen
              </a>
            </li>
            <li>
              <a href="#contact" style={styles.navLink}>
                Kontakt
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <h1 style={styles.title}>
            Willkommen bei Melanie Zeyer
          </h1>
          <p style={styles.subtitle}>
            Ihre Expertin für professionelle Beratung und individuelle Lösungen
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Über mich</h2>
          <p style={styles.sectionContent}>
            Mit langjähriger Erfahrung und Leidenschaft begleite ich Sie auf Ihrem Weg 
            zu persönlichem und beruflichem Erfolg. Mein Ansatz kombiniert bewährte 
            Methoden mit innovativen Strategien, um maßgeschneiderte Lösungen für Ihre 
            individuellen Herausforderungen zu entwickeln.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Meine Leistungen</h2>
          <div style={styles.grid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Persönliche Beratung</h3>
              <p style={styles.cardText}>
                Individuelle Begleitung bei persönlichen Herausforderungen und 
                Entwicklungsprozessen.
              </p>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Business Coaching</h3>
              <p style={styles.cardText}>
                Professionelle Unterstützung für Führungskräfte und Teams in 
                Veränderungsprozessen.
              </p>
            </div>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Workshops & Seminare</h3>
              <p style={styles.cardText}>
                Praxisorientierte Weiterbildungen zu verschiedenen Themen der 
                Persönlichkeitsentwicklung.
              </p>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Kontakt</h2>
          <p style={styles.sectionContent}>
            Ich freue mich darauf, Sie kennenzulernen und gemeinsam Ihre Ziele zu erreichen.
            <br />
            <br />
            <strong>E-Mail:</strong> kontakt@melaniezeyer.de
            <br />
            <strong>Telefon:</strong> Auf Anfrage
            <br />
            <br />
            Vereinbaren Sie gerne ein unverbindliches Erstgespräch.
          </p>
        </section>
      </main>
    </div>
  );
};

export default WebsitePreview;