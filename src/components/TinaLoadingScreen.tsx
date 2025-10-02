import React from 'react';
import { APP_COLORS } from '../types';

interface TinaLoadingScreenProps {
  message?: string;
}

const TinaLoadingScreen: React.FC<TinaLoadingScreenProps> = ({ 
  message = 'Lade Tina CMS...' 
}) => {
  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '0.5rem',
      padding: '2rem',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      textAlign: 'center' as const,
      maxWidth: '400px',
      width: '100%',
      margin: '0 1rem',
    },
    logo: {
      width: '48px',
      height: '48px',
      margin: '0 auto 1.5rem',
      backgroundColor: APP_COLORS.primary,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'pulse 2s infinite',
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '0.5rem',
    },
    message: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '1.5rem',
    },
    progressBar: {
      width: '100%',
      height: '4px',
      backgroundColor: '#e5e7eb',
      borderRadius: '2px',
      overflow: 'hidden',
      position: 'relative' as const,
    },
    progressFill: {
      height: '100%',
      backgroundColor: APP_COLORS.primary,
      width: '30%',
      animation: 'loading 2s infinite',
    },
  };

  React.useEffect(() => {
    // Add keyframe animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes loading {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(400%); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <h2 style={styles.title}>Tina CMS</h2>
        <p style={styles.message}>{message}</p>
        <div style={styles.progressBar}>
          <div style={styles.progressFill} />
        </div>
      </div>
    </div>
  );
};

export default TinaLoadingScreen;