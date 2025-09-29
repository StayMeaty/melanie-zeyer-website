import React from 'react';
import { APP_CONFIG } from '../types';

const Impressum: React.FC = () => {
  const styles: Record<string, React.CSSProperties> = {
    hero: {
      textAlign: 'center',
      marginBottom: '3rem',
      padding: '2rem 0',
    },
    title: {
      fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '700',
      fontFamily: "'Sumana', serif",
      marginBottom: '1rem',
      lineHeight: '1.2',
    },
    section: {
      marginBottom: '3rem',
      padding: '2.5rem',
      backgroundColor: '#FFFFFF',
      borderRadius: '1rem',
      boxShadow: '0 2px 20px rgba(0, 0, 0, 0.05)',
    },
    sectionTitle: {
      fontSize: '1.5rem',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '1.5rem',
      paddingBottom: '0.5rem',
      borderBottom: `2px solid ${APP_CONFIG.colors.accent}`,
    },
    sectionContent: {
      color: APP_CONFIG.colors.secondary,
      lineHeight: '1.7',
      fontSize: '1rem',
      fontFamily: "'Arimo', sans-serif",
      marginBottom: '1rem',
    },
    contactInfo: {
      backgroundColor: `${APP_CONFIG.colors.primary}05`,
      padding: '2rem',
      borderRadius: '0.75rem',
      marginBottom: '2rem',
    },
    contactTitle: {
      fontSize: '1.3rem',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '1rem',
    },
    contactDetails: {
      color: APP_CONFIG.colors.secondary,
      lineHeight: '1.6',
      fontFamily: "'Arimo', sans-serif",
    },
    strong: {
      fontWeight: '600',
      color: APP_CONFIG.colors.primary,
    },
    link: {
      color: APP_CONFIG.colors.primary,
      textDecoration: 'none',
      fontWeight: '500',
    },
    disclaimer: {
      backgroundColor: `${APP_CONFIG.colors.accent}15`,
      padding: '1.5rem',
      borderRadius: '0.75rem',
      fontSize: '0.9rem',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
      lineHeight: '1.6',
      marginTop: '1rem',
    },
  };

  const mobileStyles = `
    @media (max-width: 768px) {
      .section-padding {
        padding: 1.5rem !important;
      }
      .contact-info {
        padding: 1.5rem !important;
      }
    }
  `;

  return (
    <>
      <style>{mobileStyles}</style>
      
      <section style={styles.hero}>
        <h1 style={styles.title}>
          Impressum
        </h1>
      </section>

      <div style={styles.contactInfo}>
        <h2 style={styles.contactTitle}>Angaben gemäß § 5 TMG</h2>
        <div style={styles.contactDetails}>
          <strong style={styles.strong}>[Vollständiger Name]</strong><br />
          [Geschäftsbezeichnung]<br />
          <br />
          [Straße und Hausnummer]<br />
          [PLZ Stadt]<br />
          Deutschland<br />
          <br />
          <strong style={styles.strong}>Telefon:</strong> [Telefonnummer]<br />
          <strong style={styles.strong}>E-Mail:</strong> <a href="mailto:[email@domain.de]" style={styles.link}>[email@domain.de]</a><br />
          <strong style={styles.strong}>Website:</strong> <a href="https://[www.domain.de]" style={styles.link}>[www.domain.de]</a>
        </div>
      </div>

      <section className="section-padding" style={styles.section}>
        <h2 style={styles.sectionTitle}>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
        <p style={styles.sectionContent}>
          [Vollständiger Name]<br />
          [Straße und Hausnummer]<br />
          [PLZ Stadt]
        </p>
      </section>

      <section className="section-padding" style={styles.section}>
        <h2 style={styles.sectionTitle}>Berufliche Qualifikationen</h2>
        <p style={styles.sectionContent}>
          <strong style={styles.strong}>Ausbildung:</strong> [Ausbildung/Studium]<br />
          <strong style={styles.strong}>Zertifizierung:</strong> [Zertifizierung 1]<br />
          <strong style={styles.strong}>Weitere Qualifikationen:</strong> [Qualifikation 1], [Qualifikation 2]
        </p>
        <p style={styles.sectionContent}>
          <strong style={styles.strong}>Mitgliedschaften:</strong><br />
          • [Verband/Organisation 1]<br />
          • [Verband/Organisation 2]<br />
          • [Verband/Organisation 3]
        </p>
      </section>

      <section className="section-padding" style={styles.section}>
        <h2 style={styles.sectionTitle}>Haftungsausschluss</h2>
        
        <h3 style={{ ...styles.sectionTitle, fontSize: '1.2rem', marginBottom: '1rem', borderBottom: 'none' }}>
          Haftung für Inhalte
        </h3>
        <p style={styles.sectionContent}>
          Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
          allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht 
          unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach 
          Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
        </p>
        <p style={styles.sectionContent}>
          Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen 
          Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt 
          der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden 
          Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
        </p>

        <h3 style={{ ...styles.sectionTitle, fontSize: '1.2rem', marginBottom: '1rem', borderBottom: 'none' }}>
          Haftung für Links
        </h3>
        <p style={styles.sectionContent}>
          Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
          Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der 
          verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die 
          verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. 
          Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
        </p>

        <h3 style={{ ...styles.sectionTitle, fontSize: '1.2rem', marginBottom: '1rem', borderBottom: 'none' }}>
          Urheberrecht
        </h3>
        <p style={styles.sectionContent}>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen 
          Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der 
          Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. 
          Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
        </p>
      </section>

      <section className="section-padding" style={styles.section}>
        <h2 style={styles.sectionTitle}>Datenschutz</h2>
        <p style={styles.sectionContent}>
          Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich. 
          Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder 
          eMail-Adressen) erhoben werden, erfolgt dies, soweit möglich, stets auf freiwilliger Basis. 
          Diese Daten werden ohne Ihre ausdrückliche Zustimmung nicht an Dritte weitergegeben.
        </p>
        <p style={styles.sectionContent}>
          Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per 
          E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff 
          durch Dritte ist nicht möglich.
        </p>

        <h3 style={{ ...styles.sectionTitle, fontSize: '1.2rem', marginBottom: '1rem', borderBottom: 'none' }}>
          Kontakt per E-Mail
        </h3>
        <p style={styles.sectionContent}>
          Wenn Sie uns per E-Mail kontaktieren, werden Ihre Angaben zwecks Bearbeitung der Anfrage sowie 
          für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre 
          Einwilligung weiter. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, 
          sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung 
          vorvertraglicher Maßnahmen erforderlich ist.
        </p>
      </section>

      <section className="section-padding" style={styles.section}>
        <h2 style={styles.sectionTitle}>[Service] Hinweise</h2>
        <p style={styles.sectionContent}>
          <strong style={styles.strong}>Wichtiger Hinweis:</strong> [Service] ersetzt keine professionelle 
          medizinische oder psychologische Behandlung. Lorem ipsum dolor sit amet, consectetur 
          adipiscing elit, sed do eiusmod tempor incididunt.
        </p>
        <p style={styles.sectionContent}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor 
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
          exercitation ullamco laboris nisi ut aliquip.
        </p>
        
        <div style={styles.disclaimer}>
          <strong>Schweigepflicht:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
          [Berufsverband] sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
          Vertraulichkeit und ethische Richtlinien.
        </div>
      </section>

      <section className="section-padding" style={styles.section}>
        <h2 style={styles.sectionTitle}>Streitbeilegung</h2>
        <p style={styles.sectionContent}>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
          <a href="https://ec.europa.eu/consumers/odr" style={styles.link} target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr
          </a>
        </p>
        <p style={styles.sectionContent}>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>

      <div style={styles.disclaimer}>
        <strong>Stand des Impressums:</strong> [Datum]<br />
        Änderungen vorbehalten. Bei Fragen zum Impressum oder Datenschutz kontaktieren Sie uns gerne 
        unter <a href="mailto:[email@domain.de]" style={styles.link}>[email@domain.de]</a>
      </div>
    </>
  );
};

export default Impressum;