/**
 * Tina CMS Admin Interface Component
 * Wrapper component for Tina admin interface with authentication check
 */

import React, { Suspense } from 'react';
import { useTinaAuth } from '../services/tinaAuth';
import TinaAuthStatus from './TinaAuthStatus';
import { APP_COLORS } from '../types';

// Lazy load TinaCMS with proper integration
const TinaCMS = React.lazy(async () => {
  try {
    // Load the required Tina modules
    // Load TinaCMS core module
    // Import Tina React utilities
    
    // TinaCMSProvider2 available as default export
    
    const TinaCMSWrapper: React.FC = () => {
      const { config } = useTinaAuth();
      
      // TinaCMS would be configured here in a real implementation
      
      // Custom admin interface component
      const AdminInterface: React.FC = () => {
        React.useEffect(() => {
          if (config.enabled) {
            // Register any custom fields or plugins here
            console.log('Tina CMS interface initialized');
          }
        }, []); // config.enabled is stable from useTinaAuth context
        
        return (
          <div style={{
            width: '100%',
            height: '100%',
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Tina CMS Interface Header */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: APP_COLORS.primary,
                margin: 0,
              }}>
                Content Management
              </h2>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
              }}>
                Repository: {config.repository} | Branch: {config.branch}
              </div>
            </div>

            {/* Main CMS Interface */}
            <div style={{
              flex: 1,
              display: 'flex',
              overflow: 'hidden',
            }}>
              {/* Sidebar */}
              <div style={{
                width: '300px',
                backgroundColor: 'white',
                borderRight: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <div style={{
                  padding: '1rem',
                  borderBottom: '1px solid #e5e7eb',
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '1rem',
                  }}>
                    Inhalte
                  </h3>
                  
                  {/* Info Box */}
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#fef3c7',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    color: '#92400e',
                  }}>
                    ⚠️ <strong>Hinweis:</strong><br />
                    Tina CMS wird derzeit konfiguriert.<br /><br />
                    Verwenden Sie GitHub oder die Markdown-Dateien im Repository zum Verwalten von Blog-Inhalten.
                  </div>
                </div>

                {/* Content Tree */}
                <div style={{
                  flex: 1,
                  padding: '1rem',
                  overflow: 'auto',
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                  }}>
                    <div style={{ marginBottom: '1rem' }}>
                      <strong>Verfügbare Bereiche:</strong>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      <li style={{ marginBottom: '0.5rem' }}>
                        <a 
                          href="#" 
                          style={{ 
                            color: APP_COLORS.primary, 
                            textDecoration: 'none',
                            display: 'block',
                            padding: '0.5rem',
                            borderRadius: '0.25rem'
                          }}
                        >
                          📝 Blog Beiträge
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div style={{
                flex: 1,
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                }}>
                  <div style={{
                    fontSize: '3rem',
                    marginBottom: '1rem',
                  }}>📝</div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '0.5rem',
                  }}>
                    Willkommen bei Tina CMS
                  </h3>
                  <p style={{
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    marginBottom: '1.5rem',
                  }}>
                    Wählen Sie einen Bereich aus der Seitenleiste aus, um mit der Bearbeitung zu beginnen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      };
      
      return (
        <div>
          <AdminInterface />
        </div>
      );
    };
    
    return { default: TinaCMSWrapper };
  } catch (error) {
    console.error('Failed to load TinaCMS:', error);
    throw error;
  }
});

interface TinaAdminProps {
  className?: string;
}

