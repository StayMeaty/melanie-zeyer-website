/**
 * Tina CMS Authentication Service
 * Handles GitHub-based authentication for content management
 */

import React, { createContext, useCallback, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { 
  validateTokenSecurely, 
  getSecureToken, 
  generateCSRFToken,
  clearValidationAttempts,
  generateOAuthState,
  hashToken
} from './tinaTokenProxy';
import { logSecurityEvent } from './securityLogger';

/**
 * Tina authentication configuration
 */
export interface TinaAuthConfig {
  enabled: boolean;
  hasToken: boolean; // Changed from token to hasToken - never expose token
  repository: string;
  branch: string;
  isLocalDevelopment: boolean;
  useLocalAuth: boolean;
  useTinaCloud: boolean; // Flag for Tina Cloud mode
  clientId: string | null; // Tina Cloud client ID
}

/**
 * Tina authentication session
 */
export interface TinaSession {
  isAuthenticated: boolean;
  tokenHash: string | null; // Store hash instead of token
  repository: string | null;
  branch: string | null;
  expiresAt: Date;
  createdAt: Date;
  csrfToken: string; // Add CSRF token to session
}

/**
 * Tina authentication provider interface
 */
export interface TinaAuthProvider {
  name: 'github' | 'filesystem';
  displayName: string;
  isConfigured: boolean;
  validateToken: () => Promise<boolean>;
  getAuthUrl?: () => string;
}

/**
 * Tina authentication context type
 */
interface TinaAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: TinaSession | null;
  provider: TinaAuthProvider | null;
  config: TinaAuthConfig;
  login: (token?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  validateSession: () => Promise<boolean>;
}

/**
 * Get Tina authentication configuration from environment
 */
export const getTinaConfig = (): TinaAuthConfig => {
  const clientId = import.meta.env.VITE_TINA_CLIENT_ID;
  const hasToken = Boolean(import.meta.env.VITE_GITHUB_TOKEN);
  const useTinaCloud = Boolean(clientId);
  const isLocalDevelopment = import.meta.env.DEV && !clientId && !hasToken;
  
  return {
    enabled: Boolean(import.meta.env.VITE_USE_TINA_CMS === 'true'),
    hasToken, // Only indicate if token exists, don't expose it
    repository: import.meta.env.VITE_GITHUB_REPO || '',
    branch: import.meta.env.VITE_GITHUB_BRANCH || 'main',
    isLocalDevelopment,
    useLocalAuth: isLocalDevelopment,
    useTinaCloud, // Flag for Tina Cloud mode
    clientId, // Tina Cloud client ID
  };
};

/**
 * Session storage keys
 */
const TINA_SESSION_KEY = 'tina_session';
const TINA_SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours

// Security event logging is now handled by securityLogger service
const logTinaSecurityEvent = (event: string, data?: unknown): void => {
  logSecurityEvent(`tina_${event}`, data, 'tina');
};

/**
 * Validate GitHub token by making an authenticated API request
 * Token is retrieved securely from tinaTokenProxy
 */
const validateGitHubToken = async (repo: string): Promise<boolean> => {
  if (!repo) {
    logTinaSecurityEvent('token_validation_failed', { reason: 'No repository specified' });
    return false;
  }
  
  // Get token securely from proxy service
  let token = await getSecureToken();
  
  if (!token) {
    logTinaSecurityEvent('token_validation_failed', { reason: 'No token available' });
    return false;
  }
  
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    if (response.status === 401) {
      logTinaSecurityEvent('token_invalid', { repo });
      return false;
    }
    
    if (response.status === 404) {
      logTinaSecurityEvent('repo_not_found', { repo });
      return false;
    }
    
    if (!response.ok) {
      logTinaSecurityEvent('validation_failed', { 
        status: response.status,
        repo,
      });
      return false;
    }
    
    const data = await response.json();
    
    // Check if we have push access (required for content management)
    if (!data.permissions?.push) {
      logTinaSecurityEvent('insufficient_permissions', { repo });
      return false;
    }
    
    logTinaSecurityEvent('token_validated', { repo });
    return true;
  } catch (error) {
    logTinaSecurityEvent('validation_error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      repo,
    });
    return false;
  } finally {
    // Clear token from memory
    token = null;
  }
};

/**
 * Create Tina session with secure token handling
 */
