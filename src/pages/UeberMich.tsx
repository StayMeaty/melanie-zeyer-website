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
          Lernen Sie die Person hinter der Beratung kennen und erfahren Sie, 
          wie meine Leidenschaft für menschliche Entwicklung entstanden ist.
        </p>
      </section>

      <section className="section-padding" style={styles.section}>
        <h2 style={styles.sectionTitle}>Meine Geschichte</h2>
        <p style={styles.sectionContent}>
          Schon früh in meinem Leben faszinierte mich die Frage, was Menschen dazu bewegt, 
          über sich hinauszuwachsen und ihr volles Potenzial zu entfalten. Diese Neugier 
          führte mich durch verschiedene Lebensstationen und prägte meinen Weg als 
          <span style={styles.highlight}> Beraterin und Coach</span>.
        </p>
        <p style={styles.sectionContent}>
          Nach meinem Studium in Psychologie und mehrjähriger Tätigkeit in der 
          Organisationsentwicklung erkannte ich meine wahre Berufung: Menschen dabei 
          zu unterstützen, ihre eigenen Antworten zu finden und nachhaltige Veränderungen 
          in ihrem Leben zu bewirken.
        </p>
        <p style={styles.sectionContent}>
          Heute blicke ich auf über <span style={styles.highlight}>15 Jahre Erfahrung</span> 
          in der Begleitung von Einzelpersonen, Teams und Organisationen zurück. Jeder 
          Klient bringt neue Perspektiven und Lernerfahrungen mit sich, die meine Arbeit 
          bereichern und weiterentwickeln.
        </p>
      </section>

      <section className="section-padding" style={styles.section}>
        <h2 style={styles.sectionTitle}>Meine Qualifikationen</h2>
        <div className="grid-container" style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Ausbildung</h3>
            <p style={styles.cardText}>
              • Diplom in Psychologie<br />
              • Systemischer Coach (DVCT zertifiziert)<br />
              • NLP Master Practitioner<br />
              • Transaktionsanalyse Grundausbildung
            </p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Weiterbildungen</h3>
            <p style={styles.cardText}>
              • Gewaltfreie Kommunikation<br />
              • Achtsamkeitsbasierte Stressreduktion<br />
              • Organisationsentwicklung<br />
              • Trauma-informierte Beratung
            </p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Mitgliedschaften</h3>
            <p style={styles.cardText}>
              • Deutscher Verband für Coaching und Training<br />
              • Berufsverband für Beratung und Coaching<br />
              • Systemische Gesellschaft<br />
              • Internationale Coach Federation
            </p>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Erfahrung</h3>
            <p style={styles.cardText}>
              • 15+ Jahre Coaching-Erfahrung<br />
              • 200+ erfolgreiche Beratungsprozesse<br />
              • Workshops für Unternehmen<br />
              • Supervision und Coaching-Ausbildung
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding" style={styles.section}>
        <h2 style={styles.sectionTitle}>Mein Ansatz</h2>
        <p style={styles.sectionContent}>
          Meine Arbeit basiert auf der Überzeugung, dass jeder Mensch bereits alle 
          Ressourcen in sich trägt, die er für positive Veränderungen benötigt. 
          Als Coach sehe ich mich als <span style={styles.highlight}>Wegbegleiterin</span>, 
          die dabei hilft, diese Ressourcen zu entdecken und zu aktivieren.
        </p>
        <p style={styles.sectionContent}>
          Ich arbeite systemisch, lösungsorientiert und immer mit dem Fokus auf die 
          individuellen Bedürfnisse meiner Klienten. Dabei verbinde ich bewährte 
          Coaching-Methoden mit modernen Erkenntnissen aus der Neurowissenschaft 
          und Positiven Psychologie.
        </p>
        <p style={styles.sectionContent}>
          Besonders wichtig ist mir ein Umfeld des Vertrauens und der Wertschätzung, 
          in dem sich Menschen öffnen und wachsen können. Authentizität, Empathie 
          und professionelle Kompetenz bilden das Fundament meiner Arbeit.
        </p>
      </section>

      <section className="section-padding" style={styles.section}>
        <h2 style={styles.sectionTitle}>Persönliches</h2>
        <p style={styles.sectionContent}>
          Wenn ich nicht in meiner Praxis bin, finde ich Ausgleich und Inspiration 
          in der Natur. Wandern, Yoga und Meditation sind nicht nur private 
          Leidenschaften, sondern fließen auch in meine professionelle Arbeit ein.
        </p>
        <p style={styles.sectionContent}>
          Als Mutter von zwei Kindern kenne ich die Herausforderungen des Alltags 
          und die Kunst des Gleichgewichts zwischen verschiedenen Lebensbereichen. 
          Diese persönlichen Erfahrungen bereichern meine Arbeit und helfen mir, 
          authentisch und nahbar zu bleiben.
        </p>
        <p style={styles.sectionContent}>
          Ich glaube fest daran, dass Wachstum ein lebenslanger Prozess ist. 
          Deshalb investiere ich kontinuierlich in meine eigene Weiterentwicklung 
          und nehme regelmäßig an Supervisionen und Fortbildungen teil.
        </p>
      </section>

      <div style={styles.ctaSection}>
        <h2 style={styles.sectionTitle}>Lassen Sie uns kennenlernen</h2>
        <p style={styles.sectionContent}>
          Haben Sie Fragen zu meiner Arbeitsweise oder möchten Sie mehr über 
          meine Angebote erfahren? Ich freue mich auf ein persönliches Gespräch.
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