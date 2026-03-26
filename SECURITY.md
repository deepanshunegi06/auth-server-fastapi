"""
Security best practices and configuration for AuthCore.

This document outlines the security measures implemented in AuthCore
and provides guidance for maintaining security in production.
"""

# Security Features

## Password Security
- **bcrypt hashing**: All passwords hashed with bcrypt at cost factor 12
- **Password requirements**: Minimum 8 characters, maximum 100 characters  
- **No password storage**: Only irreversible hashes are stored

## Token Security
- **JWT tokens**: Stateless authentication with HMAC-SHA256 signing
- **Short-lived access tokens**: 30 minute expiration to limit exposure
- **Refresh tokens**: 7 day expiration for session extension
- **Token blacklisting**: Revoked tokens tracked to prevent reuse

## Brute Force Protection
- **Account lockout**: Automatic lockout after 5 failed login attempts
- **Failed attempt tracking**: Persistent counter per user account
- **Audit logging**: All authentication events logged with IP/user-agent

## Database Security
- **SQL injection prevention**: Parameterized queries via SQLAlchemy ORM
- **Input validation**: Pydantic schemas validate all request data
- **No sensitive data logging**: Passwords and tokens not logged

## CORS Configuration  
- **Restricted origins**: Only specific frontend URLs allowed
- **Credential support**: Cookies/auth headers permitted for allowed origins
- **Configurable**: Environment variable override for custom origins

## Production Recommendations

### Environment Variables
Set these in production:

```bash
# Strong secret key (256-bit recommended)
JWT_SECRET_KEY=your-super-secure-secret-key-here

# Database connection (use PostgreSQL in production)  
DATABASE_URL=postgresql://user:password@host:port/dbname

# Frontend URL for CORS
FRONTEND_URL=https://your-frontend-domain.com
```

### HTTPS
- **Always use HTTPS** in production to protect tokens in transit
- **Secure cookies**: Set secure/httpOnly flags for any cookies
- **HSTS headers**: Consider HTTP Strict Transport Security

### Database
- **Use PostgreSQL** instead of SQLite for production
- **Connection pooling**: Configure appropriate pool sizes
- **Backup strategy**: Regular automated backups
- **Access controls**: Limit database user permissions

### Monitoring
- **Rate limiting**: Consider adding rate limits to login endpoints
- **Alert on lockouts**: Monitor for unusual lockout patterns
- **Audit log retention**: Keep logs for compliance requirements
- **Token cleanup**: Periodically clean expired blacklisted tokens

### Additional Measures
- **Input sanitization**: Additional validation beyond Pydantic
- **Request size limits**: Prevent large payload attacks
- **Security headers**: Add security headers like CSP, X-Frame-Options
- **Dependency scanning**: Regular security updates for dependencies

## Security Headers Example

```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

# Force HTTPS in production
app.add_middleware(HTTPSRedirectMiddleware)

# Only allow specific hosts
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["yourdomain.com"])
```

## Incident Response

In case of security incidents:

1. **Immediate**: Change JWT secret key to invalidate all tokens
2. **Analysis**: Review audit logs for compromise indicators  
3. **Cleanup**: Reset passwords for affected accounts
4. **Monitoring**: Enhanced monitoring for suspicious activity
5. **Documentation**: Document incident and response actions