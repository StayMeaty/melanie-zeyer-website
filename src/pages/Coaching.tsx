import React from 'react';
import { APP_CONFIG } from '../types';

const Coaching: React.FC = () => {
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
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '2.5rem',
      marginTop: '3rem',
    },
    serviceCard: {
      padding: '2.5rem',
      backgroundColor: '#FFFFFF',
      borderRadius: '1rem',
      border: `2px solid ${APP_CONFIG.colors.primary}15`,
      transition: 'all 0.3s ease',
      position: 'relative',
    },
    serviceHeader: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: `2px solid ${APP_CONFIG.colors.accent}`,
    },
    serviceIcon: {
      width: '50px',
      height: '50px',
      backgroundColor: APP_CONFIG.colors.accent,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '1rem',
      fontSize: '1.5rem',
      flexShrink: 0,
    },
    serviceTitle: {
      fontSize: '1.4rem',
      color: APP_CONFIG.colors.primary,
      fontWeight: '700',
      fontFamily: "'Sumana', serif",
      margin: 0,
    },
    serviceDescription: {
      color: APP_CONFIG.colors.secondary,
      lineHeight: '1.6',
      fontFamily: "'Arimo', sans-serif",
      marginBottom: '1.5rem',
    },
    serviceFeatures: {
      listStyle: 'none',
      padding: 0,
      margin: '1.5rem 0',
    },
    serviceFeature: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '0.75rem',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
    },
    featureIcon: {
      width: '16px',
      height: '16px',
      backgroundColor: APP_CONFIG.colors.primary,
      borderRadius: '50%',
      marginRight: '0.75rem',
      marginTop: '0.25rem',
      flexShrink: 0,
    },
    priceTag: {
      display: 'inline-block',
      backgroundColor: `${APP_CONFIG.colors.primary}10`,
      color: APP_CONFIG.colors.primary,
      padding: '0.5rem 1rem',
      borderRadius: '1rem',
      fontSize: '0.9rem',
      fontWeight: '600',
      fontFamily: "'Arimo', sans-serif",
      marginBottom: '1.5rem',
    },
    ctaButton: {
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
    processSection: {
      backgroundColor: `${APP_CONFIG.colors.primary}05`,
      borderRadius: '1rem',
      padding: '3rem',
      textAlign: 'center',
    },
    processGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '2rem',
      marginTop: '2rem',
    },
    processStep: {
      padding: '1.5rem',
      backgroundColor: '#FFFFFF',
      borderRadius: '0.75rem',
      textAlign: 'center',
    },
    stepNumber: {
      width: '40px',
      height: '40px',
      backgroundColor: APP_CONFIG.colors.accent,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#333',
    },
    stepTitle: {
      fontSize: '1.1rem',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '0.5rem',
    },
    stepDescription: {
      color: APP_CONFIG.colors.secondary,
      fontSize: '0.9rem',
      fontFamily: "'Arimo', sans-serif",
      lineHeight: '1.5',
    },
    contactSection: {
      backgroundColor: APP_CONFIG.colors.accent,
      borderRadius: '1rem',
      padding: '3rem',
      textAlign: 'center',
      color: '#333',
    },
    contactTitle: {
      fontSize: '1.8rem',
      fontWeight: '700',
      fontFamily: "'Sumana', serif",
      marginBottom: '1rem',
      color: '#333',
    },
    contactText: {
      fontSize: '1.1rem',
      fontFamily: "'Arimo', sans-serif",
      lineHeight: '1.6',
      marginBottom: '2rem',
      maxWidth: '600px',
      margin: '0 auto 2rem',
    },
    contactInfo: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem',
      marginTop: '2rem',
    },
    contactItem: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      padding: '1.5rem',
      borderRadius: '0.75rem',
      backdropFilter: 'blur(10px)',
    },
    contactLabel: {
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      fontSize: '1.1rem',
      marginBottom: '0.5rem',
    },
    contactValue: {
      fontFamily: "'Arimo', sans-serif",
      lineHeight: '1.5',
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
      .service-card {
        padding: 2rem !important;
      }
      .process-grid {
        grid-template-columns: 1fr !important;
      }
      .contact-info {
        grid-template-columns: 1fr !important;
      }
    }
  `;

  const services = [
    {
      icon: '👤',
      title: 'Einzelcoaching',
      description: 'Individuelle Begleitung für persönliche und berufliche Herausforderungen. Vertraulich, intensiv und ganz auf Ihre Bedürfnisse zugeschnitten.',
      features: [
        'Persönliche 1:1 Sitzungen',
        'Flexible Termingestaltung',
        'Individuelle Methoden und Ansätze',
        'Begleitende Materialien',
        'Follow-up Sessions nach Bedarf'
      ],
      price: 'Ab 120€ pro Sitzung'
    },
    {
      icon: '👥',
      title: 'Team Coaching',
      description: 'Stärken Sie Ihr Team durch professionelle Begleitung bei Veränderungsprozessen, Konfliktlösung und Teambildung.',
      features: [
        'Teamdynamik-Analyse',
        'Kommunikationsverbesserung',
        'Konfliktlösung im Team',
        'Zielfindung und -erreichung',
        'Nachhaltige Strategien'
      ],
      price: 'Individuelles Angebot'
    },
    {
      icon: '🏢',
      title: 'Business Coaching',
      description: 'Führungskräfte-Coaching und Organisationsentwicklung für nachhaltigen Unternehmenserfolg und zufriedene Mitarbeiter.',
      features: [
        'Führungskompetenz entwickeln',
        'Change Management',
        'Strategische Planung',
        'Mitarbeitermotivation',
        'Unternehmenskultur gestalten'
      ],
      price: 'Ab 150€ pro Sitzung'
    },
    {
      icon: '🎯',
      title: 'Zielerreichungs-Coaching',
      description: 'Systematische Begleitung auf dem Weg zu Ihren wichtigsten Lebens- und Karrierezielen mit bewährten Coaching-Methoden.',
      features: [
        'Klare Zieldefinition',
        'Strategische Planung',
        'Hindernisse überwinden',
        'Motivation aufrechterhalten',
        'Erfolg messbar machen'
      ],
      price: 'Paket ab 600€'
    },
    {
      icon: '🌱',
      title: 'Persönlichkeitsentwicklung',
      description: 'Entdecken Sie Ihr volles Potenzial und entwickeln Sie eine starke, authentische Persönlichkeit für alle Lebensbereiche.',
      features: [
        'Selbstreflexion und -erkenntnis',
        'Stärken identifizieren',
        'Selbstvertrauen aufbauen',
        'Authentizität entwickeln',
        'Lebensqualität verbessern'
      ],
      price: 'Ab 100€ pro Sitzung'
    },
    {
      icon: '⚖️',
      title: 'Work-Life-Balance',
      description: 'Finden Sie das richtige Gleichgewicht zwischen Beruf, Familie und persönlichen Bedürfnissen für ein erfülltes Leben.',
      features: [
        'Prioritäten klären',
        'Zeitmanagement optimieren',
        'Grenzen setzen lernen',
        'Stress reduzieren',
        'Lebenszufriedenheit steigern'
      ],
      price: 'Paket ab 450€'
    }
  ];

  const processSteps = [
    {
      number: '1',
      title: 'Erstgespräch',
      description: 'Kostenloses 30-minütiges Kennenlerngespräch zum Klären Ihrer Anliegen und Ziele.'
    },
    {
      number: '2',
      title: 'Auftragsklärung',
      description: 'Gemeinsame Definition der Coaching-Ziele und des passenden Vorgehens.'
    },
    {
      number: '3',
      title: 'Coaching-Prozess',
      description: 'Regelmäßige Sitzungen mit bewährten Methoden und individueller Begleitung.'
    },
    {
      number: '4',
      title: 'Integration',
      description: 'Nachhaltiges Verankern der Erkenntnisse und Veränderungen im Alltag.'
    }
  ];

  return (
    <>
      <style>{mobileStyles}</style>
      
      <section style={styles.hero}>
        <h1 style={styles.title}>
          Coaching & Beratung
        </h1>
        <p style={styles.subtitle}>
          Professionelle Begleitung für Ihre persönliche und berufliche Entwicklung. 
          Entdecken Sie Ihr Potenzial und erreichen Sie Ihre Ziele.
        </p>
      </section>

      <section className="section-padding" style={styles.section}>
        <h2 style={styles.sectionTitle}>Meine Coaching-Angebote</h2>
        <p style={styles.sectionContent}>
          Jeder Mensch ist einzigartig - deshalb gestalte ich jeden Coaching-Prozess 
          individuell und passend zu Ihren spezifischen Bedürfnissen und Zielen.
        </p>
        
        <div className="grid-container" style={styles.grid}>
          {services.map((service, index) => (
            <div 
              key={index}
              className="service-card"
              style={styles.serviceCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 151, 178, 0.15)';
                e.currentTarget.style.borderColor = `${APP_CONFIG.colors.primary}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = `${APP_CONFIG.colors.primary}15`;
              }}
            >
              <div style={styles.serviceHeader}>
                <div style={styles.serviceIcon}>{service.icon}</div>
                <h3 style={styles.serviceTitle}>{service.title}</h3>
              </div>
              
              <p style={styles.serviceDescription}>
                {service.description}
              </p>
              
              <ul style={styles.serviceFeatures}>
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} style={styles.serviceFeature}>
                    <div style={styles.featureIcon}></div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div style={styles.priceTag}>
                {service.price}
              </div>
              
              <button
                style={styles.ctaButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#d4b86a';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = APP_CONFIG.colors.accent;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Erstgespräch vereinbaren
              </button>
            </div>
          ))}
        </div>
      </section>

      <div style={styles.processSection}>
        <h2 style={styles.sectionTitle}>Wie läuft ein Coaching ab?</h2>
        <p style={styles.sectionContent}>
          Ein strukturierter Prozess für nachhaltige Veränderungen
        </p>
        
        <div className="process-grid" style={styles.processGrid}>
          {processSteps.map((step, index) => (
            <div key={index} style={styles.processStep}>
              <div style={styles.stepNumber}>{step.number}</div>
              <h4 style={styles.stepTitle}>{step.title}</h4>
              <p style={styles.stepDescription}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      <section className="section-padding" style={styles.section}>
        <h2 style={styles.sectionTitle}>Warum Coaching mit mir?</h2>
        <p style={styles.sectionContent}>
          Als systemischer Coach mit über 15 Jahren Erfahrung bringe ich eine 
          einzigartige Kombination aus fachlicher Kompetenz, menschlicher Wärme 
          und bewährten Methoden mit. Mein Fokus liegt darauf, Sie dabei zu unterstützen, 
          Ihre eigenen Lösungen zu finden und nachhaltige Veränderungen zu bewirken.
        </p>
        <p style={styles.sectionContent}>
          Ich arbeite ressourcenorientiert, lösungsfokussiert und immer mit dem 
          Respekt vor Ihrer Autonomie und Ihren individuellen Werten. Vertraulichkeit, 
          Professionalität und eine vertrauensvolle Atmosphäre sind die Grundlage 
          unserer Zusammenarbeit.
        </p>
      </section>

      <div style={styles.contactSection}>
        <h2 style={styles.contactTitle}>
          Bereit für den ersten Schritt?
        </h2>
        <p style={styles.contactText}>
          Ich freue mich darauf, Sie kennenzulernen und gemeinsam herauszufinden, 
          wie ich Sie auf Ihrem Weg unterstützen kann. Vereinbaren Sie noch heute 
          Ihr kostenloses Erstgespräch.
        </p>
        
        <div className="contact-info" style={styles.contactInfo}>
          <div style={styles.contactItem}>
            <div style={styles.contactLabel}>E-Mail</div>
            <div style={styles.contactValue}>kontakt@melaniezeyer.de</div>
          </div>
          <div style={styles.contactItem}>
            <div style={styles.contactLabel}>Telefon</div>
            <div style={styles.contactValue}>+49 (0) 123 456 789</div>
          </div>
          <div style={styles.contactItem}>
            <div style={styles.contactLabel}>Erstgespräch</div>
            <div style={styles.contactValue}>Kostenlos & unverbindlich</div>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem' }}>
          <button
            style={{
              ...styles.ctaButton,
              backgroundColor: '#FFFFFF',
              color: APP_CONFIG.colors.primary,
              display: 'inline-block',
              width: 'auto',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Jetzt Termin vereinbaren
          </button>
        </div>
      </div>
    </>
  );
};

export default Coaching;