import React, { useState } from 'react';
import { APP_CONFIG } from '../types';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactFormProps {
  onClose?: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // For Netlify Forms, we submit to the same page with form-name parameter
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          'form-name': 'contact',
          ...formData
        }).toString()
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles: Record<string, React.CSSProperties> = {
    container: {
      backgroundColor: '#FFFFFF',
      borderRadius: '1rem',
      padding: '3rem',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      maxWidth: '600px',
      width: '100%',
      margin: '0 auto',
    },
    title: {
      fontSize: 'clamp(1.8rem, 4vw, 2.2rem)',
      color: APP_CONFIG.colors.primary,
      fontWeight: '700',
      fontFamily: "'Sumana', serif",
      marginBottom: '0.5rem',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: '1rem',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
      marginBottom: '2rem',
      textAlign: 'center',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.95rem',
      color: APP_CONFIG.colors.secondary,
      fontWeight: '600',
      fontFamily: "'Arimo', sans-serif",
    },
    input: {
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      fontFamily: "'Arimo', sans-serif",
      border: `1px solid ${APP_CONFIG.colors.secondary}30`,
      borderRadius: '0.5rem',
      backgroundColor: '#FFFFFF',
      color: APP_CONFIG.colors.secondary,
      transition: 'border-color 0.3s ease',
      outline: 'none',
    },
    textarea: {
      padding: '0.75rem 1rem',
      fontSize: '1rem',
      fontFamily: "'Arimo', sans-serif",
      border: `1px solid ${APP_CONFIG.colors.secondary}30`,
      borderRadius: '0.5rem',
      backgroundColor: '#FFFFFF',
      color: APP_CONFIG.colors.secondary,
      transition: 'border-color 0.3s ease',
      outline: 'none',
      minHeight: '150px',
      resize: 'vertical',
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      marginTop: '1rem',
    },
    submitButton: {
      padding: '0.75rem 2rem',
      backgroundColor: APP_CONFIG.colors.accent,
      color: '#333',
      border: 'none',
      borderRadius: '2rem',
      fontSize: '1rem',
      fontWeight: '600',
      fontFamily: "'Arimo', sans-serif",
      cursor: isSubmitting ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      opacity: isSubmitting ? 0.7 : 1,
    },
    cancelButton: {
      padding: '0.75rem 2rem',
      backgroundColor: 'transparent',
      color: APP_CONFIG.colors.secondary,
      border: `1px solid ${APP_CONFIG.colors.secondary}30`,
      borderRadius: '2rem',
      fontSize: '1rem',
      fontWeight: '600',
      fontFamily: "'Arimo', sans-serif",
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    statusMessage: {
      textAlign: 'center',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      fontSize: '0.95rem',
      fontFamily: "'Arimo', sans-serif",
      marginTop: '1rem',
      backgroundColor: submitStatus === 'success' 
        ? `${APP_CONFIG.colors.primary}10`
        : submitStatus === 'error' 
        ? '#ff000010' 
        : 'transparent',
      color: submitStatus === 'success' 
        ? APP_CONFIG.colors.primary
        : submitStatus === 'error' 
        ? '#ff0000' 
        : 'transparent',
    },
  };

  const mobileStyles = `
    @media (max-width: 768px) {
      .contact-form-container {
        padding: 2rem !important;
      }
    }
  `;

  return (
    <>
      <style>{mobileStyles}</style>
      
      <div className="contact-form-container" style={styles.container}>
        <h2 style={styles.title}>Kontakt aufnehmen</h2>
        <p style={styles.subtitle}>
          Haben Sie Fragen? Schreiben Sie uns eine Nachricht!
        </p>

        {/* Hidden form for Netlify to detect */}
        <form name="contact" netlify-honeypot="bot-field" hidden>
          <input type="text" name="name" />
          <input type="email" name="email" />
          <input type="text" name="subject" />
          <textarea name="message"></textarea>
        </form>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="name">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              required
              onFocus={(e) => {
                e.currentTarget.style.borderColor = APP_CONFIG.colors.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = `${APP_CONFIG.colors.secondary}30`;
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="email">
              E-Mail *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              required
              onFocus={(e) => {
                e.currentTarget.style.borderColor = APP_CONFIG.colors.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = `${APP_CONFIG.colors.secondary}30`;
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="subject">
              Betreff *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              style={styles.input}
              required
              onFocus={(e) => {
                e.currentTarget.style.borderColor = APP_CONFIG.colors.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = `${APP_CONFIG.colors.secondary}30`;
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="message">
              Nachricht *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              style={styles.textarea}
              required
              onFocus={(e) => {
                e.currentTarget.style.borderColor = APP_CONFIG.colors.primary;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = `${APP_CONFIG.colors.secondary}30`;
              }}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={isSubmitting}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#d4b86a';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = APP_CONFIG.colors.accent;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {isSubmitting ? 'Wird gesendet...' : 'Nachricht senden'}
            </button>
            {onClose && (
              <button
                type="button"
                style={styles.cancelButton}
                onClick={onClose}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = APP_CONFIG.colors.secondary;
                  e.currentTarget.style.backgroundColor = `${APP_CONFIG.colors.secondary}05`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${APP_CONFIG.colors.secondary}30`;
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Abbrechen
              </button>
            )}
          </div>
        </form>

        {submitStatus !== 'idle' && (
          <div style={styles.statusMessage}>
            {submitStatus === 'success' && 'Ihre Nachricht wurde erfolgreich gesendet!'}
            {submitStatus === 'error' && 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.'}
          </div>
        )}
      </div>
    </>
  );
};

export default ContactForm;