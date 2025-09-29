// Authentication utilities for password protection

const AUTH_TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRY_HOURS = 24;

interface AuthToken {
  expiry: number;
}

/**
 * Check if user is currently authenticated
 * @returns true if authenticated and token not expired
 */
export const isAuthenticated = (): boolean => {
  try {
    const tokenData = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!tokenData) return false;

    const token: AuthToken = JSON.parse(tokenData);
    const now = Date.now();
    
    return token.expiry > now;
  } catch {
    // If token is corrupted, clear it and return false
    clearAuthentication();
    return false;
  }
};

/**
 * Set authentication token with 24-hour expiry
 */
export const setAuthentication = (): void => {
  const expiry = Date.now() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
  const token: AuthToken = { expiry };
  
  localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(token));
};

/**
 * Clear authentication token
 */
export const clearAuthentication = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

/**
 * Check if provided password matches the environment variable
 * @param input - The password input to check
 * @returns true if password matches
 */
export const checkPassword = (input: string): boolean => {
  const correctPassword = import.meta.env.VITE_WEBSITE_PASSWORD;
  
  if (!correctPassword) {
    console.warn('VITE_WEBSITE_PASSWORD environment variable not set');
    return false;
  }
  
  return input === correctPassword;
};