const createTinaSession = async (tokenHash: string, config: TinaAuthConfig): Promise<TinaSession> => {
  const now = new Date();
  const csrfToken = generateCSRFToken();
  
  const session: TinaSession = {
    isAuthenticated: true,
    tokenHash, // Store hash instead of token
    repository: config.repository,
    branch: config.branch,
    expiresAt: new Date(now.getTime() + TINA_SESSION_DURATION),
    createdAt: now,
    csrfToken,
  };
  
  // Store session without sensitive token
  sessionStorage.setItem(TINA_SESSION_KEY, JSON.stringify(session));
  logTinaSecurityEvent('session_created', { 
    repository: config.repository,
    branch: config.branch,
  });
  
  return session;
};

/**
 * Get current Tina session
 */
const getTinaSession = (): TinaSession | null => {
  const sessionData = sessionStorage.getItem(TINA_SESSION_KEY);
  
  if (!sessionData) {
    return null;
  }
  
  try {
    const session: TinaSession = JSON.parse(sessionData);
    
    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      clearTinaSession();
      logTinaSecurityEvent('session_expired', { 
        repository: session.repository,
      });
      return null;
    }
    
    // Validate CSRF token exists
    if (!session.csrfToken) {
      clearTinaSession();
      logTinaSecurityEvent('session_invalid', { 
        reason: 'Missing CSRF token',
        repository: session.repository,
      });
      return null;
    }
    
    return session;
  } catch (error) {
    logTinaSecurityEvent('session_parse_error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    clearTinaSession();
    return null;
  }
};

/**
 * Clear Tina session and validation attempts
 */
const clearTinaSession = (): void => {
  sessionStorage.removeItem(TINA_SESSION_KEY);
  clearValidationAttempts();
  logTinaSecurityEvent('session_cleared', {});
};

/**
 * Get authentication provider based on configuration
 */
