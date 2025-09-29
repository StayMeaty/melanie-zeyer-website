import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_CONFIG } from '../types';
import { isAuthenticated } from '../utils/auth';
import PasswordDialog from './PasswordDialog';

interface PreviewButtonProps {
  onClick?: () => void;
}

const PreviewButton: React.FC<PreviewButtonProps> = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    // In development mode, always clear auth and show password dialog for testing
    const isDevelopment = import.meta.env.DEV;
    
    if (isDevelopment) {
      // Clear any existing authentication in development
      localStorage.removeItem('auth_token');
      setShowPasswordDialog(true);
    } else {
      // Check if user is already authenticated (production behavior)
      if (isAuthenticated()) {
        navigate('/preview');
      } else {
        setShowPasswordDialog(true);
      }
    }
  };

  const handlePasswordSuccess = () => {
    setShowPasswordDialog(false);
    navigate('/preview');
  };

  const handlePasswordClose = () => {
    setShowPasswordDialog(false);
  };

  const styles: Record<string, React.CSSProperties> = {
    button: {
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      backgroundColor: APP_CONFIG.colors.primary,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '2rem',
      padding: '1rem 2rem',
      fontSize: '1rem',
      fontWeight: '600',
      fontFamily: 'Arimo, sans-serif',
      cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(0, 151, 178, 0.3)',
      transition: 'all 0.3s ease',
      zIndex: 100,
      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    arrow: {
      display: 'inline-block',
      width: '0',
      height: '0',
      borderLeft: '8px solid #FFFFFF',
      borderTop: '5px solid transparent',
      borderBottom: '5px solid transparent',
      marginLeft: '0.25rem',
    },
  };

  return (
    <>
      <button
        style={styles.button}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        Preview
        <span style={styles.arrow}></span>
      </button>
      
      <PasswordDialog
        isOpen={showPasswordDialog}
        onClose={handlePasswordClose}
        onSuccess={handlePasswordSuccess}
      />
    </>
  );
};

export default PreviewButton;