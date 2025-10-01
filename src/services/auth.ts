import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AdminUser, ADMIN_PERMISSIONS } from '../types/blog';

/**
 * Authentication configuration and constants
 */
const SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
const SESSION_KEY = 'admin_session';
const LOGIN_ATTEMPTS_KEY = 'login_attempts';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Session data interface
 */
interface SessionData {
  token: string;
  user: AdminUser;
  expiresAt: number;
  csrfToken: string;
}

/**
 * Login attempts tracking interface
 */
interface LoginAttempts {
  count: number;
  lockedUntil?: number;
  lastAttempt: number;
}

/**
 * Authentication context interface
 */
interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkSession: () => void;
  csrfToken: string | null;
}

/**
 * Generate a secure random token
 */
const generateToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Generate CSRF token
 */
const generateCSRFToken = (): string => {
  return generateToken().slice(0, 32);
};

/**
 * Hash a password using SHA-256
 */
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Check if account is locked due to too many failed attempts
 */
const isAccountLocked = (): { locked: boolean; remainingTime?: number } => {
  const attemptsStr = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
  if (!attemptsStr) return { locked: false };

  try {
    const attempts: LoginAttempts = JSON.parse(attemptsStr);
    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
      return { 
        locked: true, 
        remainingTime: Math.ceil((attempts.lockedUntil - Date.now()) / 1000 / 60) 
      };
    }
  } catch {
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
  }

  return { locked: false };
};

/**
 * Record a login attempt
 */
const recordLoginAttempt = (success: boolean): void => {
  const attemptsStr = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
  const attempts: LoginAttempts = attemptsStr 
    ? JSON.parse(attemptsStr) 
    : { count: 0, lastAttempt: Date.now() };

  if (success) {
    // Clear attempts on successful login
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
    logSecurityEvent('login_success');
  } else {
    attempts.count++;
    attempts.lastAttempt = Date.now();

    if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
      attempts.lockedUntil = Date.now() + LOCKOUT_DURATION;
      logSecurityEvent('account_locked', { attempts: attempts.count });
    } else {
      logSecurityEvent('login_failed', { attempts: attempts.count });
    }

    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
  }
};

/**
 * Log security events for monitoring
 */
const logSecurityEvent = (event: string, data?: unknown): void => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    event,
    data,
    userAgent: navigator.userAgent,
    // In production, you might want to send this to an analytics service
  };

  // Store recent security events in sessionStorage for debugging
  const events = JSON.parse(sessionStorage.getItem('security_events') || '[]');
  events.push(logEntry);
  
  // Keep only last 50 events
  if (events.length > 50) {
    events.shift();
  }
  
  sessionStorage.setItem('security_events', JSON.stringify(events));
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('[Security Event]', logEntry);
  }
};

/**
 * Create a new session
 */
const createSession = (user: AdminUser, rememberMe: boolean): SessionData => {
  const duration = rememberMe ? SESSION_DURATION * 6 : SESSION_DURATION; // 24h if remember me
  const session: SessionData = {
    token: generateToken(),
    user,
    expiresAt: Date.now() + duration,
    csrfToken: generateCSRFToken(),
  };

  // Use sessionStorage by default, localStorage if "remember me" is checked
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify(session));

  logSecurityEvent('session_created', { 
    userId: user.id, 
    rememberMe,
    expiresIn: duration / 1000 / 60 // minutes
  });

  return session;
};

/**
 * Get current session from storage
 */
const getSession = (): SessionData | null => {
  // Check both storages
  const sessionStr = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
  
  if (!sessionStr) return null;

  try {
    const session: SessionData = JSON.parse(sessionStr);
    
    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      clearSession();
      logSecurityEvent('session_expired', { userId: session.user.id });
      return null;
    }

    return session;
  } catch (error) {
    console.error('Invalid session data:', error);
    clearSession();
    return null;
  }
};

/**
 * Clear session from storage
 */
const clearSession = (): void => {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
};

/**
 * Validate password against environment variable hash
 */
const validatePassword = async (password: string): Promise<boolean> => {
  const expectedHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH;
  
  if (!expectedHash) {
    console.error('VITE_ADMIN_PASSWORD_HASH not configured');
    return false;
  }

  const passwordHash = await hashPassword(password);
  return passwordHash === expectedHash;
};

/**
 * Authentication Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  /**
   * Check if there's a valid session
   */
  const checkSession = useCallback((): void => {
    const session = getSession();
    
    if (session) {
      setUser(session.user);
      setCsrfToken(session.csrfToken);
    } else {
      setUser(null);
      setCsrfToken(null);
    }
    
    setIsLoading(false);
  }, []);

  /**
   * Check and restore session on mount
   */
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  /**
   * Set up session check interval
   */
  useEffect(() => {
    const interval = setInterval(() => {
      checkSession();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [checkSession]);

  /**
   * Login function
   */
  const login = useCallback(async (password: string, rememberMe = false): Promise<{ success: boolean; error?: string }> => {
    // Check if account is locked
    const lockStatus = isAccountLocked();
    if (lockStatus.locked) {
      return { 
        success: false, 
        error: `Zu viele fehlgeschlagene Anmeldeversuche. Bitte versuchen Sie es in ${lockStatus.remainingTime} Minuten erneut.` 
      };
    }

    try {
      // Validate password
      const isValid = await validatePassword(password);
      
      if (!isValid) {
        recordLoginAttempt(false);
        return { 
          success: false, 
          error: 'Ungültiges Passwort.' 
        };
      }

      // Create admin user object
      const adminUser: AdminUser = {
        id: 'admin',
        email: 'admin@melaniezeyer.de',
        name: 'Administrator',
        role: 'admin',
        createdAt: new Date(),
        lastLogin: new Date(),
        active: true,
        permissions: ADMIN_PERMISSIONS.admin,
      };

      // Create session
      const session = createSession(adminUser, rememberMe);
      setUser(adminUser);
      setCsrfToken(session.csrfToken);
      
      recordLoginAttempt(true);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      recordLoginAttempt(false);
      return { 
        success: false, 
        error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' 
      };
    }
  }, []);

  /**
   * Logout function
   */
  const logout = useCallback((): void => {
    const session = getSession();
    if (session) {
      logSecurityEvent('logout', { userId: session.user.id });
    }
    
    clearSession();
    setUser(null);
    setCsrfToken(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkSession,
    csrfToken,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

/**
 * Hook to use authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Helper function to generate a password hash for environment variable
 * Use this in development to generate the hash for a new password
 */
export const generatePasswordHash = async (password: string): Promise<void> => {
  const hash = await hashPassword(password);
  console.log('Add this to your .env file:');
  console.log(`VITE_ADMIN_PASSWORD_HASH=${hash}`);
};

/**
 * CSRF token validation helper
 */
export const validateCSRFToken = (token: string, sessionToken: string | null): boolean => {
  if (!sessionToken || !token) return false;
  return token === sessionToken;
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (user: AdminUser | null, permission: keyof AdminUser['permissions']): boolean => {
  if (!user) return false;
  return user.permissions[permission] === true;
};

/**
 * Get security event logs (for admin dashboard)
 */
export const getSecurityLogs = (): unknown[] => {
  const events = sessionStorage.getItem('security_events');
  return events ? JSON.parse(events) : [];
};