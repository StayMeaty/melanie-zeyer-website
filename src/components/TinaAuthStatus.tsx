/**
 * Tina CMS Authentication Status Component
 * Displays current authentication status and provides login/configuration UI
 */

import React, { useState } from 'react';
import { 
  useTinaAuth, 
  useTinaConfig, 
  useTinaProvider,
  checkGitHubTokenScopes,
  testGitHubRepoAccess,
  getGitHubTokenInstructions,
} from '../services/tinaAuth';
import { generateCSRFToken } from '../services/tinaTokenProxy';
import { getSecuritySummary } from '../services/securityLogger';

interface TinaAuthStatusProps {
  className?: string;
  showDetails?: boolean;
}

const TinaAuthStatus: React.FC<TinaAuthStatusProps> = ({ 
  className = '',
  showDetails = false,
}) => {
  const { isAuthenticated, isLoading, session, login, logout } = useTinaAuth();
  const config = useTinaConfig();
  const provider = useTinaProvider();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    scopes: { hasRequiredScopes: boolean; scopes: string[]; missingScopes: string[] };
    access: { success: boolean; error?: string; details?: { hasRepo: boolean; hasBranch: boolean; hasWriteAccess: boolean } };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const securitySummary = getSecuritySummary();

  const handleLogin = async () => {
    setError(null);
    // Generate CSRF token for this operation
    generateCSRFToken();
    
    // Login without exposing token in UI
    const result = await login();
    
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  const handleTestConnection = async () => {
    if (!config.hasToken) {
      setError('No token configured. Please set VITE_GITHUB_TOKEN in your environment.');
      return;
    }
    
    setTesting(true);
    setError(null);
    setTestResult(null);
    
    try {
      // Test token scopes - token is retrieved securely inside the function
      const scopeResult = await checkGitHubTokenScopes();
      
      // Test repository access - token is retrieved securely inside the function
      const accessResult = await testGitHubRepoAccess(
        config.repository,
        config.branch
      );
      
      setTestResult({
        scopes: scopeResult,
        access: accessResult,
      });
      
      if (!scopeResult.hasRequiredScopes) {
        setError(`Missing required scopes: ${scopeResult.missingScopes.join(', ')}`);
      } else if (!accessResult.success) {
        setError(accessResult.error || 'Repository access test failed');
      } else {
        // Connection test successful
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setTesting(false);
    }
  };

  if (!config.enabled) {
    return (
      <div className={`tina-auth-status ${className}`}>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '0.5rem',
          marginBottom: '1rem',
        }}>
          <p style={{ margin: 0, color: '#6b7280' }}>
            Tina CMS is disabled. Set VITE_USE_TINA_CMS=true to enable.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`tina-auth-status ${className}`}>
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <p>Loading authentication status...</p>
        </div>
      </div>
    );
  }

  const styles = {
    container: {
      padding: '1.5rem',
      backgroundColor: '#ffffff',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      marginBottom: '1rem',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    title: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#111827',
      margin: 0,
    },
    status: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    statusConnected: {
      backgroundColor: '#d1fae5',
      color: '#065f46',
    },
    statusDisconnected: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
    },
    statusLocal: {
      backgroundColor: '#dbeafe',
      color: '#1e40af',
    },
    details: {
      marginTop: '1rem',
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
    },
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.5rem',
    },
    label: {
      color: '#6b7280',
      fontWeight: 500,
    },
    value: {
      color: '#111827',
      fontFamily: 'monospace',
      fontSize: '0.875rem',
    },
    form: {
      marginTop: '1rem',
    },
    input: {
      width: '100%',
      padding: '0.5rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      marginBottom: '0.5rem',
    },
    button: {
      padding: '0.5rem 1rem',
      backgroundColor: '#0097B2',
      color: '#ffffff',
      border: 'none',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      marginRight: '0.5rem',
    },
    buttonSecondary: {
      backgroundColor: '#6b7280',
    },
    buttonDanger: {
      backgroundColor: '#ef4444',
    },
    error: {
      padding: '0.75rem',
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      borderRadius: '0.375rem',
      marginTop: '0.5rem',
      fontSize: '0.875rem',
    },
    success: {
      padding: '0.75rem',
      backgroundColor: '#d1fae5',
      color: '#065f46',
      borderRadius: '0.375rem',
      marginTop: '0.5rem',
      fontSize: '0.875rem',
    },
    instructions: {
      marginTop: '1rem',
      padding: '1rem',
      backgroundColor: '#f3f4f6',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      lineHeight: '1.5',
    },
    instructionsList: {
      marginLeft: '1.5rem',
      marginTop: '0.5rem',
    },
  };

  const getStatusStyle = () => {
    if (config.isLocalDevelopment && config.useLocalAuth) {
      return { ...styles.status, ...styles.statusLocal };
    }
    return isAuthenticated 
      ? { ...styles.status, ...styles.statusConnected }
      : { ...styles.status, ...styles.statusDisconnected };
  };

  const getStatusText = () => {
    if (config.isLocalDevelopment && config.useLocalAuth) {
      return 'Local Development';
    }
    return isAuthenticated ? 'Connected' : 'Not Connected';
  };

  return (
    <div className={`tina-auth-status ${className}`}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Tina CMS Authentication</h3>
          <span style={getStatusStyle()}>
            {getStatusText()}
          </span>
        </div>

        {isAuthenticated && session && (
          <>
            {showDetails && (
              <div style={styles.details}>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Provider:</span>
                  <span style={styles.value}>{provider?.displayName}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Repository:</span>
                  <span style={styles.value}>{session.repository || 'N/A'}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Branch:</span>
                  <span style={styles.value}>{session.branch || 'N/A'}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Session Expires:</span>
                  <span style={styles.value}>
                    {new Date(session.expiresAt).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            
            <button 
              onClick={logout}
              style={{ ...styles.button, ...styles.buttonDanger }}
            >
              Disconnect
            </button>
          </>
        )}

        {!isAuthenticated && (
          <div style={styles.form}>
            {!config.isLocalDevelopment && (
              <>
                <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  {config.hasToken 
                    ? 'Token is configured in environment. Click Connect to authenticate.'
                    : 'No token configured. Please set VITE_GITHUB_TOKEN in your .env file.'}
                </p>
              </>
            )}
            
            <div>
              <button 
                onClick={handleLogin}
                disabled={!config.isLocalDevelopment && !config.hasToken}
                style={styles.button}
              >
                {config.isLocalDevelopment ? 'Connect Local' : 'Connect with GitHub'}
              </button>
              
              {!config.isLocalDevelopment && (
                <>
                  <button
                    onClick={handleTestConnection}
                    disabled={testing || !config.hasToken}
                    style={{ ...styles.button, ...styles.buttonSecondary }}
                  >
                    {testing ? 'Testing...' : 'Test Connection'}
                  </button>
                  
                  <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    style={{ ...styles.button, ...styles.buttonSecondary }}
                  >
                    {showInstructions ? 'Hide' : 'Show'} Instructions
                  </button>
                  
                  {import.meta.env.DEV && (
                    <button
                      onClick={() => setShowSecurityInfo(!showSecurityInfo)}
                      style={{ ...styles.button, ...styles.buttonSecondary }}
                    >
                      Security Info
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {testResult && (
          <div style={testResult.access?.success ? styles.success : styles.error}>
            <strong>Test Results:</strong>
            <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
              <li>
                Token Scopes: {testResult.scopes.scopes.join(', ') || 'None'}
                {!testResult.scopes.hasRequiredScopes && (
                  <span> (Missing: {testResult.scopes.missingScopes.join(', ')})</span>
                )}
              </li>
              {testResult.access && (
                <>
                  <li>Repository Access: {testResult.access.details?.hasRepo ? '✓' : '✗'}</li>
                  <li>Branch Exists: {testResult.access.details?.hasBranch ? '✓' : '✗'}</li>
                  <li>Write Permission: {testResult.access.details?.hasWriteAccess ? '✓' : '✗'}</li>
                </>
              )}
            </ul>
          </div>
        )}

        {showInstructions && !config.isLocalDevelopment && (
          <div style={styles.instructions}>
            <strong>How to Generate a GitHub Token:</strong>
            <ol style={styles.instructionsList}>
              {getGitHubTokenInstructions().map((instruction, index) => (
                <li key={index} style={{ marginBottom: '0.25rem' }}>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        )}

        {!provider?.isConfigured && !config.isLocalDevelopment && (
          <div style={{ ...styles.error, marginTop: '1rem' }}>
            <strong>Configuration Required:</strong>
            <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
              {!config.hasToken && <li>Missing: VITE_GITHUB_TOKEN</li>}
              {!config.repository && <li>Missing: VITE_GITHUB_REPO</li>}
              {!config.branch && <li>Missing: VITE_GITHUB_BRANCH (will use "main")</li>}
            </ul>
          </div>
        )}
        
        {showSecurityInfo && import.meta.env.DEV && (
          <div style={{ ...styles.details, marginTop: '1rem' }}>
            <strong>Security Status:</strong>
            <div style={styles.detailRow}>
              <span style={styles.label}>Total Security Events:</span>
              <span style={styles.value}>{securitySummary.totalEvents}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.label}>Critical Events:</span>
              <span style={styles.value}>{securitySummary.criticalEvents}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.label}>Warning Events:</span>
              <span style={styles.value}>{securitySummary.warningEvents}</span>
            </div>
            {securitySummary.recentCritical.length > 0 && (
              <div style={{ marginTop: '0.5rem', color: '#ef4444' }}>
                <strong>Recent Critical Events:</strong>
                <ul style={{ margin: '0.25rem 0 0 1rem', fontSize: '0.75rem' }}>
                  {securitySummary.recentCritical.slice(0, 3).map((event, i) => (
                    <li key={i}>{event.event} - {new Date(event.timestamp).toLocaleTimeString()}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TinaAuthStatus;