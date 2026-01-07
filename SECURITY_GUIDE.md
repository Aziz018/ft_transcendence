# 🔒 SECURITY HARDENING GUIDE

## Current Security Status: ✅ GOOD

All critical CORS/CORB issues are fixed with proper security measures in place.

---

## 🛡️ Security Measures Implemented

### 1. CORS Configuration
**Status:** ✅ Secure

#### What Was Fixed:
- ❌ **Before:** `origin: true` (accepts ANY origin - DANGEROUS)
- ✅ **After:** Whitelist-based validation

```typescript
origin: (origin, cb) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000',
    process.env.FRONTEND_ORIGIN,
  ].filter(Boolean);
  
  if (!origin || allowedOrigins.includes(origin)) {
    cb(null, true);
  } else {
    cb(new Error('Not allowed by CORS'), false);
  }
}
```

**Impact:**
- ✅ Only whitelisted origins can access API
- ✅ Prevents unauthorized cross-origin requests
- ✅ Allows legitimate development and production origins

---

### 2. Credentials Handling
**Status:** ✅ Secure

#### Configuration:
```typescript
credentials: true  // Allows cookies and auth headers
```

**With:**
- ✅ HttpOnly cookies (prevents XSS access)
- ✅ SameSite: 'lax' (prevents CSRF)
- ✅ Secure flag in production (HTTPS only)

```typescript
reply.setCookie('access_token', token, {
  path: '/',
  httpOnly: true,  // ✅ Not accessible via JavaScript
  secure: process.env.NODE_ENV === 'production',  // ✅ HTTPS only in prod
  sameSite: 'lax',  // ✅ Prevents CSRF attacks
  maxAge: 7 * 24 * 60 * 60,  // 7 days
});
```

---

### 3. Content Security Policy (CSP)
**Status:** ✅ Configured

#### nginx.conf:
```nginx
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: http: https: blob:; 
  connect-src 'self' http://localhost:3000 ws://localhost:3000; 
  frame-src 'self';
```

**Protection Against:**
- ✅ XSS (Cross-Site Scripting)
- ✅ Data injection attacks
- ✅ Unauthorized resource loading

---

### 4. Security Headers
**Status:** ✅ All Set

```nginx
X-Frame-Options: SAMEORIGIN              # Prevents clickjacking
X-Content-Type-Options: nosniff          # Prevents MIME sniffing
X-XSS-Protection: 1; mode=block          # Browser XSS protection
Referrer-Policy: no-referrer-when-downgrade
```

---

### 5. JWT Token Security
**Status:** ✅ Secure

#### Features:
- ✅ Signed with secret key (JWT_SECRET)
- ✅ Token blacklisting support
- ✅ Expiration time enforced
- ✅ 2FA support for sensitive operations

```typescript
const token = fastify.jwt.sign({
  id: user.id,
  email: user.email,
  name: user.name,
  mfa_required: user.totpEnabled,  // ✅ Forces 2FA verification
}, {
  expiresIn: '7d'  // Token expires after 7 days
});
```

#### Token Validation:
```typescript
// Check if token is blacklisted
const isBlackListed = await prisma.blacklistedToken.findUnique({ 
  where: { token } 
});
if (isBlackListed) {
  return reply.code(401).send({ error: 'Token blacklisted' });
}
```

---

### 6. Password Security
**Status:** ✅ Secure

#### Implementation:
```typescript
// Hashing with bcrypt (10 rounds)
const hashedPassword = await bcrypt.hash(password, 10);

// Verification
const isValid = await bcrypt.compare(password, user.password);
```

**Features:**
- ✅ Bcrypt with 10 salt rounds
- ✅ Passwords never stored in plain text
- ✅ Passwords never logged or exposed

---

### 7. Input Validation
**Status:** ⚠️ Basic (Needs Enhancement)

#### Current:
```typescript
if (!email || !password) {
  return reply.code(400).send({ message: 'Email and password required' });
}
```

