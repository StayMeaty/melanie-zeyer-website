import React from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../types';

const Kurse: React.FC = () => {
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
      textAlign: 'center',
    },
    sectionContent: {
      color: APP_CONFIG.colors.secondary,
      lineHeight: '1.8',
      fontSize: '1.1rem',
      fontFamily: "'Arimo', sans-serif",
      textAlign: 'center',
      maxWidth: '800px',
      margin: '0 auto 2rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '2.5rem',
      marginTop: '3rem',
    },
    courseCard: {
      padding: '2.5rem',
      backgroundColor: '#FFFFFF',
      borderRadius: '1rem',
      border: `2px solid ${APP_CONFIG.colors.primary}10`,
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
    },
    courseCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 30px rgba(0, 151, 178, 0.15)',
      borderColor: `${APP_CONFIG.colors.primary}30`,
    },
    courseHeader: {
      borderBottom: `2px solid ${APP_CONFIG.colors.accent}`,
      paddingBottom: '1.5rem',
      marginBottom: '1.5rem',
    },
    courseTitle: {
      fontSize: '1.5rem',
      color: APP_CONFIG.colors.primary,
      fontWeight: '700',
      fontFamily: "'Sumana', serif",
      marginBottom: '0.5rem',
    },
    courseDuration: {
      fontSize: '0.9rem',
      color: APP_CONFIG.colors.accent,
      fontWeight: '600',
      fontFamily: "'Arimo', sans-serif",
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    courseDescription: {
      color: APP_CONFIG.colors.secondary,
      lineHeight: '1.6',
      fontFamily: "'Arimo', sans-serif",
      marginBottom: '1.5rem',
    },
    courseFeatures: {
      listStyle: 'none',
      padding: 0,
      margin: '1.5rem 0',
    },
    courseFeature: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.75rem',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
    },
    featureIcon: {
      width: '20px',
      height: '20px',
      backgroundColor: APP_CONFIG.colors.accent,
      borderRadius: '50%',
      marginRight: '1rem',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
    },
    coursePrice: {
      fontSize: '1.8rem',
      color: APP_CONFIG.colors.primary,
      fontWeight: '700',
      fontFamily: "'Sumana', serif",
      textAlign: 'center',
      marginBottom: '1.5rem',
    },
    courseButton: {
      display: 'block',
      width: '100%',
      backgroundColor: APP_CONFIG.colors.accent,
      color: '#333',
      padding: '1rem',
      borderRadius: '0.75rem',
      textDecoration: 'none',
      fontWeight: '600',
      fontFamily: "'Arimo', sans-serif",
      fontSize: '1rem',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      border: 'none',
      cursor: 'pointer',
    },
    infoBox: {
      backgroundColor: `${APP_CONFIG.colors.primary}08`,
      border: `1px solid ${APP_CONFIG.colors.primary}20`,
      borderRadius: '1rem',
      padding: '2rem',
      textAlign: 'center',
      marginBottom: '3rem',
    },
    infoTitle: {
      fontSize: '1.3rem',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '1rem',
    },
    infoText: {
      color: APP_CONFIG.colors.secondary,
      lineHeight: '1.6',
      fontFamily: "'Arimo', sans-serif",
    },
  };

  const mobileStyles = `
    @media (max-width: 768px) {
      .section-padding {
        padding: 2rem !important;
      }
      .grid-container {
        grid-template-columns: 1fr !important;
        gap: 2rem !important;
      }
      .course-card {
        padding: 2rem !important;
      }
    }
  `;

  const courses = [
    {
      title: 'Achtsamkeit im Alltag',
      duration: '8 Wochen',
      price: '299€',
      description: 'Lernen Sie, wie Sie Achtsamkeit in Ihren täglichen Routinen integrieren und mehr Gelassenheit und Präsenz entwickeln können.',
      features: [
        'Wöchentliche 90-Minuten Sessions',
        'Geführte Meditationen',
        'Praktische Übungen für den Alltag',
        'Austausch in der Gruppe',
        'Umfangreiches Arbeitsmaterial'
      ]
    },
    {
      title: 'Selbstvertrauen stärken',
      duration: '6 Wochen',
      price: '249€',
      description: 'Entdecken Sie Ihre Stärken, überwinden Sie Selbstzweifel und entwickeln Sie ein gesundes Selbstbewusstsein für alle Lebensbereiche.',
      features: [
        'Interaktive Workshops',
        'Persönlichkeitstests und Reflexion',
        'Übungen zur Stärkung des Selbstwerts',
        'Strategien gegen negative Gedanken',
        'Individuelle Zielsetzung'
      ]
    },
    {
      title: 'Work-Life-Balance',
      duration: '4 Wochen',
      price: '199€',
      description: 'Finden Sie das richtige Gleichgewicht zwischen Beruf und Privatleben und lernen Sie effektive Strategien für nachhaltiges Zeitmanagement.',
      features: [
        'Analyse der aktuellen Situation',
        'Prioritäten setzen lernen',
        'Grenzen ziehen und kommunizieren',
        'Entspannungstechniken',
        'Langfristige Strategien entwickeln'
      ]
    },
    {
      title: 'Kommunikation & Konfliktlösung',
      duration: '10 Wochen',
      price: '399€',
      description: 'Verbessern Sie Ihre Kommunikationsfähigkeiten und lernen Sie, Konflikte konstruktiv zu lösen - privat und beruflich.',
      features: [
        'Gewaltfreie Kommunikation',
        'Aktives Zuhören',
        'Körpersprache verstehen',
        'Konfliktlösungsstrategien',
        'Rollenspiele und Praxisübungen'
      ]
    },
    {
      title: 'Ziele erreichen & Träume verwirklichen',
      duration: '12 Wochen',
      price: '449€',
      description: 'Ein umfassender Kurs zur Zielfindung, Planung und Umsetzung Ihrer wichtigsten Lebensziele mit bewährten Coaching-Methoden.',
      features: [
        'Vision und Werte klären',
        'SMART-Ziele formulieren',
        'Aktionsplan entwickeln',
        'Hindernisse überwinden',
        'Motivation aufrechterhalten'
      ]
    },
    {
      title: 'Stressmanagement',
      duration: '6 Wochen',
      price: '279€',
      description: 'Lernen Sie Ihren Stress zu verstehen, entwickeln Sie persönliche Bewältigungsstrategien und finden Sie zu mehr Ruhe und Ausgeglichenheit.',
      features: [
        'Stressanalyse und -bewertung',
        'Entspannungstechniken',
        'Atemübungen und Meditation',
        'Mentale Strategien',
        'Präventive Maßnahmen'
      ]
    }
  ];

  return (
    <>
      <style>{mobileStyles}</style>
      
      <section style={styles.hero}>
        <h1 style={styles.title}>
          Kurse & Workshops
        </h1>
        <p style={styles.subtitle}>
          Entdecken Sie unsere vielfältigen Kurse zur Persönlichkeitsentwicklung 
          und finden Sie den perfekten Weg für Ihr persönliches Wachstum.
        </p>
      </section>

      <div style={styles.infoBox}>
        <h3 style={styles.infoTitle}>
          Warum Gruppenkurse?
        </h3>
        <p style={styles.infoText}>
          In unseren Kursen profitieren Sie nicht nur von bewährten Methoden und 
          professioneller Anleitung, sondern auch vom wertvollen Austausch mit 
          Gleichgesinnten. Gemeinsam wachsen macht Spaß und motiviert nachhaltig.
        </p>
      </div>

      <section className="section-padding" style={styles.section}>
        <h2 style={styles.sectionTitle}>Aktuelle Kursangebote</h2>
        <p style={styles.sectionContent}>
          Alle Kurse finden in kleinen Gruppen von maximal 8 Teilnehmern statt, 
          um eine persönliche Atmosphäre und individuellen Raum für jeden zu gewährleisten.
        </p>
        
        <div className="grid-container" style={styles.grid}>
          {courses.map((course, index) => (
            <div 
              key={index}
              className="course-card"
              style={styles.courseCard}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.courseCardHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = `${APP_CONFIG.colors.primary}10`;
              }}
            >
              <div style={styles.courseHeader}>
                <h3 style={styles.courseTitle}>{course.title}</h3>
                <div style={styles.courseDuration}>{course.duration}</div>
              </div>
              
              <p style={styles.courseDescription}>
                {course.description}
              </p>
              
              <ul style={styles.courseFeatures}>
                {course.features.map((feature, featureIndex) => (
                  <li key={featureIndex} style={styles.courseFeature}>
                    <div style={styles.featureIcon}>✓</div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div style={styles.coursePrice}>
                {course.price}
              </div>
              
              <Link
                to="/preview/coaching"
                style={styles.courseButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#d4b86a';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = APP_CONFIG.colors.accent;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Anmelden & Infos
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="section-padding" style={styles.section}>
        <h2 style={styles.sectionTitle}>Individuelle Workshops</h2>
        <p style={styles.sectionContent}>
          Neben unseren regulären Kursen bieten wir auch maßgeschneiderte Workshops 
          für Unternehmen, Teams oder private Gruppen an. Sprechen Sie uns für ein 
          individuelles Angebot an.
        </p>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link 
            to="/preview/coaching" 
            style={styles.courseButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#d4b86a';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = APP_CONFIG.colors.accent;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Workshop anfragen
          </Link>
        </div>
      </section>

      <div style={styles.infoBox}>
        <h3 style={styles.infoTitle}>
          Fragen zu den Kursen?
        </h3>
        <p style={styles.infoText}>
          Sind Sie unsicher, welcher Kurs der richtige für Sie ist? Gerne berate 
          ich Sie in einem kostenlosen Erstgespräch und finde gemeinsam mit Ihnen 
          den optimalen Weg für Ihre persönliche Entwicklung.
        </p>
        <div style={{ marginTop: '1.5rem' }}>
          <Link 
            to="/preview/coaching" 
            style={{
              ...styles.courseButton,
              display: 'inline-block',
              width: 'auto',
              padding: '0.75rem 1.5rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#d4b86a';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = APP_CONFIG.colors.accent;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Kostenlose Beratung
          </Link>
        </div>
      </div>
    </>
  );
};

export default Kurse;