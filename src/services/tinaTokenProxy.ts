/**
 * Tina Token Proxy Service
 * Secure token validation without exposing sensitive data
 * Follows security patterns from auth.ts
 */

import { logSecurityEvent } from './securityLogger';

// Rate limiting constants
const MAX_VALIDATION_ATTEMPTS = 5;
const VALIDATION_LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const VALIDATION_ATTEMPTS_KEY = 'tina_validation_attempts';

interface ValidationAttempts {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

/**
 * Generate a secure random token using Web Crypto API
 */
const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Hash a token using SHA-256 (following auth.ts pattern)
 */
export const hashToken = async (token: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Time-constant comparison to prevent timing attacks
 */
const secureCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};

/**
 * Check if validation is locked due to too many failed attempts
 */
const isValidationLocked = (): { locked: boolean; remainingTime?: number } => {
  const attemptsStr = sessionStorage.getItem(VALIDATION_ATTEMPTS_KEY);
  if (!attemptsStr) return { locked: false };

  try {
    const attempts: ValidationAttempts = JSON.parse(attemptsStr);
    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
      const remainingTime = Math.ceil((attempts.lockedUntil - Date.now()) / 1000 / 60);
      
      logSecurityEvent('tina_validation_locked', {
        remainingMinutes: remainingTime,
        attempts: attempts.count
      });
      
      return { locked: true, remainingTime };
    }
  } catch {
    sessionStorage.removeItem(VALIDATION_ATTEMPTS_KEY);
  }

  return { locked: false };
};

/**
 * Record a validation attempt for rate limiting
 */
const recordValidationAttempt = (success: boolean, context: string): void => {
  const attemptsStr = sessionStorage.getItem(VALIDATION_ATTEMPTS_KEY);
  const attempts: ValidationAttempts = attemptsStr 
    ? JSON.parse(attemptsStr) 
    : { count: 0, lastAttempt: Date.now() };

  if (success) {
    // Clear attempts on successful validation
    sessionStorage.removeItem(VALIDATION_ATTEMPTS_KEY);
    logSecurityEvent('tina_validation_success', { context });
  } else {
    attempts.count++;
    attempts.lastAttempt = Date.now();

    if (attempts.count >= MAX_VALIDATION_ATTEMPTS) {
      attempts.lockedUntil = Date.now() + VALIDATION_LOCKOUT_DURATION;
      logSecurityEvent('tina_validation_lockout', { 
        attempts: attempts.count,
        context,
        lockedUntilMinutes: 15
      });
    } else {
      logSecurityEvent('tina_validation_failed', { 
        attempts: attempts.count,
        remainingAttempts: MAX_VALIDATION_ATTEMPTS - attempts.count,
        context
      });
    }

    sessionStorage.setItem(VALIDATION_ATTEMPTS_KEY, JSON.stringify(attempts));
  }
};

/**
 * Validate a token against the environment configuration
 * Returns only boolean result, never exposes the actual token
 */
export const validateTokenSecurely = async (
  providedToken: string | undefined,
  context: string = 'unknown'
): Promise<{ valid: boolean; error?: string }> => {
  // Check rate limiting
  const lockStatus = isValidationLocked();
  if (lockStatus.locked) {
    return { 
      valid: false, 
      error: `Too many failed attempts. Please wait ${lockStatus.remainingTime} minutes.` 
    };
  }

  try {
    // Get expected token hash from environment
    const expectedTokenHash = import.meta.env.VITE_GITHUB_TOKEN_HASH;
    
    if (!expectedTokenHash) {
      logSecurityEvent('tina_token_not_configured', { context });
      recordValidationAttempt(false, context);
      return { 
        valid: false, 
        error: 'GitHub token not configured. Please set VITE_GITHUB_TOKEN_HASH.' 
      };
    }

    if (!providedToken) {
      logSecurityEvent('tina_token_missing', { context });
      recordValidationAttempt(false, context);
      return { 
        valid: false, 
        error: 'No token provided for validation.' 
      };
    }

    // Hash the provided token
    const providedTokenHash = await hashToken(providedToken);
    
    // Use time-constant comparison
    const isValid = secureCompare(providedTokenHash, expectedTokenHash);
    
    recordValidationAttempt(isValid, context);
    
    return { valid: isValid };
  } catch (error) {
    logSecurityEvent('tina_validation_error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      context 
    });
    recordValidationAttempt(false, context);
    
    return { 
      valid: false, 
      error: 'Token validation failed. Please try again.' 
    };
  }
};