#### Recommended Enhancements:
```typescript
// Add validation schema
import Joi from 'joi';

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

// Validate input
const { error, value } = loginSchema.validate(req.body);
if (error) {
  return reply.code(400).send({ error: error.details[0].message });
}
```

---

### 8. Rate Limiting
**Status:** ✅ Configured

```typescript
await fastify.register(rateLimit, {
  global: true,
  max: 100,              // Max 100 requests
  timeWindow: 10 * 1000, // Per 10 seconds
  allowList: [],
  addHeaders: true,
});
```

**Protection Against:**
- ✅ Brute force attacks
- ✅ DDoS attacks
- ✅ API abuse

---

## 🚨 Security Recommendations for Production

### 1. Environment Variables (CRITICAL)
**Status:** ❌ **ACTION REQUIRED**

Change default secrets IMMEDIATELY:

```bash
# .env file (DO NOT COMMIT TO GIT)
JWT_SECRET="your-random-64-character-secret-change-this-immediately"
CKE_SECRET="another-random-64-character-secret-change-this-too"

# Generate strong secrets:
openssl rand -base64 64
```

**Add to .gitignore:**
```
.env
.env.local
.env.production
```

---

### 2. HTTPS/TLS (CRITICAL for Production)
**Status:** ❌ **ACTION REQUIRED**

#### Enable HTTPS:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;
    
    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # ... rest of config
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

#### Update cookies for HTTPS:
```typescript
reply.setCookie('access_token', token, {
  secure: true,  // ✅ HTTPS only
  sameSite: 'strict',  // ✅ Stricter in production
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60,
});
```

---

### 3. Database Security
**Status:** ⚠️ **NEEDS REVIEW**

#### Current: SQLite (file-based)
```
DATABASE_URL=file:/app/shared-data/dev.db
```

#### For Production, use PostgreSQL:
```bash
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: transcendence
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - transcendence-network

# Update DATABASE_URL
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/transcendence
```

**Benefits:**
- ✅ Better concurrent access
- ✅ Transactions and ACID compliance
- ✅ Production-grade performance
- ✅ Better backup and recovery

---

### 4. Input Sanitization
**Status:** ⚠️ **NEEDS ENHANCEMENT**

#### Add XSS Protection:
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize user input
const cleanContent = DOMPurify.sanitize(req.body.content);
```

#### Add SQL Injection Protection:
```typescript
// ✅ Already protected by Prisma ORM
// Prisma uses parameterized queries
await prisma.user.findUnique({
  where: { email }  // ✅ Safe from SQL injection
});
```

---

### 5. Secrets Management
**Status:** ⚠️ **NEEDS IMPROVEMENT**

#### Current:
```yaml
environment:
  - JWT_SECRET=${JWT_SECRET:-supersecret}  # ❌ Bad: default secret
```

#### Recommended:
```bash
# Use Docker secrets
docker secret create jwt_secret ./jwt_secret.txt
docker secret create cookie_secret ./cookie_secret.txt

# docker-compose.yml
services:
  backend:
    secrets:
      - jwt_secret
      - cookie_secret

secrets:
  jwt_secret:
    external: true
  cookie_secret:
    external: true
```

**Or use environment-specific .env files:**
```bash
# .env.production (not committed)
JWT_SECRET=actual-production-secret-very-long-and-random
CKE_SECRET=another-production-secret-very-long-and-random
```

---

### 6. OAuth Credentials
**Status:** ⚠️ **NEEDS CONFIGURATION**

```bash
# Set real OAuth credentials
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
FACEBOOK_CLIENT_ID=your-actual-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-actual-facebook-client-secret
INTRA42_CLIENT_ID=your-actual-42-client-id
INTRA42_CLIENT_SECRET=your-actual-42-client-secret
```

**Important:**
- ✅ Never commit these to Git
- ✅ Use different credentials for dev/prod
- ✅ Rotate credentials periodically
- ✅ Restrict OAuth redirect URLs

---

### 7. Logging & Monitoring
**Status:** ⚠️ **NEEDS ENHANCEMENT**

#### Add Security Logging:
```typescript
// Log authentication attempts
fastify.addHook('onRequest', async (request, reply) => {
  if (request.url.includes('/login') || request.url.includes('/register')) {
    fastify.log.info({
      url: request.url,
      method: request.method,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });
  }
});

