import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/auth';
import { APP_COLORS } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof import('../types/blog').AdminUser['permissions'];
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission,
  redirectTo = '/admin/login' 
}) => {
  const { isAuthenticated, isLoading, user, checkSession } = useAuth();
  const location = useLocation();

  // Handle visibility change (tab focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Check session when tab becomes visible
        checkSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkSession]);

  // Loading state with spinner
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Überprüfe Authentifizierung...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    // Preserve the current location so we can redirect back after login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check specific permission if required
  if (requiredPermission && user) {
    const hasPermission = user.permissions[requiredPermission];
    
    if (!hasPermission) {
      // User is authenticated but lacks required permission
      return (
        <div style={styles.accessDeniedContainer}>
          <div style={styles.accessDeniedCard}>
            <div style={styles.accessDeniedIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h2 style={styles.accessDeniedTitle}>Zugriff verweigert</h2>
            <p style={styles.accessDeniedText}>
              Sie haben nicht die erforderlichen Berechtigungen, um auf diese Seite zuzugreifen.
            </p>
            <p style={styles.accessDeniedPermission}>
              Erforderliche Berechtigung: <strong>{getPermissionName(requiredPermission)}</strong>
            </p>
            <button 
              onClick={() => window.history.back()}
              style={styles.backButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#007a8f';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = APP_COLORS.primary;
                e.currentTarget.style.transform = 'none';
              }}
            >
              Zurück
            </button>
          </div>
        </div>
      );
    }
  }

  // All checks passed - render protected content
  return <>{children}</>;
};

// Helper function to get readable permission names in German
const getPermissionName = (permission: string): string => {
  const permissionNames: Record<string, string> = {
    canCreatePosts: 'Beiträge erstellen',
    canEditPosts: 'Beiträge bearbeiten',
    canDeletePosts: 'Beiträge löschen',
    canManageComments: 'Kommentare verwalten',
    canManageUsers: 'Benutzer verwalten',
    canManageSettings: 'Einstellungen verwalten',
  };
  
  return permissionNames[permission] || permission;
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7fafc',
  },
  loadingCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '2rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  spinner: {
    width: '2.5rem',
    height: '2.5rem',
    border: '3px solid #e2e8f0',
    borderTopColor: APP_COLORS.primary,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    color: '#4a5568',
    fontSize: '0.875rem',
    margin: 0,
  },
  accessDeniedContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7fafc',
    padding: '1rem',
  },
  accessDeniedCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '3rem',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
  },
  accessDeniedIcon: {
    width: '48px',
    height: '48px',
    margin: '0 auto 1.5rem',
    color: '#e53e3e',
  },
  accessDeniedTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: '1rem',
    margin: '0 0 1rem 0',
  },
  accessDeniedText: {
    fontSize: '0.875rem',
    color: '#718096',
    marginBottom: '1rem',
  },
  accessDeniedPermission: {
    fontSize: '0.8125rem',
    color: '#a0aec0',
    marginBottom: '2rem',
    padding: '0.75rem',
    backgroundColor: '#f7fafc',
    borderRadius: '0.25rem',
  },
  backButton: {
    backgroundColor: APP_COLORS.primary,
    color: 'white',
    padding: '0.75rem 2rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

// Global styles for spinner animation
if (typeof document !== 'undefined' && !document.getElementById('protected-route-styles')) {
  const style = document.createElement('style');
  style.id = 'protected-route-styles';
  style.innerHTML = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default ProtectedRoute;

/**
 * Higher-order component for protecting components
 * Alternative way to use protection without wrapping in JSX
 */
export const withProtectedRoute = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission?: keyof import('../types/blog').AdminUser['permissions']
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <ProtectedRoute requiredPermission={requiredPermission}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  WrappedComponent.displayName = `Protected(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
};