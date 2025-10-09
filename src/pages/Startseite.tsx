import React from 'react';
import { APP_CONFIG } from '../types';

const Startseite: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const styles: Record<string, React.CSSProperties> = {
    // Hero Section
    heroSection: {
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      padding: '4rem 2rem',
      gap: '4rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    heroImage: {
      flex: '0 0 45%',
      maxWidth: '500px',
    },
    heroImageImg: {
      width: '100%',
      height: 'auto',
      borderRadius: '1rem',
      objectFit: 'cover',
    },
    heroContent: {
      flex: 1,
      position: 'relative',
    },
    heroTitle: {
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '700',
      fontFamily: "'Sumana', serif",
      marginBottom: '2rem',
      lineHeight: '1.2',
    },
    heroText: {
      fontSize: 'clamp(1rem, 2vw, 1.2rem)',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
      lineHeight: '1.8',
      marginBottom: '1.5rem',
    },
    tagline: {
      fontSize: 'clamp(1rem, 2vw, 1.3rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginTop: '3rem',
    },
    ctaButton: {
      display: 'inline-block',
      backgroundColor: APP_CONFIG.colors.accent,
      color: '#333',
      padding: '1rem 2.5rem',
      borderRadius: '2rem',
      textDecoration: 'none',
      fontWeight: '600',
      fontFamily: "'Arimo', sans-serif",
      fontSize: '1.1rem',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(232, 205, 140, 0.3)',
      marginTop: '2rem',
      cursor: 'pointer',
      border: 'none',
    },

    // Section Styles
    section: {
      padding: '6rem 2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    sectionTitle: {
      fontSize: 'clamp(2rem, 4vw, 3rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '700',
      fontFamily: "'Sumana', serif",
      marginBottom: '3rem',
      textAlign: 'center',
    },
    sectionSubtitle: {
      fontSize: 'clamp(1.5rem, 3vw, 2rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '2rem',
    },
    sectionText: {
      fontSize: 'clamp(1rem, 2vw, 1.1rem)',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
      lineHeight: '1.8',
      marginBottom: '1.5rem',
    },

    // Über mich section
    ueberMichGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '4rem',
      marginBottom: '4rem',
    },
    ueberMichContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    bulletList: {
      listStyle: 'none',
      padding: 0,
      margin: '1.5rem 0',
    },
    bulletItem: {
      fontSize: 'clamp(1rem, 2vw, 1.1rem)',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
      lineHeight: '1.8',
      marginBottom: '1rem',
      paddingLeft: '1.5rem',
      position: 'relative',
    },

    // Wer ich bin subsection
    werIchBinSection: {
      backgroundColor: `${APP_CONFIG.colors.primary}05`,
      borderRadius: '1rem',
      padding: '3rem',
      marginTop: '4rem',
    },
    werIchBinGrid: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: '3rem',
      alignItems: 'start',
    },
    werIchBinImage: {
      width: '100%',
      height: 'auto',
      borderRadius: '1rem',
      objectFit: 'cover',
    },
    externalLink: {
      color: APP_CONFIG.colors.primary,
      textDecoration: 'none',
      fontWeight: '600',
      transition: 'color 0.3s ease',
    },

    // Wünschst du dir section
    wuenschstSection: {
      backgroundColor: APP_CONFIG.colors.background,
      borderRadius: '2rem',
      padding: '4rem 2rem',
      textAlign: 'center',
      marginBottom: '4rem',
      position: 'relative',
      overflow: 'hidden',
    },
    wuenschstTitle: {
      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '700',
      fontFamily: "'Sumana', serif",
      marginBottom: '4rem',
    },
    desiresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '3rem',
      marginBottom: '3rem',
      maxWidth: '1000px',
      margin: '0 auto 3rem',
    },
    desireCard: {
      padding: '2rem',
      textAlign: 'center',
    },
    desireTitle: {
      fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '1rem',
    },
    desireText: {
      fontSize: 'clamp(0.95rem, 1.8vw, 1.05rem)',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
      lineHeight: '1.6',
    },
    jaButton: {
      backgroundColor: APP_CONFIG.colors.primary,
      color: '#FFFFFF',
      padding: '1.2rem 3rem',
      borderRadius: '2rem',
      fontSize: '1.2rem',
      fontWeight: '600',
      fontFamily: "'Arimo', sans-serif",
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 20px rgba(0, 151, 178, 0.3)',
    },

    // Zwei Wege section
    zweiWegeTitle: {
      fontSize: 'clamp(2rem, 4vw, 2.8rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      textAlign: 'center',
      marginBottom: '4rem',
      marginTop: '2rem',
    },
    offeringsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '3rem',
      marginBottom: '6rem',
    },
    offeringCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '1rem',
      padding: '3rem',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.08)',
      display: 'flex',
      flexDirection: 'column',
    },
    offeringCardLeft: {
      backgroundColor: `${APP_CONFIG.colors.secondary}10`,
    },
    offeringCardRight: {
      backgroundColor: `${APP_CONFIG.colors.primary}08`,
    },
    offeringTitle: {
      fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '0.8rem',
    },
    offeringSubtitle: {
      fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
      color: APP_CONFIG.colors.secondary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '1.5rem',
    },
    offeringText: {
      fontSize: '1rem',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
      lineHeight: '1.7',
      marginBottom: '1.5rem',
    },
    offeringList: {
      listStyle: 'none',
      padding: 0,
      margin: '1.5rem 0',
      flex: 1,
    },
    offeringListItem: {
      fontSize: '1rem',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
      lineHeight: '1.7',
      marginBottom: '0.8rem',
      paddingLeft: '1.5rem',
      position: 'relative',
    },
    offeringCTA: {
      marginTop: '2rem',
    },
    offeringButton: {
      display: 'inline-block',
      backgroundColor: '#FFFFFF',
      color: APP_CONFIG.colors.primary,
      padding: '0.9rem 2rem',
      borderRadius: '2rem',
      textDecoration: 'none',
      fontWeight: '600',
      fontFamily: "'Arimo', sans-serif",
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      border: `2px solid ${APP_CONFIG.colors.primary}`,
      cursor: 'pointer',
    },

    // Course Detail Section
    courseDetailSection: {
      backgroundColor: `${APP_CONFIG.colors.primary}05`,
      borderRadius: '1rem',
      padding: '4rem 3rem',
      marginBottom: '6rem',
    },
    courseDetailTitle: {
      fontSize: 'clamp(2rem, 4vw, 3rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '700',
      fontFamily: "'Sumana', serif",
      marginBottom: '1.5rem',
      textAlign: 'center',
    },
    courseDetailSubtitle: {
      fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
      textAlign: 'center',
      marginBottom: '3rem',
      lineHeight: '1.6',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '2rem',
      marginBottom: '3rem',
    },
    featureCircle: {
      textAlign: 'center',
      padding: '2rem 1rem',
    },
    featureCircleTitle: {
      fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '0.8rem',
    },
    featureCircleText: {
      fontSize: '0.95rem',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
      lineHeight: '1.5',
    },
    programSection: {
      marginTop: '3rem',
    },
    programTitle: {
      fontSize: 'clamp(1.5rem, 3vw, 1.9rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '2rem',
    },
    programList: {
      listStyle: 'none',
      padding: 0,
      marginBottom: '2rem',
    },
    programListItem: {
      fontSize: '1.05rem',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
      lineHeight: '1.8',
      marginBottom: '1rem',
      paddingLeft: '1.8rem',
      position: 'relative',
    },
    courseCtaCenter: {
      textAlign: 'center',
      marginTop: '3rem',
    },

    // 1:1 Coaching Detail Section
    coachingDetailSection: {
      backgroundColor: '#FFFFFF',
      borderRadius: '1rem',
      padding: '4rem 3rem',
      marginBottom: '6rem',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.08)',
    },
    coachingDetailGrid: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: '3rem',
      alignItems: 'center',
    },
    coachingDetailImage: {
      width: '100%',
      height: 'auto',
      borderRadius: '1rem',
      objectFit: 'cover',
    },
    coachingDetailContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },

    // FAQ Section
    faqSection: {
      backgroundColor: '#FFFFFF',
      padding: '6rem 2rem',
    },
    faqTitle: {
      fontSize: 'clamp(2rem, 4vw, 3rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '700',
      fontFamily: "'Sumana', serif",
      textAlign: 'center',
      marginBottom: '1.5rem',
    },
    faqSubtitle: {
      fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
      textAlign: 'center',
      marginBottom: '4rem',
      lineHeight: '1.6',
    },
    faqGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '3rem',
      maxWidth: '1200px',
      margin: '0 auto 3rem',
    },
    faqCard: {
      backgroundColor: `${APP_CONFIG.colors.primary}05`,
      borderRadius: '1rem',
      padding: '3rem',
    },
    faqCardTitle: {
      fontSize: 'clamp(1.2rem, 2.2vw, 1.5rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '1.5rem',
    },
    faqCheckList: {
      listStyle: 'none',
      padding: 0,
      margin: '1.5rem 0',
    },
    faqCheckItem: {
      fontSize: '1rem',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
      lineHeight: '1.7',
      marginBottom: '0.8rem',
      paddingLeft: '1.8rem',
      position: 'relative',
    },
    faqEmoji: {
      fontSize: '1.1rem',
      marginRight: '0.5rem',
    },
    faqClosing: {
      fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)',
      color: APP_CONFIG.colors.primary,
      fontFamily: "'Sumana', serif",
      textAlign: 'center',
      marginTop: '3rem',
      lineHeight: '1.6',
    },
  };

  // Mobile styles
  const mobileStyles = `
    @media (max-width: 968px) {
      .hero-section {
        flex-direction: column-reverse !important;
        min-height: auto !important;
        padding: 3rem 1.5rem !important;
      }
      .hero-image {
        flex: 0 0 auto !important;
        max-width: 100% !important;
      }
      .ueber-mich-grid {
        grid-template-columns: 1fr !important;
        gap: 2rem !important;
      }
      .wer-ich-bin-grid {
        grid-template-columns: 1fr !important;
        gap: 2rem !important;
      }
      .desires-grid {
        grid-template-columns: 1fr !important;
        gap: 2rem !important;
      }
      .offerings-grid {
        grid-template-columns: 1fr !important;
        gap: 2rem !important;
      }
      .features-grid {
        grid-template-columns: 1fr 1fr !important;
        gap: 1.5rem !important;
      }
      .coaching-detail-grid {
        grid-template-columns: 1fr !important;
        gap: 2rem !important;
      }
      .faq-grid {
        grid-template-columns: 1fr !important;
        gap: 2rem !important;
      }
    }
  `;

  return (
    <>
      <style>{mobileStyles}</style>

      {/* Hero Section */}
      <section className="hero-section" style={styles.heroSection}>
        <div className="hero-image" style={styles.heroImage}>
          <img
            src="/assets/beach-photo.jpg"
            alt="Melanie am Strand"
            style={styles.heroImageImg}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Schön,<br />dass du hier bist</h1>
          <p style={styles.heroText}>
            Manchmal spüren wir, dass es Zeit ist, das eigene Leben neu zu betrachten. Zeit, Altes loszulassen. Zeit, innerlich freier zu werden.
          </p>
          <p style={styles.heroText}>
            Hier findest du einen Ort, an dem du dich selbst wiederentdecken kannst – gelassen, klar und ohne Druck.
          </p>
          <p style={styles.heroText}>
            Ich begleite dich dabei, Schritt für Schritt deinen eigenen Weg zu gehen.
          </p>
          <p style={styles.heroText}>
            Schön, dass du hier bist. Dein nächstes Kapitel darf leicht beginnen.
          </p>
          <button
            style={styles.ctaButton}
            onClick={() => scrollToSection('ueber-mich')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(232, 205, 140, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(232, 205, 140, 0.3)';
            }}
          >
            Mehr über mich
          </button>
          <p style={styles.tagline}>
            Coaching I Kommunikation I mentale Stärke
          </p>
        </div>
      </section>

      {/* Über mich Section */}
      <section id="ueber-mich" style={styles.section}>
        <h2 style={styles.sectionTitle}>Alte Muster loslassen</h2>
        <h3 style={{...styles.sectionSubtitle, textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)'}}>
          GEWINNE NEUE FREIHEIT
        </h3>

        <div style={styles.sectionText}>
          <p style={{marginBottom: '1.5rem'}}>
            Wenn deine Eltern älter werden, wächst der Druck: helfen, funktionieren, Erwartungen erfüllen. Und gleichzeitig meldet sich das alte Muster: Schuldgefühle, Anpassung, das Gefühl, wieder das kleine Kind zu sein.
          </p>
          <p style={{marginBottom: '1.5rem'}}>
            Und genau das macht Dich heute unfrei.
          </p>
          <p style={{marginBottom: '1.5rem'}}>
            Es blockiert deine Beziehungen, deinen Job, dein Selbstwertgefühl.
          </p>
          <p style={{marginBottom: '1.5rem'}}>
            Und genau hier setzt meine Arbeit an.
          </p>
          <p style={{marginBottom: '1.5rem', fontWeight: '600'}}>
            Ich bin Melanie, Coach für Kommunikation, mentale Stärke & NLP
          </p>
          <p style={{marginBottom: '1.5rem'}}>
            Und ich habe mich darauf spezialisiert Menschen, die mit schwierigen, vielleicht sogar narzisstischen Elternteilen aufgewachsen sind zu begleiten, um
          </p>
        </div>

        <ul style={styles.bulletList}>
          <li style={styles.bulletItem}>
            <span style={{position: 'absolute', left: 0, color: APP_CONFIG.colors.accent}}>•</span>
            klare Grenzen zu setzen, ohne schlechtes Gewissen
          </li>
          <li style={styles.bulletItem}>
            <span style={{position: 'absolute', left: 0, color: APP_CONFIG.colors.accent}}>•</span>
            Schuldgefühle loszulassen, so dass sie nicht mehr blockieren
          </li>
          <li style={styles.bulletItem}>
            <span style={{position: 'absolute', left: 0, color: APP_CONFIG.colors.accent}}>•</span>
            frei und selbstbestimmt zu entscheiden, wie sie Eltern unterstützen wollen
          </li>
        </ul>

        <p style={{...styles.sectionText, marginTop: '2rem'}}>
          Raus aus einer belastenden Elternbeziehung, rein in eine neue Freiheit und ein unbeschwertes Lebensgefühl.
        </p>

        {/* Wer ich bin Subsection */}
        <div style={styles.werIchBinSection}>
          <div className="wer-ich-bin-grid" style={styles.werIchBinGrid}>
            <div>
              <img
                src="/assets/beach-photo.jpg"
                alt="Melanie Zeyer"
                style={styles.werIchBinImage}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <h3 style={styles.sectionSubtitle}>Wer ich bin</h3>
              <div style={styles.sectionText}>
                <p style={{marginBottom: '1.5rem'}}>
                  Ich bin Kommunikationsexpertin, Coach für innere Freiheit und Weltenbummlerin. Freiheit ist für mich kein Luxus, sondern ein Grundrecht.
                </p>
                <p style={{marginBottom: '1.5rem'}}>
                  Schon früh habe ich erlebt, wie stark Schuldgefühle, Erwartungen und alte Familienmuster das eigene Leben bestimmen können. Ich weiß, wie es sich anfühlt, wieder in die Rolle des „braven Kindes" zu fallen – und wie befreiend es ist, diesen Kreislauf zu durchbrechen.
                </p>
                <p style={{marginBottom: '1.5rem'}}>
                  Mein Leben, sowohl beruflich als auch in meinen Beziehungen, war nie ein gerader Weg, sondern immer schon ein bunter Teppich aus Erlebnissen, Herausforderungen und mutigen Entscheidungen.
                </p>
                <p style={{marginBottom: '1.5rem'}}>
                  Der rote Faden ist, dass es mir schon immer wichtig war, Menschen wirklich zu sehen und Brücken zu bauen – durch Sprache, durch Begegnungen, durch echtes Zuhören. All das hat meinen Weg geprägt und führte mich zu meiner heutigen Arbeit als Coach.
                </p>
                <p style={{marginBottom: '1.5rem'}}>
                  Hinter meinem Coaching stehen fundierte Ausbildungen zum Coach in Kommunikation und mentaler Stärke und eine NLP Ausbildung zertifiziert nach DVNLP. Außerdem viele Jahre Persönlichkeitsentwicklung. Doch das Wichtigste habe ich nicht in Seminarräumen gelernt, sondern in Begegnungen mit Menschen und in meinem eigenen Leben.
                </p>
                <p>
                  Noch mehr über mich:{' '}
                  <a
                    href="https://www.imlebenunterwegs.de"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.externalLink}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = APP_CONFIG.colors.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = APP_CONFIG.colors.primary;
                    }}
                  >
                    www.imlebenunterwegs.de
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Angebot Section */}
      <section id="angebot" style={{...styles.section, backgroundColor: `${APP_CONFIG.colors.primary}03`}}>
        {/* Wünschst du dir... */}
        <div style={styles.wuenschstSection}>
          <h2 style={styles.wuenschstTitle}>Wünschst du dir...</h2>

          <div className="desires-grid" style={styles.desiresGrid}>
            <div style={styles.desireCard}>
              <h3 style={styles.desireTitle}>Weniger Schuldgefühle</h3>
              <p style={styles.desireText}>
                und das Vertrauen, ein glückliches Leben nach deinen eigenen Regeln zu führen?
              </p>
            </div>
            <div style={styles.desireCard}>
              <h3 style={styles.desireTitle}>Innere Ruhe & Freiheit</h3>
              <p style={styles.desireText}>
                auch dann, wenn deine Eltern älter werden und Erwartungen an dich stellen?
              </p>
            </div>
            <div style={styles.desireCard}>
              <h3 style={styles.desireTitle}>Klare Grenzen zu setzen</h3>
              <p style={styles.desireText}>
                und gleichzeitig Mitgefühl zu behalten – ohne dich selbst zu verlieren?
              </p>
            </div>
          </div>

          <button
            style={styles.jaButton}
            onClick={() => scrollToSection('zwei-wege')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(0, 151, 178, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 151, 178, 0.3)';
            }}
          >
            JA, das wünsch ich mir
          </button>
        </div>

        {/* Zwei Wege in die Freiheit */}
        <div id="zwei-wege">
          <h2 style={styles.zweiWegeTitle}>Zwei Wege in die Freiheit</h2>

          <div className="offerings-grid" style={styles.offeringsGrid}>
            {/* 8-Wochen-Livekurs */}
            <div style={{...styles.offeringCard, ...styles.offeringCardLeft}}>
              <h3 style={styles.offeringTitle}>Dein 8-Wochen-Livekurs</h3>
              <h4 style={styles.offeringSubtitle}>Eltern werden älter – du wirst frei.</h4>
              <p style={styles.offeringText}>
                Raus aus einer belastenden Elternbeziehung, rein in deine neue Freiheit: Löse dich aus Schuld, Pflicht und Verstrickung.
              </p>
              <p style={styles.offeringText}>
                In meinem 8-Wochen-Livekurs begleite ich dich Schritt für Schritt dabei, Schuldgefühle loszulassen, klare Grenzen zu setzen und dich selbst neu zu entdecken.
              </p>
              <p style={{...styles.offeringText, fontWeight: '600', marginTop: '1.5rem'}}>
                Für dich, wenn du …
              </p>
              <ul style={styles.offeringList}>
                <li style={styles.offeringListItem}>
                  <span style={{position: 'absolute', left: 0, color: APP_CONFIG.colors.accent}}>•</span>
                  endlich weniger Schuld und Druck spüren willst
                </li>
                <li style={styles.offeringListItem}>
                  <span style={{position: 'absolute', left: 0, color: APP_CONFIG.colors.accent}}>•</span>
                  lernen möchtest, für dich einzustehen, ohne dich schuldig zu fühlen
                </li>
                <li style={styles.offeringListItem}>
                  <span style={{position: 'absolute', left: 0, color: APP_CONFIG.colors.accent}}>•</span>
                  dir innere Ruhe & Klarheit wünschst – auch wenn deine Eltern älter werden
                </li>
              </ul>
              <p style={{...styles.offeringText, display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span style={styles.faqEmoji}>👉</span>
                Gruppen-Programm mit Live-Sessions, Austausch und klarer Struktur.
              </p>
              <div style={styles.offeringCTA}>
                <button
                  style={styles.offeringButton}
                  onClick={() => scrollToSection('course-detail')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = APP_CONFIG.colors.primary;
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.color = APP_CONFIG.colors.primary;
                  }}
                >
                  Kurs entdecken
                </button>
              </div>
            </div>

            {/* 1:1 Coaching */}
            <div style={{...styles.offeringCard, ...styles.offeringCardRight}}>
              <h3 style={styles.offeringTitle}>Dein 1:1 Coaching</h3>
              <h4 style={styles.offeringSubtitle}>Manchmal braucht es den direkten Weg.</h4>
              <p style={styles.offeringText}>
                Im persönlichen Coaching bist du mit deiner Geschichte im Mittelpunkt. Wir arbeiten individuell, klar und tief – genau in deinem Tempo. Ich begleite dich dabei, alte Muster zu erkennen, loszulassen und deine Freiheit zu leben.
              </p>
              <p style={{...styles.offeringText, fontWeight: '600', marginTop: '1.5rem'}}>
                Für dich, wenn du …
              </p>
              <ul style={styles.offeringList}>
                <li style={styles.offeringListItem}>
                  <span style={{position: 'absolute', left: 0, color: APP_CONFIG.colors.accent}}>•</span>
                  eine intensive, persönliche Begleitung suchst
                </li>
                <li style={styles.offeringListItem}>
                  <span style={{position: 'absolute', left: 0, color: APP_CONFIG.colors.accent}}>•</span>
                  an spezifischen Themen tiefer arbeiten willst
                </li>
                <li style={styles.offeringListItem}>
                  <span style={{position: 'absolute', left: 0, color: APP_CONFIG.colors.accent}}>•</span>
                  dir ehrliches, klares Feedback und individuelle Lösungen wünschst
                </li>
              </ul>
              <p style={{...styles.offeringText, display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <span style={styles.faqEmoji}>👉</span>
                Einzeltermine, flexibel und persönlich.
              </p>
              <div style={styles.offeringCTA}>
                <button
                  style={styles.offeringButton}
                  onClick={() => scrollToSection('coaching-detail')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = APP_CONFIG.colors.primary;
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.color = APP_CONFIG.colors.primary;
                  }}
                >
                  1:1 starten
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Course Detail Section */}
        <div id="course-detail" style={styles.courseDetailSection}>
          <h2 style={styles.courseDetailTitle}>Eltern werden älter – du wirst frei.</h2>
          <p style={styles.courseDetailSubtitle}>
            Löse dich aus Schuld, Pflicht und alten Rollen – und finde deine innere Freiheit
          </p>
          <p style={{...styles.sectionText, textAlign: 'center', marginBottom: '3rem'}}>
            In meinem Onlinekurs begleite ich dich Schritt für Schritt dabei, dich aus alten Mustern zu lösen und deine eigene Klarheit zu finden – gerade jetzt, wo deine Eltern älter werden und alte Dynamiken spürbarer denn je sind
          </p>

          <div className="features-grid" style={styles.featuresGrid}>
            <div style={styles.featureCircle}>
              <h4 style={styles.featureCircleTitle}>Alte Muster sprengen</h4>
              <p style={styles.featureCircleText}>
                Raus aus Schuld und den Rollen deiner Kindheit.
              </p>
            </div>
            <div style={styles.featureCircle}>
              <h4 style={styles.featureCircleTitle}>Grenzen neu setzen</h4>
              <p style={styles.featureCircleText}>
                Endlich klar Nein sagen – ohne schlechtes Gewissen.
              </p>
            </div>
            <div style={styles.featureCircle}>
              <h4 style={styles.featureCircleTitle}>Dein Inneres heilen</h4>
              <p style={styles.featureCircleText}>
                Alte Wunden versorgen, innere Stärke finden.
              </p>
            </div>
            <div style={styles.featureCircle}>
              <h4 style={styles.featureCircleTitle}>Frei leben & lieben</h4>
              <p style={styles.featureCircleText}>
                Dein Leben selbst gestalten – in Freiheit und Liebe.
              </p>
            </div>
          </div>

          <div style={styles.programSection}>
            <h3 style={styles.programTitle}>Das erwartet dich im Programm</h3>
            <ul style={styles.programList}>
              <li style={styles.programListItem}>
                <span style={{position: 'absolute', left: 0, color: APP_CONFIG.colors.accent}}>•</span>
                <strong>8 Wochen Live-Coaching online</strong> – einmal pro Woche 90 Minuten in einer kleinen, geschützten Gruppe, die dir Sicherheit gibt
              </li>
              <li style={styles.programListItem}>
                <span style={{position: 'absolute', left: 0, color: APP_CONFIG.colors.accent}}>•</span>
                <strong>Einen vertrauensvollen Raum</strong> mit Menschen, die ähnliche Erfahrungen teilen
              </li>
              <li style={styles.programListItem}>
                <span style={{position: 'absolute', left: 0, color: APP_CONFIG.colors.accent}}>•</span>
                <strong>Reflexionsfragen & Coaching-Tools</strong>, die dir helfen, alte Muster zu erkennen und Schritt für Schritt zu verändern
              </li>
              <li style={styles.programListItem}>
                <span style={{position: 'absolute', left: 0, color: APP_CONFIG.colors.accent}}>•</span>
                <strong>Praktische Übungen, Meditationen und Körperarbeit</strong>, die dich ins Fühlen bringen und Kopf, Herz und Körper gleichermaßen stärken
              </li>
              <li style={styles.programListItem}>
                <span style={{position: 'absolute', left: 0, color: APP_CONFIG.colors.accent}}>•</span>
                <strong>Optional: 1:1-Coachings</strong>, um deine persönlichen Themen noch intensiver und gezielter zu bearbeiten
              </li>
              <li style={styles.programListItem}>
                <span style={{position: 'absolute', left: 0, color: APP_CONFIG.colors.accent}}>•</span>
                <strong>Eine klare Roadmap</strong>, die dich von Schuld und Anpassung hin zu innerer Freiheit führt – damit du spürbar leichter, selbstbestimmter und freier wirst.
              </li>
            </ul>

            <h3 style={{...styles.programTitle, marginTop: '3rem'}}>Am Ende des Programms wirst du:</h3>
            <ul style={styles.programList}>
              <li style={styles.programListItem}>
                <span style={{position: 'absolute', left: 0, color: APP_CONFIG.colors.accent}}>•</span>
                die Dynamiken mit deinen Eltern klarer verstehen – und die Werkzeuge haben, dich nicht länger in ihnen zu verfangen
              </li>
              <li style={styles.programListItem}>
                <span style={{position: 'absolute', left: 0, color: APP_CONFIG.colors.accent}}>•</span>
                lernen, gesunde Grenzen zu setzen – auch wenn es dir bis heute nicht möglich war
              </li>
              <li style={styles.programListItem}>
                <span style={{position: 'absolute', left: 0, color: APP_CONFIG.colors.accent}}>•</span>
                Methoden kennen, die dir innere Ruhe und Stärke geben, selbst wenn deine Eltern sich nicht verändern
              </li>
              <li style={styles.programListItem}>
                <span style={{position: 'absolute', left: 0, color: APP_CONFIG.colors.accent}}>•</span>
                Werkzeuge haben, die eine respektvolle und achtsame Basis im Umgang mit Elternteilen und Familienmitgliedern ermöglichen
              </li>
            </ul>

            <div style={styles.courseCtaCenter}>
              <button
                style={{...styles.ctaButton, marginTop: 0}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(232, 205, 140, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(232, 205, 140, 0.3)';
                }}
              >
                In die Freiheit starten
              </button>
            </div>
          </div>
        </div>

        {/* 1:1 Coaching Detail Section */}
        <div id="coaching-detail" style={styles.coachingDetailSection}>
          <h2 style={styles.courseDetailTitle}>1:1 Coaching - Klarheit ohne Umwege</h2>

          <div className="coaching-detail-grid" style={styles.coachingDetailGrid}>
            <div>
              <img
                src="/assets/professional-photo.jpg"
                alt="Melanie Zeyer - Coach"
                style={styles.coachingDetailImage}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div style={styles.coachingDetailContent}>
              <p style={styles.sectionText}>
                Vielleicht hast du schon viel ausprobiert. Bücher, Kurse, Gespräche. Und trotzdem spürst du: Da ist etwas, das dich zurückhält.
              </p>
              <p style={styles.sectionText}>
                Im 1:1 Coaching schauen wir genau dorthin. Ohne Umwege, ohne Ausreden, ohne Verstecken. Du bekommst eine ehrliche Spiegelung, konkrete Impulse und den Raum, dich selbst neu zu sehen.
              </p>
              <p style={styles.sectionText}>
                Das ist manchmal unbequem. Aber genau das bringt dich weiter – weil du endlich erkennst, was dich wirklich blockiert.
              </p>
              <p style={styles.sectionText}>
                Wenn du bereit bist, dir ehrlich zu begegnen, ist dieses Coaching dein nächster Schritt.
              </p>
              <div style={{marginTop: '2rem'}}>
                <button
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
                  Buche jetzt dein kostenfreies Erstgespräch
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={styles.faqSection}>
        <h2 style={styles.faqTitle}>Welcher Weg passt zu dir?</h2>
        <p style={styles.faqSubtitle}>
          Es gibt nicht den einen richtigen Weg. Die Frage ist: Was brauchst du gerade am meisten?
        </p>

        <div className="faq-grid" style={styles.faqGrid}>
          {/* 8-Wochen-Livekurs */}
          <div style={styles.faqCard}>
            <h3 style={styles.faqCardTitle}>
              8-Wochen-Livekurs „Frei bleiben – auch wenn deine Eltern alt werden"
            </h3>
            <ul style={styles.faqCheckList}>
              <li style={styles.faqCheckItem}>
                <span style={{position: 'absolute', left: 0}}>✔️</span>
                Klare Struktur mit wöchentlichem Fokus (Schuld loslassen, Grenzen setzen, alte Glaubenssätze entlarven …)
              </li>
              <li style={styles.faqCheckItem}>
                <span style={{position: 'absolute', left: 0}}>✔️</span>
                Gemeinsamer Weg in einer kleinen Gruppe – du bist nicht allein
              </li>
              <li style={styles.faqCheckItem}>
                <span style={{position: 'absolute', left: 0}}>✔️</span>
                Übungen, Reflexionen und Meditationen, die dich Schritt für Schritt begleiten
              </li>
              <li style={styles.faqCheckItem}>
                <span style={{position: 'absolute', left: 0}}>✔️</span>
                Austausch & Inspiration von Menschen, die Ähnliches erleben
              </li>
              <li style={styles.faqCheckItem}>
                <span style={{position: 'absolute', left: 0}}>✔️</span>
                Fester Rahmen: 8 Wochen – dein roter Faden zur inneren Freiheit
              </li>
            </ul>
            <p style={{...styles.sectionText, marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <span style={styles.faqEmoji}>👉</span>
              <strong>Ideal, wenn du dir einen klaren Prozess und Gemeinschaft wünschst.</strong>
            </p>
          </div>

          {/* 1:1 Coaching */}
          <div style={styles.faqCard}>
            <h3 style={styles.faqCardTitle}>
              1:1 Coaching - Dein persönlicher Raum für Klarheit
            </h3>
            <ul style={styles.faqCheckList}>
              <li style={styles.faqCheckItem}>
                <span style={{position: 'absolute', left: 0}}>✔️</span>
                Komplett individuell auf deine Situation zugeschnitten
              </li>
              <li style={styles.faqCheckItem}>
                <span style={{position: 'absolute', left: 0}}>✔️</span>
                Fokus auf deine persönlichen Fragen, Blockaden und Muster
              </li>
              <li style={styles.faqCheckItem}>
                <span style={{position: 'absolute', left: 0}}>✔️</span>
                Ehrliche Spiegelung und Impulse, die genau da ansetzen, wo du stehst
              </li>
              <li style={styles.faqCheckItem}>
                <span style={{position: 'absolute', left: 0}}>✔️</span>
                Flexible Tiefe: einmalig, begleitend oder vertiefend nach dem Kurs
              </li>
              <li style={styles.faqCheckItem}>
                <span style={{position: 'absolute', left: 0}}>✔️</span>
                Keine Vorgaben – wir gehen genau in dein Thema
              </li>
            </ul>
            <p style={{...styles.sectionText, marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <span style={styles.faqEmoji}>👉</span>
              <strong>Ideal, wenn du individuelle Begleitung und maximale Tiefe suchst.</strong>
            </p>
          </div>
        </div>

        <p style={styles.faqClosing}>
          Ob im Kurs oder im 1:1 Coaching – beide Wege führen dich dahin, wo Freiheit beginnt: bei dir selbst.
        </p>
      </section>
    </>
  );
};

export default Startseite;
