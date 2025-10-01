import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { APP_COLORS } from '../types';

interface LocationState {
  from?: string;
}

const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the path the user was trying to access
  const state = location.state as LocationState;
  const from = state?.from || '/admin';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setError(null);
    
    // Basic validation
    if (!password.trim()) {
      setError('Bitte geben Sie ein Passwort ein.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await login(password, rememberMe);
      
      if (result.success) {
        // Clear password from memory
        setPassword('');
        // Navigate to the protected route
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Anmeldung fehlgeschlagen.');
        // Clear password on error
        setPassword('');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Ein unerwarteter Fehler ist aufgetreten.');
      setPassword('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const styles: Record<string, React.CSSProperties> = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f7fafc',
      padding: '1rem',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      padding: '2.5rem',
      width: '100%',
      maxWidth: '400px',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    logo: {
      width: '60px',
      height: '60px',
      margin: '0 auto 1rem',
      backgroundColor: APP_COLORS.primary,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      color: 'white',
      fontWeight: 'bold',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '0.5rem',
    },
    subtitle: {
      fontSize: '0.875rem',
      color: '#718096',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#4a5568',
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      paddingRight: '2.5rem',
      fontSize: '0.875rem',
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      outline: 'none',
      transition: 'all 0.2s',
      backgroundColor: 'white',
    },
    inputFocus: {
      borderColor: APP_COLORS.primary,
      boxShadow: `0 0 0 3px ${APP_COLORS.primary}20`,
    },
    inputError: {
      borderColor: '#fc8181',
    },
    showPasswordButton: {
      position: 'absolute',
      right: '0.75rem',
      background: 'none',
      border: 'none',
      color: '#718096',
      cursor: 'pointer',
      padding: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      outline: 'none',
    },
    checkboxGroup: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    checkbox: {
      width: '1rem',
      height: '1rem',
      accentColor: APP_COLORS.primary,
      cursor: 'pointer',
    },
    checkboxLabel: {
      fontSize: '0.875rem',
      color: '#4a5568',
      cursor: 'pointer',
      userSelect: 'none',
    },
    submitButton: {
      backgroundColor: APP_COLORS.primary,
      color: 'white',
      padding: '0.75rem 1.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      borderRadius: '0.375rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginTop: '0.5rem',
    },
    submitButtonHover: {
      backgroundColor: '#007a8f',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 151, 178, 0.3)',
    },
    submitButtonDisabled: {
      backgroundColor: '#cbd5e0',
      cursor: 'not-allowed',
      transform: 'none',
    },
    error: {
      backgroundColor: '#fed7d7',
      color: '#c53030',
      padding: '0.75rem',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      border: '1px solid #fc8181',
    },
    loadingSpinner: {
      display: 'inline-block',
      width: '1rem',
      height: '1rem',
      border: '2px solid transparent',
      borderTopColor: 'white',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      marginRight: '0.5rem',
    },
    securityNote: {
      fontSize: '0.75rem',
      color: '#718096',
      textAlign: 'center',
      marginTop: '1.5rem',
      padding: '0.75rem',
      backgroundColor: '#f7fafc',
      borderRadius: '0.375rem',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>MZ</div>
          <h1 style={styles.title}>Admin-Bereich</h1>
          <p style={styles.subtitle}>Bitte melden Sie sich an, um fortzufahren</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.error} role="alert">
              {error}
            </div>
          )}

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>
              Passwort
            </label>
            <div style={styles.inputWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                onFocus={(e) => {
                  e.target.style.borderColor = APP_COLORS.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${APP_COLORS.primary}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
                style={{
                  ...styles.input,
                  ...(error ? styles.inputError : {}),
                }}
                placeholder="Ihr Passwort eingeben"
                disabled={isSubmitting}
                autoComplete="off"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.showPasswordButton}
                tabIndex={-1}
                aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
              >
                {showPassword ? (
                  // Eye-off icon
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  // Eye icon
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div style={styles.checkboxGroup}>
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={styles.checkbox}
              disabled={isSubmitting}
            />
            <label htmlFor="rememberMe" style={styles.checkboxLabel}>
              Angemeldet bleiben (24 Stunden)
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.submitButton,
              ...(isSubmitting ? styles.submitButtonDisabled : {}),
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                Object.assign(e.currentTarget.style, styles.submitButtonHover);
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                e.currentTarget.style.backgroundColor = APP_COLORS.primary;
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {isSubmitting ? (
              <>
                <span style={styles.loadingSpinner} />
                Anmeldung läuft...
              </>
            ) : (
              'Anmelden'
            )}
          </button>
        </form>

        <div style={styles.securityNote}>
          <strong>Sicherheitshinweis:</strong> Diese Anmeldung ist nur für autorisierte Administratoren. 
          Alle Anmeldeversuche werden protokolliert. Nach 5 fehlgeschlagenen Versuchen wird der Zugang 
          für 15 Minuten gesperrt.
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AdminLogin;