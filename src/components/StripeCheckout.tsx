import React, { useState } from 'react';
import { APP_CONFIG } from '../types';

interface StripeCheckoutProps {
  courseName: string;
  price: string;
  onClose: () => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({ courseName, price, onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleCheckout = () => {
    setIsProcessing(true);
    // Mock checkout - in production would redirect to Stripe
    setTimeout(() => {
      alert('Demo: Weiterleitung zu Stripe Checkout für ' + courseName);
      setIsProcessing(false);
      onClose();
    }, 1500);
  };

  const styles: Record<string, React.CSSProperties> = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
    },
    modal: {
      backgroundColor: '#FFFFFF',
      borderRadius: '1rem',
      padding: '2rem',
      maxWidth: '500px',
      width: '90%',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    },
    header: {
      borderBottom: `2px solid ${APP_CONFIG.colors.primary}`,
      paddingBottom: '1rem',
      marginBottom: '1.5rem',
    },
    title: {
      fontSize: '1.5rem',
      color: APP_CONFIG.colors.primary,
      fontWeight: '700',
      fontFamily: "'Sumana', serif",
      margin: 0,
    },
    courseInfo: {
      fontSize: '1.1rem',
      color: APP_CONFIG.colors.secondary,
      fontFamily: "'Arimo', sans-serif",
      marginTop: '0.5rem',
    },
    priceDisplay: {
      fontSize: '1.3rem',
      color: APP_CONFIG.colors.accent,
      fontWeight: '600',
      fontFamily: "'Sumana', serif",
    },
    formSection: {
      marginTop: '2rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      color: APP_CONFIG.colors.primary,
      fontWeight: '600',
      fontFamily: "'Arimo', sans-serif",
      fontSize: '0.9rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      marginBottom: '1rem',
      border: `1px solid ${APP_CONFIG.colors.secondary}40`,
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontFamily: "'Arimo', sans-serif",
      backgroundColor: '#f8f9fa',
      color: '#666',
      cursor: 'not-allowed',
    },
    inputRow: {
      display: 'flex',
      gap: '1rem',
    },
    inputHalf: {
      flex: 1,
    },
    demoNotice: {
      marginTop: '1.5rem',
      textAlign: 'center',
      color: '#666',
      fontSize: '0.9rem',
      fontFamily: "'Arimo', sans-serif",
      fontStyle: 'italic',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.5rem',
      border: '1px solid #e9ecef',
    },
    buttonRow: {
      marginTop: '2rem',
      display: 'flex',
      gap: '1rem',
    },
    cancelButton: {
      flex: 1,
      padding: '1rem',
      backgroundColor: '#f0f0f0',
      color: '#666',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      fontFamily: "'Arimo', sans-serif",
      fontSize: '1rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
    },
    checkoutButton: {
      flex: 1,
      padding: '1rem',
      backgroundColor: APP_CONFIG.colors.primary,
      color: 'white',
      border: 'none',
      borderRadius: '0.5rem',
      cursor: isProcessing ? 'not-allowed' : 'pointer',
      fontFamily: "'Arimo', sans-serif",
      fontSize: '1rem',
      fontWeight: '600',
      opacity: isProcessing ? 0.7 : 1,
      transition: 'all 0.3s ease',
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Demo Checkout</h2>
          <div style={styles.courseInfo}>
            {courseName} - <span style={styles.priceDisplay}>{price}</span>
          </div>
        </div>
        
        <div style={styles.formSection}>
          <label style={styles.label}>Karteninhaber</label>
          <input 
            type="text" 
            placeholder="Max Mustermann" 
            disabled 
            style={styles.input}
          />
          
          <label style={styles.label}>Kartennummer</label>
          <input 
            type="text" 
            placeholder="4242 4242 4242 4242" 
            disabled 
            style={styles.input}
          />
          
          <div style={styles.inputRow}>
            <div style={styles.inputHalf}>
              <label style={styles.label}>Ablaufdatum</label>
              <input 
                type="text" 
                placeholder="MM/YY" 
                disabled 
                style={styles.input}
              />
            </div>
            <div style={styles.inputHalf}>
              <label style={styles.label}>CVC</label>
              <input 
                type="text" 
                placeholder="123" 
                disabled 
                style={styles.input}
              />
            </div>
          </div>
        </div>
        
        <div style={styles.demoNotice}>
          <strong>Demo-Modus:</strong> Dies ist eine Vorschau. Keine echte Zahlung wird verarbeitet.
        </div>
        
        <div style={styles.buttonRow}>
          <button 
            onClick={onClose}
            style={styles.cancelButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e0e0e0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
          >
            Abbrechen
          </button>
          <button 
            onClick={handleCheckout}
            disabled={isProcessing}
            style={styles.checkoutButton}
            onMouseEnter={(e) => {
              if (!isProcessing) {
                e.currentTarget.style.backgroundColor = '#007a9f';
              }
            }}
            onMouseLeave={(e) => {
              if (!isProcessing) {
                e.currentTarget.style.backgroundColor = APP_CONFIG.colors.primary;
              }
            }}
          >
            {isProcessing ? 'Verarbeitung...' : 'Demo Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckout;