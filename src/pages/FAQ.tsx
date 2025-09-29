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
    {
      category: 'Häufige Fragen',
      question: 'Häufige Frage 1?',
      answer: 'Antwort zu Frage 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'
    },
    {
      category: 'Häufige Fragen',
      question: 'Häufige Frage 2?',
      answer: 'Antwort zu Frage 2. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.'
    },
    {
      category: 'Häufige Fragen',
      question: 'Häufige Frage 3?',
      answer: 'Antwort zu Frage 3. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    },
    {
      category: 'Praktische Fragen',
      question: 'Praktische Frage 1?',
      answer: 'Antwort zu praktischer Frage 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    },
    {
      category: 'Praktische Fragen',
      question: 'Praktische Frage 2?',
      answer: 'Antwort zu praktischer Frage 2. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.'
    },
    {
      category: 'Service Fragen',
      question: 'Service Frage 1?',
      answer: 'Antwort zu Service Frage 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 
          tempor incididunt ut labore et dolore magna aliqua.
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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod 
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
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
          <strong>E-Mail:</strong> [email@domain.de]<br />
          <strong>Telefon:</strong> [Telefonnummer]
        </div>
      </div>
    </>
  );
};

export default FAQ;