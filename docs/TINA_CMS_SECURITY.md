# Tina CMS Security Implementation

## Overview

This document describes the security measures implemented for the Tina CMS integration following OWASP best practices and secure coding standards.

## Security Features Implemented

### 1. Token Protection

#### Before (VULNERABLE)
```typescript
// Token exposed in client code
token: import.meta.env.VITE_TINA_TOKEN
session.token = authToken // Raw token in session
```

#### After (SECURE)
```typescript
// Token never exposed, only hash stored
tokenHash: await hashToken(token)
hasToken: Boolean(import.meta.env.VITE_TINA_TOKEN) // Only boolean flag
```

**Security Benefits:**
- Tokens never exposed in browser DevTools
- Session storage contains only hashed values
- Token validation uses secure proxy service
- Memory clearing after API calls

### 2. CSRF Protection

All state-changing operations now include CSRF tokens:

```typescript
// Generate CSRF token for each operation
const csrfToken = generateCSRFToken();

// Validate on state changes
if (!validateCSRFToken(providedToken)) {
  throw new Error('CSRF validation failed');
}
```

**Implementation:**
- CSRF tokens generated per session
- One-time use tokens for critical operations
- OAuth state parameter for GitHub flow

### 3. Rate Limiting

Protection against brute force attacks:

```typescript
const MAX_VALIDATION_ATTEMPTS = 5;
const VALIDATION_LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
```

**Features:**
- Account lockout after 5 failed attempts
- 15-minute cooldown period
- Progressive delay between attempts
- Security event logging for all attempts

### 4. Secure Session Management

```typescript
interface TinaSession {
  tokenHash: string | null;  // Hash instead of token
  csrfToken: string;         // CSRF protection
  expiresAt: Date;          // Session expiration
}
```

**Security Measures:**
- 4-hour session timeout
- Session validation on each request
- Automatic session cleanup on expiry
- Token hash validation against environment

### 5. Security Event Logging

Comprehensive logging system with severity levels:

```typescript
logSecurityEvent('tina_login_failed', { 
  attempts: attemptCount,
  ip: userIP 
}, 'critical');
```

**Event Categories:**
- **Critical:** Account lockouts, CSRF failures
- **Warning:** Failed logins, expired sessions
- **Info:** Successful operations, session creation

### 6. Time-Constant Comparisons

Prevents timing attacks on token validation:

```typescript
const secureCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};
```

### 7. OAuth Security

GitHub OAuth implementation with:
- State parameter for CSRF protection
- State expiration (10 minutes)
- One-time use state tokens
- Secure redirect URI validation

## Configuration Setup

### Environment Variables

```bash
# Required for Tina CMS
VITE_USE_TINA_CMS=true
VITE_TINA_TOKEN=ghp_your_github_token
VITE_TINA_TOKEN_HASH=<generated_hash>
VITE_GITHUB_REPO=owner/repository
VITE_GITHUB_BRANCH=main

# Optional for OAuth
VITE_GITHUB_CLIENT_ID=<oauth_app_client_id>
```

### Generating Token Hash

Use the provided utility in development:

```typescript
import { generateTokenHashForSetup } from './src/utils/generateTokenHash';

// Generate hash for your token
await generateTokenHashForSetup('ghp_your_token_here');
```

## Security Checklist

### ✅ Token Security
- [ ] Never expose raw tokens in client code
- [ ] Store only token hashes in session
- [ ] Clear tokens from memory after use
- [ ] Use environment variables for sensitive data

### ✅ Session Security
- [ ] Implement session timeout (4 hours)
- [ ] Validate sessions on each request
- [ ] Clear sessions on logout
- [ ] Use secure session storage

### ✅ CSRF Protection
- [ ] Generate CSRF tokens for state changes
- [ ] Validate tokens on all mutations
- [ ] Use state parameter for OAuth
- [ ] Implement one-time use tokens

