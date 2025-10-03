/**
 * Simplified Tina CMS Authentication Status Component
 * Basic authentication status display
 */

import React from 'react';
import { useTinaAuth } from '../services/tinaAuth';

interface TinaAuthStatusProps {
  className?: string;
  showDetails?: boolean;
}

const TinaAuthStatus: React.FC<TinaAuthStatusProps> = ({ 
  className = '',
  showDetails = false,
}) => {
  const { isAuthenticated, logout } = useTinaAuth();

  if (!showDetails) {
    return (
      <div className={`tina-auth-status ${className}`}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '500',
          backgroundColor: isAuthenticated ? '#dcfce7' : '#fee2e2',
          color: isAuthenticated ? '#166534' : '#991b1b',
        }}>
          {isAuthenticated ? '✓ Verbunden' : '✗ Nicht verbunden'}
        </span>
        {isAuthenticated && (
          <button
            onClick={logout}
            style={{
              marginLeft: '0.5rem',
              padding: '0.25rem 0.5rem',
              backgroundColor: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              color: '#64748b',
            }}
          >
            Abmelden
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`tina-auth-status ${className}`}>
      <div style={{
        padding: '1rem',
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: '#111827',
            margin: 0,
          }}>
            Authentication Status
          </h3>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '500',
            backgroundColor: isAuthenticated ? '#dcfce7' : '#fee2e2',
            color: isAuthenticated ? '#166534' : '#991b1b',
          }}>
            {isAuthenticated ? 'Verbunden' : 'Nicht verbunden'}
          </span>
        </div>

        {isAuthenticated ? (
          <div>
            <p style={{
              color: '#065f46',
              fontSize: '0.875rem',
              marginBottom: '1rem',
            }}>
              Sie sind erfolgreich angemeldet und können Inhalte verwalten.
            </p>
            <button
              onClick={logout}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Abmelden
            </button>
          </div>
        ) : (
          <p style={{
            color: '#991b1b',
            fontSize: '0.875rem',
          }}>
            Bitte melden Sie sich an, um auf das Content Management System zuzugreifen.
          </p>
        )}
      </div>
    </div>
  );
};

export default TinaAuthStatus;