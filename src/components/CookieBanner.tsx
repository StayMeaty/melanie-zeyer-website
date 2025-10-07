import React, { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'melanie-cookie-consent';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Check if consent has been given
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  const styles: Record<string, React.CSSProperties> = {
    banner: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#ffffff',
      boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.15)',
      padding: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      flexWrap: 'wrap',
      borderTop: '3px solid #0097B2',
    },
    content: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      maxWidth: '800px',
      flex: '1 1 auto',
    },
    cookieImage: {
      width: '72px',
      height: '72px',
      flexShrink: 0,
    },
    text: {
      color: '#333333',
      fontSize: '0.95rem',
      lineHeight: '1.5',
      margin: 0,
    },
    button: {
      backgroundColor: '#0097B2',
      color: '#ffffff',
      border: 'none',
      padding: '0.75rem 2rem',
      fontSize: '1rem',
      fontWeight: 600,
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      whiteSpace: 'nowrap',
      boxShadow: '0 2px 8px rgba(0, 151, 178, 0.3)',
    },
    buttonHover: {
      backgroundColor: '#007a92',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 151, 178, 0.4)',
    },
  };

  return (
    <div style={styles.banner}>
      <div style={styles.content}>
        <img
          src="/assets/cookie.png"
          alt="Cookie"
          style={styles.cookieImage}
        />
        <p style={styles.text}>
          Wir verwenden Cookies, um Ihre Erfahrung auf unserer Website zu verbessern. Durch die weitere Nutzung stimmen Sie der Verwendung von Cookies zu.
        </p>
      </div>
      <button
        style={{
          ...styles.button,
          ...(isHovered ? styles.buttonHover : {}),
        }}
        onClick={handleAccept}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        Verstanden
      </button>
    </div>
  );
};

export default CookieBanner;