### ✅ Rate Limiting
- [ ] Limit authentication attempts
- [ ] Implement account lockout
- [ ] Add progressive delays
- [ ] Log security events

### ✅ Input Validation
- [ ] Validate all user inputs
- [ ] Sanitize data before storage
- [ ] Use parameterized queries
- [ ] Implement proper error handling

## Security Headers

Recommended headers for production:

```javascript
// netlify.toml or server configuration
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    Permissions-Policy = "geolocation=(), microphone=(), camera=()"
```

## Monitoring and Alerts

### Security Events to Monitor

1. **Critical Events (Immediate Alert)**
   - Multiple account lockouts
   - CSRF validation failures
   - Session hijacking attempts

2. **Warning Events (Daily Review)**
   - Failed login attempts
   - Expired sessions
   - Invalid token attempts

3. **Info Events (Weekly Review)**
   - Successful logins
   - Session creations
   - Configuration changes

### Security Metrics

Track these metrics for security health:
- Failed login rate
- Account lockout frequency
- Session timeout rate
- CSRF validation success rate
- API error rate

## Incident Response

### If Token is Compromised

1. **Immediate Actions:**
   - Revoke the compromised token on GitHub
   - Generate new token with appropriate scopes
   - Update VITE_TINA_TOKEN and VITE_TINA_TOKEN_HASH
   - Clear all active sessions
   - Review security logs for unauthorized access

2. **Follow-up Actions:**
   - Audit repository for unauthorized changes
   - Review access logs
   - Update security documentation
   - Notify team members

### If Suspicious Activity Detected

1. Check security event logs:
   ```typescript
   const summary = getSecuritySummary();
   console.log('Critical events:', summary.criticalEvents);
   ```

2. Review recent authentication attempts
3. Check for unusual patterns
4. Enable additional logging if needed

## Best Practices

### For Developers

1. **Never commit tokens** - Use .env files
2. **Rotate tokens regularly** - Every 90 days
3. **Use minimal scopes** - Only repo and workflow
4. **Test security features** - Use provided test utilities
5. **Monitor security logs** - Check for anomalies

### For Production

1. **Use HTTPS only** - Enforce SSL
2. **Set security headers** - Use recommended CSP
3. **Monitor rate limits** - Prevent abuse
4. **Implement alerting** - For critical events
5. **Regular audits** - Quarterly security reviews

## Testing Security

### Manual Testing

1. **Test Rate Limiting:**
   - Attempt 6 failed logins
   - Verify 15-minute lockout
   - Check security logs

2. **Test Session Expiry:**
   - Create session
   - Wait 4 hours
   - Verify automatic logout

3. **Test CSRF Protection:**
   - Attempt request without token
   - Verify rejection
   - Check security logs

### Automated Testing

```typescript
// Example security test
describe('Security Features', () => {
  it('should lock account after max attempts', async () => {
    for (let i = 0; i < 6; i++) {
      await login('wrong-token');
    }
    const result = await login('correct-token');
    expect(result.error).toContain('locked');
  });
});
```

## Compliance

### OWASP Top 10 Coverage

| Risk | Mitigation |
|------|------------|
| A01: Broken Access Control | Token validation, session management |
| A02: Cryptographic Failures | SHA-256 hashing, secure storage |
| A03: Injection | Input validation, parameterized queries |
| A04: Insecure Design | Defense in depth, fail securely |
| A05: Security Misconfiguration | Environment variables, security headers |
| A07: Identification Failures | Rate limiting, account lockout |
| A08: Software Integrity | Token validation, CSRF protection |
| A09: Security Logging | Comprehensive event logging |
| A10: SSRF | API validation, token proxying |

### GDPR Considerations

- No personal data stored in sessions
- Security logs auto-expire
- Token hashes cannot be reversed
- Clear data deletion on logout

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

## Support

For security concerns or questions:
1. Check security logs in development
2. Review this documentation
3. Test with provided utilities
4. Contact security team if needed

---

*Last Updated: 2025-10-01*
*Security Review: Required quarterly*