const getAuthProvider = (config: TinaAuthConfig): TinaAuthProvider => {
  if (config.isLocalDevelopment && config.useLocalAuth) {
    return {
      name: 'filesystem',
      displayName: 'Local Filesystem',
      isConfigured: true,
      validateToken: async () => true, // Always valid for local development
    };
  }
  
  return {
    name: 'github',
    displayName: config.useTinaCloud ? 'Tina Cloud' : 'GitHub',
    isConfigured: config.useTinaCloud ? Boolean(config.clientId && config.repository) : Boolean(config.hasToken && config.repository),
    validateToken: async () => {
      if (config.useTinaCloud) {
        // For Tina Cloud, validation is handled by OAuth flow
        return Boolean(config.clientId && config.repository);
      }
      
      // Legacy GitHub token validation
      if (!config.hasToken || !config.repository) {
        return false;
      }
      return validateGitHubToken(config.repository);
    },
    getAuthUrl: () => {
      if (config.useTinaCloud && config.clientId) {
        // Tina Cloud OAuth URL
        const redirectUri = `${window.location.origin}/admin/auth/callback`;
        const state = generateOAuthState(); // Add CSRF protection
        
        return `https://app.tinajs.io/client/${config.clientId}/authorize?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
      }
      
      // Legacy GitHub OAuth URL
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
      if (!clientId) {
        return '';
      }
      
      const redirectUri = `${window.location.origin}/admin/auth/callback`;
      const scope = 'repo,workflow';
      const state = generateOAuthState(); // Add CSRF protection
      
      return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    },
  };
};

/**
 * Tina authentication context
 */
const TinaAuthContext = createContext<TinaAuthContextType | undefined>(undefined);

/**
 * Tina authentication provider component
 */
export const TinaAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<TinaSession | null>(null);
  
  // Memoize config to prevent recreation on every render
  const config = React.useMemo(() => getTinaConfig(), []);
  
  // Memoize provider to prevent recreation on every render
  const provider = React.useMemo(() => getAuthProvider(config), [config]);
  
  /**
   * Validate current session
   */
  const validateSession = useCallback(async (): Promise<boolean> => {
    const currentSession = getTinaSession();

    if (!currentSession) {
      setSession(prev => prev === null ? prev : null);
      return false;
    }

    // For local development, session is always valid
    if (config.isLocalDevelopment && config.useLocalAuth) {
      setSession(prev => {
        // Only update if session has actually changed
        if (prev && prev.tokenHash === currentSession.tokenHash && prev.expiresAt === currentSession.expiresAt) {
          return prev;
        }
        return currentSession;
      });
      return true;
    }

    // Validate session token hash matches current environment
    const currentTokenHash = import.meta.env.VITE_GITHUB_TOKEN_HASH;

    if (!currentTokenHash || currentSession.tokenHash !== currentTokenHash) {
      logTinaSecurityEvent('session_token_mismatch', {});
      clearTinaSession();
      setSession(prev => prev === null ? prev : null);
      return false;
    }

    // Validate GitHub token
    const isValid = await provider.validateToken();

    if (!isValid) {
      clearTinaSession();
      setSession(prev => prev === null ? prev : null);
      return false;
    }

    setSession(prev => {
      // Only update if session has actually changed
      if (prev && prev.tokenHash === currentSession.tokenHash && prev.expiresAt === currentSession.expiresAt) {
        return prev;
      }
      return currentSession;
    });
    return true;
  }, [config.isLocalDevelopment, config.useLocalAuth, provider]);
  
  /**
   * Login function
   */
  const login = useCallback(async (token?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // For local development, create session without token
      if (config.isLocalDevelopment && config.useLocalAuth) {
        const session = await createTinaSession('local-development', config);
        setSession(session);
        return { success: true };
      }
      
      // For Tina Cloud, authentication is handled by OAuth redirect
      if (config.useTinaCloud) {
        if (!config.clientId || !config.repository) {
          return { 
            success: false, 
            error: 'Tina Cloud configuration incomplete. Please set VITE_TINA_CLIENT_ID and VITE_GITHUB_REPO.' 
          };
        }
        
        // Create session for Tina Cloud mode
        const session = await createTinaSession('tina-cloud-oauth', config);
        setSession(session);
        return { success: true };
      }
      
      // Legacy GitHub token mode
      const validation = await validateTokenSecurely(token, 'login');
      
      if (!validation.valid) {
        return { 
          success: false, 
          error: validation.error || 'Token validation failed.' 
        };
      }
      
      if (!config.repository) {
        return { 
          success: false, 
          error: 'No repository configured. Please set VITE_GITHUB_REPO.' 
        };
      }
      
      // Validate GitHub access
      const isValid = await validateGitHubToken(config.repository);
      
      if (!isValid) {
        return { 
          success: false, 
          error: 'Invalid GitHub token or insufficient permissions. Token needs "repo" and "workflow" scopes.' 
        };
      }
      
      // Create session with token hash
      const tokenHash = token ? await hashToken(token) : import.meta.env.VITE_GITHUB_TOKEN_HASH;
      
      if (!tokenHash) {
        return { 
          success: false, 
          error: 'Could not create secure session.' 
        };
      }
      
      const session = await createTinaSession(tokenHash, config);
      setSession(session);
      
      return { success: true };
    } catch (error) {
      logTinaSecurityEvent('login_error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return { 
        success: false, 
        error: 'Authentication failed. Please check your configuration and try again.' 
      };
    }
  }, [config]);
  
  /**
   * Logout function
   */
  const logout = useCallback((): void => {
    clearTinaSession();
    setSession(null);
    logTinaSecurityEvent('logout', {});
  }, []);
  
  /**
   * Check and restore session on mount, with auto-authentication for Tina Cloud
   */
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      
      // Try to restore existing session first
      const sessionRestored = await validateSession();
      
      // If no session exists and we're in Tina Cloud mode, auto-authenticate
      if (!sessionRestored && config.useTinaCloud && provider.isConfigured) {
        logTinaSecurityEvent('auto_authentication_attempt', { 
          clientId: config.clientId,
          repository: config.repository,
        });
        
        const result = await login();
        if (result.success) {
          logTinaSecurityEvent('auto_authentication_success', {});
        } else {
          logTinaSecurityEvent('auto_authentication_failed', { 
            error: result.error,
          });
        }
      }
      
      setIsLoading(false);
    };
    
    checkSession();
  }, [validateSession, config.useTinaCloud, config.clientId, config.repository, provider.isConfigured, login]);
  
  /**
   * Set up session check interval
   */
  useEffect(() => {
    // Only set up interval if authenticated
    if (!session?.isAuthenticated) {
      return;
    }
    
    const interval = setInterval(async () => {
      await validateSession();
    }, 5 * 60000); // Check every 5 minutes (reduced frequency)
    
    return () => clearInterval(interval);
  }, [validateSession, session?.isAuthenticated]);

  const value = useMemo<TinaAuthContextType>(() => ({
    isAuthenticated: !!session?.isAuthenticated,
    isLoading,
    session,
    provider,
    config,
    login,
    logout,
    validateSession,
  }), [session?.isAuthenticated, isLoading, session, provider, config, login, logout, validateSession]);

  return React.createElement(TinaAuthContext.Provider, { value }, children);
};

/**
 * Hook to use Tina authentication context
 */
export const useTinaAuth = (): TinaAuthContextType => {
  const context = useContext(TinaAuthContext);
  
  if (!context) {
    throw new Error('useTinaAuth must be used within TinaAuthProvider');
  }
  
  return context;
};

/**
 * Hook to check if Tina is authenticated
 */
export const useIsTinaAuthenticated = (): boolean => {
  const { isAuthenticated } = useTinaAuth();
  return isAuthenticated;
};

/**
 * Hook to get Tina configuration
 */
export const useTinaConfig = (): TinaAuthConfig => {
  const { config } = useTinaAuth();
  return config;
};

/**
 * Hook to get current Tina provider
 */
export const useTinaProvider = (): TinaAuthProvider | null => {
  const { provider } = useTinaAuth();
  return provider;
};

/**
 * Generate GitHub Personal Access Token instructions
 */
export const getGitHubTokenInstructions = (): string[] => {
  return [
    '1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)',
    '2. Click "Generate new token" → "Generate new token (classic)"',
    '3. Give your token a descriptive name (e.g., "Tina CMS - Melanie Website")',
    '4. Set expiration as needed (recommend 90 days with rotation)',
    '5. Select the following scopes:',
    '   - repo (Full control of private repositories)',
    '   - workflow (Update GitHub Action workflows)',
    '6. Click "Generate token"',
    '7. Copy the token immediately (it won\'t be shown again)',
    '8. Add to your .env file as VITE_GITHUB_TOKEN=ghp_your_token_here',
  ];
};

/**
 * Check GitHub token scopes
 */
export const checkGitHubTokenScopes = async (): Promise<{
  hasRequiredScopes: boolean;
  scopes: string[];
  missingScopes: string[];
}> => {
  // Get token securely from proxy
  let token = await getSecureToken();
  
  if (!token) {
    return {
      hasRequiredScopes: false,
      scopes: [],
      missingScopes: ['repo', 'workflow'],
    };
  }
  
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    if (!response.ok) {
      return {
        hasRequiredScopes: false,
        scopes: [],
        missingScopes: ['repo', 'workflow'],
      };
    }
    
    // GitHub returns scopes in the X-OAuth-Scopes header
    const scopesHeader = response.headers.get('X-OAuth-Scopes');
    const scopes = scopesHeader ? scopesHeader.split(', ').filter(Boolean) : [];
    
    const requiredScopes = ['repo', 'workflow'];
    const missingScopes = requiredScopes.filter(scope => !scopes.includes(scope));
    
    return {
      hasRequiredScopes: missingScopes.length === 0,
      scopes,
      missingScopes,
    };
  } catch (error) {
    logTinaSecurityEvent('scope_check_error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return {
      hasRequiredScopes: false,
      scopes: [],
      missingScopes: ['repo', 'workflow'],
    };
  } finally {
    // Clear token from memory
    token = null;
  }
};

/**
 * Test GitHub repository access
 */
export const testGitHubRepoAccess = async (
  repo: string, 
  branch: string
): Promise<{
  success: boolean;
  error?: string;
  details?: {
    hasRepo: boolean;
    hasBranch: boolean;
    hasWriteAccess: boolean;
  };
}> => {
  // Get token securely from proxy
  let token = await getSecureToken();
  
  if (!token) {
    return {
      success: false,
      error: 'No token available for testing',
      details: {
        hasRepo: false,
        hasBranch: false,
        hasWriteAccess: false,
      },
    };
  }
  const details = {
    hasRepo: false,
    hasBranch: false,
    hasWriteAccess: false,
  };
  
  try {
    // Check repository access
    const repoResponse = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    if (!repoResponse.ok) {
      return {
        success: false,
        error: `Repository "${repo}" not found or not accessible`,
        details,
      };
    }
    
    const repoData = await repoResponse.json();
    details.hasRepo = true;
    details.hasWriteAccess = repoData.permissions?.push === true;
    
    if (!details.hasWriteAccess) {
      return {
        success: false,
        error: 'No write access to repository. Token needs "repo" scope.',
        details,
      };
    }
    
    // Check branch exists
    const branchResponse = await fetch(
      `https://api.github.com/repos/${repo}/branches/${branch}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );
    
    if (!branchResponse.ok) {
      return {
        success: false,
        error: `Branch "${branch}" not found`,
        details,
      };
    }
    
    details.hasBranch = true;
    
    return {
      success: true,
      details,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details,
    };
  } finally {
    // Clear token from memory
    token = null;
  }
};