const TinaAdmin: React.FC<TinaAdminProps> = ({ className = '' }) => {
  const { isAuthenticated, isLoading, session, config } = useTinaAuth();

  const styles: Record<string, React.CSSProperties> = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '2rem',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      padding: '1rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: APP_COLORS.primary,
      margin: 0,
    },
    subtitle: {
      color: '#666',
      margin: 0,
      fontSize: '0.9rem',
    },
    loadingContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    loadingSpinner: {
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
      marginLeft: '1rem',
    },
    errorContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '2rem',
      textAlign: 'center',
    },
    errorTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#dc3545',
      marginBottom: '1rem',
    },
    errorMessage: {
      color: '#666',
      marginBottom: '1.5rem',
      lineHeight: '1.5',
    },
    retryButton: {
      backgroundColor: APP_COLORS.primary,
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: '500',
      transition: 'background-color 0.2s',
    },
    tinaContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      minHeight: '600px',
    },
    authRequired: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '2rem',
    },
    authRequiredTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: APP_COLORS.primary,
      marginBottom: '1rem',
      textAlign: 'center',
    },
    authRequiredText: {
      color: '#666',
      marginBottom: '2rem',
      textAlign: 'center',
      lineHeight: '1.5',
    },
    configStatus: {
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '6px',
      fontSize: '0.875rem',
      color: '#666',
      marginBottom: '1rem',
    },
    statusItem: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.5rem',
    },
    statusValue: {
      fontFamily: 'monospace',
      fontSize: '0.8rem',
    },
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={className} style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Tina CMS</h1>
            <p style={styles.subtitle}>Authentifizierung wird überprüft...</p>
          </div>
        </div>
        
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner} />
          <span style={styles.loadingText}>Lade Tina CMS...</span>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className={className} style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Tina CMS</h1>
            <p style={styles.subtitle}>Authentifizierung erforderlich</p>
          </div>
        </div>

        <div style={styles.authRequired}>
          <h2 style={styles.authRequiredTitle}>Anmeldung erforderlich</h2>
          <p style={styles.authRequiredText}>
            Bitte authentifizieren Sie sich mit Ihrem GitHub-Token, um auf das Tina CMS zuzugreifen.
            Das CMS ermöglicht es Ihnen, Blog-Inhalte visuell zu bearbeiten und zu verwalten.
          </p>

          <div style={styles.configStatus}>
            <div style={styles.statusItem}>
              <span>Tina CMS Status:</span>
              <span style={styles.statusValue}>
                {config.enabled ? 'Aktiviert' : 'Deaktiviert'}
              </span>
            </div>
            <div style={styles.statusItem}>
              <span>Umgebung:</span>
              <span style={styles.statusValue}>
                {config.isLocalDevelopment ? 'Entwicklung' : 'Produktion'}
              </span>
            </div>
            <div style={styles.statusItem}>
              <span>Repository:</span>
              <span style={styles.statusValue}>
                {config.repository || 'Nicht konfiguriert'}
              </span>
            </div>
            <div style={styles.statusItem}>
              <span>Branch:</span>
              <span style={styles.statusValue}>
                {config.branch || 'main'}
              </span>
            </div>
          </div>

          <TinaAuthStatus showDetails={true} />
        </div>
      </div>
    );
  }

  // Authenticated state - render TinaCMS
  return (
    <div className={className} style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Tina CMS</h1>
          <p style={styles.subtitle}>
            Verbunden als {session?.repository} ({session?.branch})
          </p>
        </div>
        <TinaAuthStatus />
      </div>

      <div style={styles.tinaContainer}>
        <Suspense 
          fallback={
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner} />
              <span style={styles.loadingText}>Lade Tina CMS Interface...</span>
            </div>
          }
        >
          <ErrorBoundary>
            <TinaCMS />
          </ErrorBoundary>
        </Suspense>
      </div>
    </div>
  );
};

// Error boundary for TinaCMS loading errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('TinaCMS Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#dc3545',
            marginBottom: '1rem',
          }}>
            Fehler beim Laden von Tina CMS
          </h3>
          <p style={{
            color: '#666',
            marginBottom: '1.5rem',
            lineHeight: '1.5',
          }}>
            Es gab ein Problem beim Laden der Tina CMS-Oberfläche. 
            Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: APP_COLORS.primary,
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
            }}
          >
            Seite neu laden
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global styles for spinner animation
if (typeof document !== 'undefined' && !document.getElementById('tina-admin-styles')) {
  const style = document.createElement('style');
  style.id = 'tina-admin-styles';
  style.innerHTML = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default TinaAdmin;