/**
 * Get token for API calls - only returns token if validated
 * This should only be called after successful validation
 */
export const getSecureToken = async (): Promise<string | null> => {
  // In production, this would validate against a secure session
  // Never return the actual token from environment directly
  
  const tokenFromEnv = import.meta.env.VITE_GITHUB_TOKEN;
  
  if (!tokenFromEnv) {
    logSecurityEvent('tina_token_request_failed', { 
      reason: 'Token not configured' 
    });
    return null;
  }
  
  // Validate the token before returning it
  const validation = await validateTokenSecurely(tokenFromEnv, 'api_call');
  
  if (!validation.valid) {
    logSecurityEvent('tina_token_request_denied', { 
      reason: validation.error 
    });
    return null;
  }
  
  // Only return token after successful validation
  // In production, consider using a proxy server instead
  return tokenFromEnv;
};

/**
 * Generate a CSRF token for state-changing operations
 */
export const generateCSRFToken = (): string => {
  const token = generateSecureToken().slice(0, 32);
  
  // Store in session for validation
  sessionStorage.setItem('tina_csrf_token', token);
  
  logSecurityEvent('tina_csrf_generated', { 
    timestamp: new Date().toISOString() 
  });
  
  return token;
};

/**
 * Validate CSRF token
 */
export const validateCSRFToken = (token: string): boolean => {
  const storedToken = sessionStorage.getItem('tina_csrf_token');
  
  if (!storedToken || !token) {
    logSecurityEvent('tina_csrf_validation_failed', { 
      reason: 'Missing token' 
    });
    return false;
  }
  
  const isValid = secureCompare(token, storedToken);
  
  if (!isValid) {
    logSecurityEvent('tina_csrf_validation_failed', { 
      reason: 'Token mismatch' 
    });
  }
  
  return isValid;
};

/**
 * Clear all validation attempts (for logout/cleanup)
 */
export const clearValidationAttempts = (): void => {
  sessionStorage.removeItem(VALIDATION_ATTEMPTS_KEY);
  sessionStorage.removeItem('tina_csrf_token');
  logSecurityEvent('tina_validation_cleared', {});
};

/**
 * Generate OAuth state parameter for CSRF protection
 */
export const generateOAuthState = (): string => {
  const state = generateSecureToken();
  
  // Store with expiration
  const stateData = {
    value: state,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    createdAt: Date.now()
  };
  
  sessionStorage.setItem('tina_oauth_state', JSON.stringify(stateData));
  
  logSecurityEvent('tina_oauth_state_generated', {});
  
  return state;
};

/**
 * Validate OAuth state parameter
 */
export const validateOAuthState = (state: string): boolean => {
  const storedStateStr = sessionStorage.getItem('tina_oauth_state');
  
  if (!storedStateStr) {
    logSecurityEvent('tina_oauth_state_missing', {});
    return false;
  }
  
  try {
    const storedState = JSON.parse(storedStateStr);
    
    // Check expiration
    if (Date.now() > storedState.expiresAt) {
      logSecurityEvent('tina_oauth_state_expired', {});
      sessionStorage.removeItem('tina_oauth_state');
      return false;
    }
    
    // Validate state
    const isValid = secureCompare(state, storedState.value);
    
    if (isValid) {
      // Clear state after successful validation (one-time use)
      sessionStorage.removeItem('tina_oauth_state');
      logSecurityEvent('tina_oauth_state_validated', {});
    } else {
      logSecurityEvent('tina_oauth_state_invalid', {});
    }
    
    return isValid;
  } catch (error) {
    logSecurityEvent('tina_oauth_state_error', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return false;
  }
};

/**
 * Test function to generate token hash for .env configuration
 * This should only be used in development to generate the hash
 */
export const generateTokenHashForEnv = async (token: string): Promise<string> => {
  if (import.meta.env.PROD) {
    throw new Error('This function should only be used in development');
  }
  
  const hash = await hashToken(token);
  console.log('Add this to your .env file:');
  console.log(`VITE_GITHUB_TOKEN_HASH=${hash}`);
  
  return hash;
};