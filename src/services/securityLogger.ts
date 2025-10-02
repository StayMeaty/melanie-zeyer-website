/**
 * Security Event Logger
 * Centralized security event logging for all authentication services
 */

export interface SecurityEvent {
  timestamp: string;
  event: string;
  service: 'auth' | 'tina' | 'general';
  data?: unknown;
  userAgent: string;
  severity: 'info' | 'warning' | 'critical';
}

const SECURITY_EVENTS_KEY = 'security_events';
const MAX_EVENTS = 100;

/**
 * Determine event severity based on event type
 */
const getEventSeverity = (event: string): 'info' | 'warning' | 'critical' => {
  const criticalEvents = [
    'account_locked',
    'tina_validation_lockout',
    'csrf_validation_failed',
    'session_hijack_attempt',
    'token_exposure_attempt'
  ];
  
  const warningEvents = [
    'login_failed',
    'tina_validation_failed',
    'session_expired',
    'invalid_token',
    'oauth_state_invalid',
    'oauth_state_expired'
  ];
  
  if (criticalEvents.some(e => event.includes(e))) {
    return 'critical';
  }
  
  if (warningEvents.some(e => event.includes(e))) {
    return 'warning';
  }
  
  return 'info';
};

/**
 * Log a security event
 */
export const logSecurityEvent = (
  event: string, 
  data?: unknown,
  service: 'auth' | 'tina' | 'general' = 'general'
): void => {
  const timestamp = new Date().toISOString();
  const severity = getEventSeverity(event);
  
  const logEntry: SecurityEvent = {
    timestamp,
    event,
    service,
    data,
    userAgent: navigator.userAgent,
    severity
  };

  // Store in sessionStorage for current session
  const events = getSecurityEvents();
  events.push(logEntry);
  
  // Keep only last MAX_EVENTS events
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }
  
  try {
    sessionStorage.setItem(SECURITY_EVENTS_KEY, JSON.stringify(events));
  } catch (error) {
    // Handle quota exceeded error
    console.error('Failed to store security event:', error);
    // Clear old events and retry
    sessionStorage.setItem(SECURITY_EVENTS_KEY, JSON.stringify([logEntry]));
  }
  
  // Log to console in development
  if (import.meta.env.DEV) {
    const severityEmoji = {
      info: 'ℹ️',
      warning: '⚠️',
      critical: '🚨'
    };
    
    console.log(
      `${severityEmoji[severity]} [Security Event - ${service.toUpperCase()}]`,
      {
        event,
        severity,
        data,
        timestamp
      }
    );
  }
  
  // In production, you would send critical events to a monitoring service
  if (import.meta.env.PROD && severity === 'critical') {
    // Example: Send to monitoring service
    // sendToMonitoring(logEntry);
  }
};

/**
 * Get all security events from current session
 */
export const getSecurityEvents = (): SecurityEvent[] => {
  try {
    const eventsStr = sessionStorage.getItem(SECURITY_EVENTS_KEY);
    return eventsStr ? JSON.parse(eventsStr) : [];
  } catch {
    return [];
  }
};

/**
 * Get security events filtered by severity
 */
export const getSecurityEventsBySeverity = (
  severity: 'info' | 'warning' | 'critical'
): SecurityEvent[] => {
  return getSecurityEvents().filter(event => event.severity === severity);
};

/**
 * Get security events for a specific service
 */
export const getSecurityEventsByService = (
  service: 'auth' | 'tina' | 'general'
): SecurityEvent[] => {
  return getSecurityEvents().filter(event => event.service === service);
};

/**
 * Get recent security events (last N minutes)
 */
export const getRecentSecurityEvents = (minutes: number): SecurityEvent[] => {
  const cutoffTime = Date.now() - (minutes * 60 * 1000);
  return getSecurityEvents().filter(
    event => new Date(event.timestamp).getTime() > cutoffTime
  );
};

/**
 * Clear all security events
 */
export const clearSecurityEvents = (): void => {
  sessionStorage.removeItem(SECURITY_EVENTS_KEY);
  logSecurityEvent('security_events_cleared', {}, 'general');
};

/**
 * Export security events as JSON
 */
export const exportSecurityEvents = (): string => {
  const events = getSecurityEvents();
  return JSON.stringify(events, null, 2);
};

/**
 * Get security summary statistics
 */
export const getSecuritySummary = (): {
  totalEvents: number;
  criticalEvents: number;
  warningEvents: number;
  infoEvents: number;
  recentCritical: SecurityEvent[];
  eventsByService: Record<string, number>;
} => {
  const events = getSecurityEvents();
  const recentCritical = getRecentSecurityEvents(60).filter(
    e => e.severity === 'critical'
  );
  
  const eventsByService = events.reduce((acc, event) => {
    acc[event.service] = (acc[event.service] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    totalEvents: events.length,
    criticalEvents: events.filter(e => e.severity === 'critical').length,
    warningEvents: events.filter(e => e.severity === 'warning').length,
    infoEvents: events.filter(e => e.severity === 'info').length,
    recentCritical,
    eventsByService
  };
};