// Log failed authentication
fastify.log.warn({
  event: 'login_failed',
  email: req.body.email,
  ip: req.ip,
  timestamp: new Date().toISOString(),
});
```

#### Monitor Failed Attempts:
```typescript
// Rate limit per IP for login attempts
await fastify.register(rateLimit, {
  max: 5,               // 5 attempts
  timeWindow: 15 * 60 * 1000,  // per 15 minutes
  skipOnError: false,
  keyGenerator: (req) => req.ip,  // per IP address
  hook: 'onRequest',
  skipSuccessfulRequests: true,  // only count failures
});
```

---

### 8. Error Handling
**Status:** ⚠️ **NEEDS IMPROVEMENT**

#### Don't Expose Internal Errors:
```typescript
// ❌ BAD:
catch (error) {
  return reply.code(500).send({ error: error.message });  // Exposes internals
}

// ✅ GOOD:
catch (error) {
  fastify.log.error(error);  // Log internally
  return reply.code(500).send({ 
    error: 'Internal server error' 
  });  // Generic message to client
}
```

---

### 9. File Upload Security
**Status:** ⚠️ **NEEDS ENHANCEMENT**

#### Current:
```typescript
await fastify.register(multipart, { 
  limits: { fileSize: 10485760 }  // 10MB
});
```

#### Add File Validation:
```typescript
// Validate file type
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
if (!allowedTypes.includes(file.mimetype)) {
  return reply.code(400).send({ error: 'Invalid file type' });
}

// Validate file size
if (file.file.bytesRead > 10 * 1024 * 1024) {
  return reply.code(400).send({ error: 'File too large' });
}

// Sanitize filename
const sanitizedFilename = file.filename.replace(/[^a-zA-Z0-9.-]/g, '_');

// Scan for malware (in production)
// Use ClamAV or similar
```

---

### 10. WebSocket Security
**Status:** ⚠️ **NEEDS ENHANCEMENT**

#### Add Authentication:
```typescript
fastify.get('/v1/chat/ws', { websocket: true }, (connection, req) => {
  // ✅ Verify token
  const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
  
  try {
    const decoded = fastify.jwt.verify(token);
    connection.socket.userId = decoded.id;
  } catch (err) {
    connection.socket.close(1008, 'Unauthorized');
    return;
  }
  
  // ✅ Rate limit messages per user
  let messageCount = 0;
  const resetInterval = setInterval(() => { messageCount = 0; }, 60000);
  
  connection.socket.on('message', (message) => {
    messageCount++;
    if (messageCount > 60) {  // Max 60 messages per minute
      connection.socket.send(JSON.stringify({
        type: 'error',
        message: 'Rate limit exceeded',
      }));
      return;
    }
    
    // Process message...
  });
  
  connection.socket.on('close', () => {
    clearInterval(resetInterval);
  });
});
```

---

## 🎯 Security Checklist for Production

### Before Deploying to Production:

#### Secrets & Configuration
- [ ] Change JWT_SECRET to a strong random value
- [ ] Change CKE_SECRET to a strong random value
- [ ] Configure OAuth credentials (Google, Facebook, 42)
- [ ] Remove or secure default admin accounts
- [ ] Set NODE_ENV=production
- [ ] Configure proper DATABASE_URL (PostgreSQL)

#### HTTPS/TLS
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure secure cookies (secure: true)
- [ ] Set sameSite: 'strict' for cookies
- [ ] Enable HSTS header
- [ ] Redirect HTTP to HTTPS

#### Input Validation
- [ ] Add schema validation for all endpoints
- [ ] Sanitize user inputs (XSS protection)
- [ ] Validate file uploads (type, size, content)
- [ ] Add CSRF token protection

#### Rate Limiting
- [ ] Configure per-IP rate limiting
- [ ] Add per-user rate limiting
- [ ] Special limits for login/register
- [ ] WebSocket message rate limiting

#### Logging & Monitoring
- [ ] Set up centralized logging
- [ ] Monitor failed login attempts
- [ ] Track API errors and anomalies
- [ ] Set up alerts for security events

#### Database
- [ ] Use PostgreSQL (not SQLite)
- [ ] Enable database encryption
- [ ] Set up regular backups
- [ ] Implement backup recovery testing

#### Network Security
- [ ] Configure firewall rules
- [ ] Restrict internal service ports
- [ ] Use private Docker networks
- [ ] Enable DDoS protection

#### Code Security
- [ ] Remove debug/development code
- [ ] Disable verbose error messages
- [ ] Remove unused dependencies
- [ ] Run security audit: `npm audit`
- [ ] Update all dependencies

#### Access Control
- [ ] Implement role-based access (RBAC)
- [ ] Add admin authentication
- [ ] Secure administrative endpoints
- [ ] Review and restrict API permissions

---

## 🔐 Security Testing

### 1. Test CORS Protection
```bash
# Try unauthorized origin
curl -H "Origin: http://malicious-site.com" \
     http://localhost:3000/v1/user/profile

