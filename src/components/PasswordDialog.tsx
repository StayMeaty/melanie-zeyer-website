import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '../types';
import { checkPassword, setAuthentication } from '../utils/auth';

interface PasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PasswordDialog: React.FC<PasswordDialogProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Bitte geben Sie ein Passwort ein');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Small delay to show loading state
    setTimeout(() => {
      if (checkPassword(password)) {
        setAuthentication();
        onSuccess();
      } else {
        setError('Falsches Passwort');
        setPassword('');
      }
      setIsSubmitting(false);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (form) {
        handleSubmit({ preventDefault: () => {} } as React.FormEvent);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const styles: Record<string, React.CSSProperties> = {
    backdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    },
    dialog: {
      backgroundColor: APP_CONFIG.colors.background,
      borderRadius: '1rem',
      padding: '2rem',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      width: '90%',
      maxWidth: '400px',
      position: 'relative',
      animation: 'fadeInScale 0.2s ease-out',
    },
    closeButton: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      color: APP_CONFIG.colors.secondary,
      cursor: 'pointer',
      width: '2rem',
      height: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '0.5rem',
      transition: 'color 0.2s ease, background-color 0.2s ease',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: APP_CONFIG.colors.primary,
      marginBottom: '1.5rem',
      textAlign: 'center',
      paddingRight: '2rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    input: {
      padding: '1rem',
      fontSize: '1rem',
      border: `2px solid ${APP_CONFIG.colors.secondary}40`,
      borderRadius: '0.5rem',
      fontFamily: 'Arimo, sans-serif',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      backgroundColor: APP_CONFIG.colors.background,
    },
    inputFocus: {
      borderColor: APP_CONFIG.colors.primary,
    },
    submitButton: {
      padding: '1rem 2rem',
      fontSize: '1rem',
      fontWeight: '600',
      fontFamily: 'Arimo, sans-serif',
      backgroundColor: APP_CONFIG.colors.primary,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      opacity: isSubmitting ? 0.7 : 1,
      transform: 'scale(1)',
    },
    submitButtonHover: {
      backgroundColor: '#007a94',
      transform: 'scale(1.02)',
    },
    submitButtonDisabled: {
      cursor: 'not-allowed',
      opacity: 0.6,
    },
    error: {
      color: '#e74c3c',
      fontSize: '0.9rem',
      textAlign: 'center',
      marginTop: '0.5rem',
      fontWeight: '500',
    },
  };

  return (
    <div 
      style={styles.backdrop} 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-dialog-title"
    >
      <div style={styles.dialog}>
        <button
          style={styles.closeButton}
          onClick={onClose}
          aria-label="Dialog schließen"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${APP_CONFIG.colors.secondary}20`;
            e.currentTarget.style.color = APP_CONFIG.colors.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = APP_CONFIG.colors.secondary;
          }}
        >
          ✕
        </button>
        
        <h2 id="password-dialog-title" style={styles.title}>
          Passwort eingeben
        </h2>
        
        <form style={styles.form} onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Passwort"
            style={styles.input}
            onFocus={(e) => {
              e.target.style.borderColor = APP_CONFIG.colors.primary;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = `${APP_CONFIG.colors.secondary}40`;
            }}
            autoFocus
            aria-describedby={error ? "password-error" : undefined}
            disabled={isSubmitting}
          />
          
          <button
            type="submit"
            style={{
              ...styles.submitButton,
              ...(isSubmitting ? styles.submitButtonDisabled : {})
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                Object.assign(e.currentTarget.style, styles.submitButtonHover);
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = APP_CONFIG.colors.primary;
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Überprüfung...' : 'Bestätigen'}
          </button>
          
          {error && (
            <div id="password-error" style={styles.error} role="alert">
              {error}
            </div>
          )}
        </form>
      </div>
      
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default PasswordDialog;