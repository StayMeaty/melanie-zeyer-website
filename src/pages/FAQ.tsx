import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../types';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    if (openItems.includes(index)) {
      setOpenItems(openItems.filter(i => i !== index));
    } else {
      setOpenItems([...openItems, index]);
    }
  };

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
      marginBottom: '2rem',
      textAlign: 'center',
    },
    categoryTitle: {
      fontSize: '1.4rem',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
      marginBottom: '1.5rem',
      marginTop: '2rem',
      paddingBottom: '0.5rem',
      borderBottom: `2px solid ${APP_CONFIG.colors.accent}`,
    },
    faqItem: {
      marginBottom: '1rem',
      border: `1px solid ${APP_CONFIG.colors.secondary}20`,
      borderRadius: '0.75rem',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
    },
    faqItemOpen: {
      boxShadow: '0 4px 15px rgba(0, 151, 178, 0.1)',
      borderColor: `${APP_CONFIG.colors.primary}30`,
    },
    questionButton: {
      width: '100%',
      padding: '1.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      textAlign: 'left',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '1.1rem',
      fontWeight: '600',
      fontFamily: "'Arimo', sans-serif",
      color: APP_CONFIG.colors.primary,
      transition: 'background-color 0.3s ease',
    },
    questionButtonHover: {
      backgroundColor: `${APP_CONFIG.colors.primary}05`,
    },
    questionText: {
      flex: 1,
      paddingRight: '1rem',
    },
    toggleIcon: {
      fontSize: '1.2rem',
      transition: 'transform 0.3s ease',
      color: APP_CONFIG.colors.accent,
      fontWeight: 'bold',
    },
    toggleIconOpen: {
      transform: 'rotate(45deg)',
    },
    answerContainer: {
      backgroundColor: `${APP_CONFIG.colors.primary}03`,
      padding: '0 1.5rem',
      maxHeight: '0',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
    },
    answerContainerOpen: {
      padding: '1.5rem',
      maxHeight: '500px',
    },
    answer: {
      color: APP_CONFIG.colors.secondary,
      lineHeight: '1.7',
      fontFamily: "'Arimo', sans-serif",
      fontSize: '1rem',
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
    contactButton: {
      backgroundColor: '#FFFFFF',
      color: APP_CONFIG.colors.primary,
      padding: '1rem 2rem',
      borderRadius: '2rem',
      textDecoration: 'none',
      fontWeight: '600',
      fontFamily: "'Arimo', sans-serif",
      fontSize: '1.1rem',
      transition: 'all 0.3s ease',
      display: 'inline-block',
      border: 'none',
      cursor: 'pointer',
    },
  };

  const mobileStyles = `
    @media (max-width: 768px) {
      .section-padding {
        padding: 2rem !important;
      }
      .question-button {
        padding: 1rem !important;
        font-size: 1rem !important;
      }
      .answer-container-open {
        padding: 1rem !important;
      }
    }
  `;

  const faqData: FAQItem[] = [
    // Allgemeine Fragen
    {
      category: 'Allgemeine Fragen',
      question: 'Was ist der Unterschied zwischen Coaching und Therapie?',
      answer: 'Coaching ist zukunftsorientiert und fokussiert sich auf die Erreichung spezifischer Ziele. Während Therapie oft traumatische Erfahrungen oder psychische Erkrankungen behandelt, arbeitet Coaching mit gesunden Menschen, die ihre Potenziale entfalten und konkrete Veränderungen erreichen möchten. Als Coach gebe ich keine Ratschläge, sondern helfe Ihnen dabei, Ihre eigenen Lösungen zu finden.'
    },
    {
      category: 'Allgemeine Fragen',
      question: 'Wie lange dauert ein Coaching-Prozess?',
      answer: 'Die Dauer variiert je nach Ihren Zielen und der Komplexität des Themas. Ein typischer Coaching-Prozess umfasst 6-12 Sitzungen über einen Zeitraum von 3-6 Monaten. Manche Anliegen können bereits in wenigen Sitzungen bearbeitet werden, während andere eine längere Begleitung benötigen. Wir besprechen dies ausführlich in unserem Erstgespräch.'
    },
    {
      category: 'Allgemeine Fragen',
      question: 'Kann Coaching auch online stattfinden?',
      answer: 'Ja, ich biete sowohl Präsenz- als auch Online-Coaching an. Online-Coaching über Videokonferenz ist genauso effektiv wie persönliche Treffen und bietet mehr Flexibilität. Sie können bequem von zu Hause oder Ihrem Büro aus teilnehmen. Die technischen Voraussetzungen sind minimal - Sie benötigen lediglich eine stabile Internetverbindung und ein Gerät mit Kamera und Mikrofon.'
    },
    {
      category: 'Allgemeine Fragen',
      question: 'Für wen ist Coaching geeignet?',
      answer: 'Coaching ist für alle Menschen geeignet, die Veränderungen in ihrem Leben bewirken möchten - sei es beruflich oder privat. Ob Sie vor einer wichtigen Entscheidung stehen, Ihre Kommunikation verbessern möchten, berufliche Ziele verfolgen oder Ihre Work-Life-Balance optimieren wollen - Coaching unterstützt Sie dabei, Klarheit zu gewinnen und erfolgreich zu handeln.'
    },

    // Praktische Fragen
    {
      category: 'Praktische Fragen',
      question: 'Wie viel kostet eine Coaching-Sitzung?',
      answer: 'Die Kosten variieren je nach Art des Coachings. Einzelsitzungen beginnen bei 100€ für Persönlichkeitsentwicklung und 120€ für Business Coaching. Für Pakete und längerfristige Begleitung biete ich attraktive Konditionen. Das Erstgespräch (30 Minuten) ist immer kostenlos und unverbindlich, damit wir uns kennenlernen und klären können, ob die Chemie stimmt.'
    },
    {
      category: 'Praktische Fragen',
      question: 'Wie lange dauert eine Coaching-Sitzung?',
      answer: 'Eine reguläre Coaching-Sitzung dauert 90 Minuten. Diese Zeit ermöglicht es, tief in Themen einzusteigen und nachhaltige Erkenntnisse zu entwickeln. Für spezielle Anliegen oder Intensiv-Sessions können wir auch längere Termine vereinbaren. Das kostenlose Erstgespräch dauert 30 Minuten.'
    },
    {
      category: 'Praktische Fragen',
      question: 'Wie häufig finden die Termine statt?',
      answer: 'Typischerweise finden Coaching-Sitzungen alle 2-3 Wochen statt. Dieser Rhythmus ermöglicht es Ihnen, zwischen den Terminen an Ihren Themen zu arbeiten und neue Erkenntnisse zu integrieren. Je nach Intensität Ihres Anliegens können wir auch wöchentliche Termine oder längere Abstände vereinbaren.'
    },
    {
      category: 'Praktische Fragen',
      question: 'Kann ich einen Termin absagen oder verschieben?',
      answer: 'Ja, Termine können bis 24 Stunden vor dem vereinbarten Zeitpunkt kostenfrei verschoben werden. Bei kurzfristigeren Absagen (unter 24 Stunden) berechne ich eine Ausfallgebühr von 50% des Sitzungspreises, da der Termin nicht mehr anderweitig vergeben werden kann. In Notfällen finden wir immer eine kulante Lösung.'
    },

    // Über den Prozess
    {
      category: 'Über den Coaching-Prozess',
      question: 'Wie läuft das erste Gespräch ab?',
      answer: 'Das kostenlose Erstgespräch dient dem gegenseitigen Kennenlernen. Wir sprechen über Ihr Anliegen, Ihre Ziele und klären, ob Coaching der richtige Weg für Sie ist. Ich erkläre Ihnen meine Arbeitsweise und Sie können alle Fragen stellen, die Sie haben. Erst wenn Sie sich wohlfühlen und überzeugt sind, vereinbaren wir weitere Termine.'
    },
    {
      category: 'Über den Coaching-Prozess',
      question: 'Welche Methoden verwenden Sie?',
      answer: 'Ich arbeite systemisch und integrativ, das heißt ich kombiniere verschiedene bewährte Methoden je nach Ihrem Bedarf: systemische Fragetechniken, NLP, Transaktionsanalyse, Achtsamkeitsübungen und ressourcenorientierte Ansätze. Wichtig ist mir, dass die Methoden zu Ihnen passen - wir besprechen gemeinsam, was für Sie stimmig ist.'
    },
    {
      category: 'Über den Coaching-Prozess',
      question: 'Ist alles vertraulich?',
      answer: 'Absolut. Alles was in unseren Sitzungen besprochen wird, unterliegt der vollständigen Vertraulichkeit. Ich bin an die Schweigepflicht gebunden und gebe ohne Ihre ausdrückliche Zustimmung keinerlei Informationen weiter. Diese Vertraulichkeit ist die Grundlage für eine vertrauensvolle Zusammenarbeit.'
    },
    {
      category: 'Über den Coaching-Prozess',
      question: 'Was passiert zwischen den Sitzungen?',
      answer: 'Zwischen den Sitzungen bekommen Sie oft kleine "Hausaufgaben" oder Reflexionsfragen mit, die Ihnen helfen, das Besprochene zu vertiefen und in Ihren Alltag zu integrieren. Dies können Beobachtungsaufgaben, neue Verhaltensweisen oder Reflexionsübungen sein. Sie bestimmen selbst, wie intensiv Sie zwischen den Terminen arbeiten möchten.'
    },

    // Erfolgschancen
    {
      category: 'Erfolgschancen',
      question: 'Wie hoch sind die Erfolgschancen?',
      answer: 'Der Erfolg hängt maßgeblich von Ihrer Motivation und Bereitschaft zur Veränderung ab. Coaching ist ein aktiver Prozess, bei dem Sie selbst die Hauptarbeit leisten. Bei entsprechender Mitarbeit erreichen die meisten meiner Klienten ihre Ziele oder kommen ihnen deutlich näher. Wichtig ist, dass die Ziele realistisch und von Ihnen selbst bestimmt sind.'
    },
    {
      category: 'Erfolgschancen',
      question: 'Was passiert, wenn das Coaching nicht den gewünschten Erfolg bringt?',
      answer: 'Sollten Sie nach einigen Sitzungen das Gefühl haben, dass wir nicht vorankommen, besprechen wir dies offen. Manchmal braucht es eine Anpassung der Methoden oder Ziele. In seltenen Fällen kann es auch sinnvoll sein, das Coaching zu beenden oder Sie an einen Kollegen zu verweisen. Ihr Erfolg steht für mich im Mittelpunkt.'
    },
    {
      category: 'Erfolgschancen',
      question: 'Kann ich jederzeit aufhören?',
      answer: 'Selbstverständlich. Coaching ist ein freiwilliger Prozess und Sie können jederzeit entscheiden, ihn zu beenden. Es gibt keine langfristigen Vertragsbindungen. Wir arbeiten von Termin zu Termin und Sie entscheiden nach jeder Sitzung, ob Sie weitermachen möchten. Ein offenes Abschlussgespräch ist dabei immer sinnvoll.'
    }
  ];

  // Group FAQ items by category
  const groupedFAQ = faqData.reduce((acc, item, index) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ ...item, originalIndex: index });
    return acc;
  }, {} as Record<string, Array<FAQItem & { originalIndex: number }>>);

  return (
    <>
      <style>{mobileStyles}</style>
      
      <section style={styles.hero}>
        <h1 style={styles.title}>
          Häufig gestellte Fragen
        </h1>
        <p style={styles.subtitle}>
          Hier finden Sie Antworten auf die wichtigsten Fragen rund um Coaching 
          und meine Arbeitsweise. Sollten Sie weitere Fragen haben, kontaktieren Sie mich gerne.
        </p>
      </section>

      <section className="section-padding" style={styles.section}>
        <h2 style={styles.sectionTitle}>FAQ</h2>
        
        {Object.entries(groupedFAQ).map(([category, items]) => (
          <div key={category}>
            <h3 style={styles.categoryTitle}>{category}</h3>
            
            {items.map((item) => {
              const isOpen = openItems.includes(item.originalIndex);
              return (
                <div 
                  key={item.originalIndex}
                  style={{
                    ...styles.faqItem,
                    ...(isOpen ? styles.faqItemOpen : {}),
                  }}
                >
                  <button
                    className="question-button"
                    style={styles.questionButton}
                    onClick={() => toggleItem(item.originalIndex)}
                    onMouseEnter={(e) => {
                      if (!isOpen) {
                        Object.assign(e.currentTarget.style, styles.questionButtonHover);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isOpen) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span style={styles.questionText}>{item.question}</span>
                    <span 
                      style={{
                        ...styles.toggleIcon,
                        ...(isOpen ? styles.toggleIconOpen : {}),
                      }}
                    >
                      +
                    </span>
                  </button>
                  
                  <div 
                    className={isOpen ? "answer-container-open" : ""}
                    style={{
                      ...styles.answerContainer,
                      ...(isOpen ? styles.answerContainerOpen : {}),
                    }}
                  >
                    <div style={styles.answer}>
                      {item.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </section>

      <div style={styles.contactSection}>
        <h2 style={styles.contactTitle}>
          Noch Fragen offen?
        </h2>
        <p style={styles.contactText}>
          Falls Sie hier nicht die Antwort auf Ihre Frage gefunden haben, 
          kontaktieren Sie mich gerne direkt. Ich nehme mir gerne Zeit für 
          ein persönliches Gespräch und beantworte alle Ihre Fragen ausführlich.
        </p>
        
        <Link
          to="/preview/coaching"
          style={styles.contactButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Kostenloses Erstgespräch vereinbaren
        </Link>
        
        <div style={{ marginTop: '2rem', fontSize: '1rem' }}>
          <strong>E-Mail:</strong> kontakt@melaniezeyer.de<br />
          <strong>Telefon:</strong> +49 (0) 123 456 789
        </div>
      </div>
    </>
  );
};

export default FAQ;