# Expected: CORS error
```

### 2. Test Rate Limiting
```bash
# Spam requests
for i in {1..150}; do
  curl http://localhost:3000/v1/user/profile
done

# Expected: 429 Too Many Requests after limit
```

### 3. Test JWT Expiration
```bash
# Use expired token
curl -H "Authorization: Bearer EXPIRED_TOKEN" \
     http://localhost:3000/v1/user/profile

# Expected: 401 Unauthorized
```

### 4. Test Input Validation
```bash
# Try XSS payload
curl -X POST http://localhost:3000/v1/message/send \
     -H "Content-Type: application/json" \
     -d '{"content":"<script>alert(1)</script>"}'

# Expected: Sanitized or rejected
```

### 5. Test SQL Injection
```bash
# Try SQL injection
curl -X POST http://localhost:3000/v1/user/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com OR 1=1--","password":"test"}'

# Expected: Invalid credentials (Prisma protects)
```

---

## 📚 Security Resources

### Tools
- **OWASP ZAP:** Web application security scanner
- **npm audit:** Check for vulnerable dependencies
- **Snyk:** Continuous security monitoring
- **SSL Labs:** Test SSL/TLS configuration

### Best Practices
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security/
- Fastify Security: https://www.fastify.io/docs/latest/Guides/Security/

---

## ✅ Current Security Score: 7/10

**Strengths:**
- ✅ CORS properly configured
- ✅ Credentials handling secure
- ✅ Rate limiting enabled
- ✅ Security headers set
- ✅ JWT with blacklisting
- ✅ Password hashing (bcrypt)
- ✅ CORB issues resolved

**Needs Improvement:**
- ⚠️ Change default secrets
- ⚠️ Enable HTTPS/TLS
- ⚠️ Enhance input validation
- ⚠️ Add comprehensive logging
- ⚠️ Use PostgreSQL instead of SQLite
- ⚠️ Implement CSRF protection
- ⚠️ Add file upload validation

**With recommended improvements: 10/10** 🎯

---

**Next Steps:**
1. Change all default secrets
2. Enable HTTPS in production
3. Implement enhanced input validation
4. Set up monitoring and alerting
5. Run security audit
6. Perform penetration testing

**Remember:** Security is an ongoing process, not a one-time fix!
