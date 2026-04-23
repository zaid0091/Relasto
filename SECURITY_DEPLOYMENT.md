# SECURITY & DEPLOYMENT CHECKLIST

**Target:** Production Readiness  
**Frequency:** Before every release to production

---

## SECURITY CHECKLIST

### Authentication & Authorization

#### Before Testing Phase:
- [ ] JWT library installed: `djangorestframework-simplejwt`
- [ ] Token generation function implemented (access + refresh)
- [ ] Token validation middleware created
- [ ] Access token expiration: 1 hour ✓
- [ ] Refresh token expiration: 7 days ✓
- [ ] Token payload includes: user_id, email, is_agent, is_admin
- [ ] Refresh token endpoint implemented
- [ ] Logout endpoint implemented (token blacklist if using Redis)
- [ ] CSRF protection enabled: `CSRF_MIDDLEWARE` in settings
- [ ] CORS configured only for allowed origins

#### Before MVP Release:
- [ ] All mutation endpoints require authentication
- [ ] GET endpoints for sensitive data require authentication
- [ ] Anonymous users can only view public data (listings, agents)
- [ ] Password validation enforced: min 8 chars, complexity
- [ ] Failed login attempts logged and rate-limited
- [ ] Session timeout enforced (redirect to login after 7 days)
- [ ] HttpOnly cookie for refresh token (not accessible to JS)
- [ ] Secure flag on cookies (HTTPS only)
- [ ] SameSite cookie attribute: Strict

### Authorization & Ownership

#### Critical - Must Implement:
- [ ] IsAuthenticated permission class in all protected endpoints
- [ ] Property ownership validation: only agent can modify their property
- [ ] Profile update: only user can update their own profile
- [ ] Review modification: only author can modify their review
- [ ] Visit request access: only assigned agent can view/modify
- [ ] Admin-only endpoints protected with `IsAdminUser` permission
- [ ] No wildcard permissions (all endpoints default deny)
- [ ] Ownership checks happen in ViewSet.check_object_permissions()

#### Validation Examples:
```python
# ✓ CORRECT:
def update_property(request, pk):
    property_obj = Property.objects.get(pk=pk)
    if property_obj.agent.user != request.user:
        raise PermissionDenied('You cannot modify this property')
    # ... proceed with update

# ✗ WRONG:
def update_property(request, pk):
    # No ownership check!
    Property.objects.filter(pk=pk).update(title=...)
```

### Input Validation & Injection Prevention

#### SQL Injection Prevention:
- [ ] All database queries use Django ORM (never raw SQL)
- [ ] If raw SQL required: use parameters `%(param)s` syntax
- [ ] Code review process for any `.raw()` or `.extra()` usage

#### XSS Prevention (Frontend):
- [ ] No `dangerouslySetInnerHTML` except for sanitized HTML
- [ ] Use DOMPurify for sanitization if needed: `npm install dompurify`
- [ ] All user input displayed is escaped by React by default
- [ ] Review any `v-html` or `innerHTML` usage

#### XSS Prevention (Backend):
- [ ] Serializers validate all input
- [ ] String fields have max_length constraints
- [ ] HTML/Markdown fields sanitized before storage if applicable
- [ ] Content-Type always returned as application/json
- [ ] X-Content-Type-Options: nosniff header set

#### CSRF Protection:
- [ ] CSRF middleware enabled in all environments
- [ ] CSRF token included in all POST/PUT/PATCH/DELETE requests
- [ ] Frontend sends X-CSRFToken header or csrf_token in body
- [ ] Safe methods (GET, HEAD, OPTIONS) exempt from CSRF

### Sensitive Data Protection

#### Password Security:
- [ ] Passwords hashed using Django's default (PBKDF2)
- [ ] Never log passwords, user IDs, or tokens
- [ ] Password reset tokens expire after 1 hour
- [ ] Never email passwords (only reset links)
- [ ] Password requirements enforced:
  - Min 8 characters
  - Must contain uppercase
  - Must contain lowercase
  - Must contain numbers

#### API Response Security:
- [ ] Passwords never returned in API responses
- [ ] Sensitive fields excluded from serializers
- [ ] No database IDs exposed if possible (use slugs for public data)
- [ ] Error messages don't reveal system internals

#### Data in Transit:
- [ ] HTTPS/TLS enforced in production
- [ ] SECURE_SSL_REDIRECT = True in production
- [ ] HSTS header set: `max-age=31536000` (1 year)
- [ ] All cookies: Secure, HttpOnly, SameSite=Strict

#### Data at Rest:
- [ ] Database password strong and rotated regularly
- [ ] S3 bucket policy restrictive (no public read by default)
- [ ] Media files uploaded to private S3 bucket
- [ ] Database backups encrypted
- [ ] No secrets in git (use environment variables)

### Rate Limiting & DoS Protection

- [ ] Login endpoint rate-limited: 5 attempts per 5 minutes
- [ ] Registration endpoint rate-limited: 3 attempts per 10 minutes
- [ ] Property search: 1000 requests per hour
- [ ] API endpoints: 100-1000 requests per hour per user
- [ ] Rate limiting headers returned: X-RateLimit-Remaining, X-RateLimit-Reset
- [ ] DDoS protection via WAF (AWS WAF recommended)

### Logging & Monitoring

- [ ] Authentication attempts logged (success and failure)
- [ ] Failed authorization attempts logged with user/reason
- [ ] Database queries logged in development (django-debug-toolbar)
- [ ] Slow queries identified and optimized (>500ms threshold)
- [ ] No sensitive data in logs (passwords, tokens, keys)
- [ ] Log retention: 90 days minimum
- [ ] Log aggregation: CloudWatch or ELK

### Secrets Management

#### Development:
- [ ] .env file in .gitignore ✓
- [ ] .env.example template committed (no secrets)
- [ ] SECRET_KEY different per environment
- [ ] Different DB credentials per environment

#### Production:
- [ ] Secrets in AWS Secrets Manager or environment variables
- [ ] Secrets never hardcoded
- [ ] Secrets never committed to git
- [ ] Rotation policy for sensitive credentials (30-90 days)
- [ ] Audit log for secret access

### Dependencies & Vulnerabilities

#### Before Release:
- [ ] Run: `pip-audit` to check for vulnerable dependencies
- [ ] Run: `npm audit` for frontend vulnerabilities
- [ ] Keep Django updated to latest stable
- [ ] Keep all dependencies updated monthly
- [ ] Security advisories subscribed (GitHub Dependabot)
- [ ] Verify no dev dependencies in production

---

## PRODUCTION DEPLOYMENT CHECKLIST

### Pre-Deployment (1 week before)

#### Code Quality:
- [ ] All tests passing (backend & frontend)
- [ ] Code coverage: >= 80%
- [ ] Linting passing: `eslint .` (frontend), `flake8` (backend)
- [ ] Type checking passing: `mypy` (backend)
- [ ] No console.log statements in production frontend code
- [ ] No DEBUG = True in production settings

#### Performance:
- [ ] Database indexes created and verified
- [ ] N+1 queries eliminated (use select_related/prefetch_related)
- [ ] API response times: < 500ms for 95th percentile
- [ ] Frontend bundle size: < 500KB gzipped
- [ ] Database query times: < 100ms for 95th percentile

#### Documentation:
- [ ] API endpoints documented (DRF Spectacular generated)
- [ ] Deployment runbook created
- [ ] Rollback procedure documented
- [ ] Incident response procedure documented
- [ ] Database backup/restore procedure tested

### Infrastructure Setup

#### Database:
- [ ] PostgreSQL 14+ on RDS
- [ ] Multi-AZ enabled (automatic failover)
- [ ] Automated daily backups (7-day retention)
- [ ] Manual backup before deployment
- [ ] Connection pooling configured (max 50 connections)
- [ ] Read replicas for SELECT scalability

#### Backend:
- [ ] Django settings for production configured
- [ ] ALLOWED_HOSTS contains production domain
- [ ] DEBUG = False verified
- [ ] SECRET_KEY strong and random
- [ ] SECURE_SSL_REDIRECT = True
- [ ] SECURE_HSTS_SECONDS = 31536000
- [ ] SESSION_COOKIE_SECURE = True
- [ ] CSRF_COOKIE_SECURE = True
- [ ] Gunicorn workers: 4 per CPU core
- [ ] Gunicorn timeout: 120 seconds
- [ ] Static files collected and serving via CDN

#### Frontend:
- [ ] Build production bundle: `npm run build`
- [ ] Bundle size analyzed and optimized
- [ ] Nginx caching headers configured
- [ ] Gzip compression enabled
- [ ] Static assets cached: 1 year
- [ ] HTML cached: 1 hour

#### CDN & Caching:
- [ ] CloudFront distribution created
- [ ] Origin compression enabled
- [ ] TTL configured: static 1 year, API 5 minutes
- [ ] Behavior for /api/* set to 0 cache (no CDN caching for API)

#### Security:
- [ ] SSL/TLS certificate installed (AWS Certificate Manager)
- [ ] Certificate auto-renewal configured
- [ ] Security headers verified:
  - [ ] Strict-Transport-Security: max-age=31536000
  - [ ] X-Content-Type-Options: nosniff
  - [ ] X-Frame-Options: DENY
  - [ ] X-XSS-Protection: 1; mode=block
  - [ ] Referrer-Policy: strict-origin-when-cross-origin

#### Monitoring & Logging:
- [ ] CloudWatch dashboards created
- [ ] Alarms configured: CPU, memory, error rate, latency
- [ ] Log aggregation: CloudWatch Logs configured
- [ ] Health check endpoint created: GET /api/health
- [ ] Uptime monitoring service activated (Pingdom/Uptime Robot)

### Deployment Steps

#### 1. Pre-Deployment Checks (execute in order):
```bash
# Backend
cd backend
python manage.py migrate --check        # Verify migrations
python manage.py check --deploy         # Django deployment checks
python manage.py collectstatic --dry-run

# Frontend
cd frontend
npm run lint                            # Run linting
npm run build                           # Build optimized bundle
```

#### 2. Create Database Backup:
```bash
aws rds create-db-snapshot \
  --db-instance-identifier relasto-prod \
  --db-snapshot-identifier relasto-prod-$(date +%Y%m%d-%H%M%S)
```

#### 3. Deploy Backend:
```bash
# Option 1: ECS Task Deployment
aws ecs update-service \
  --cluster relasto-prod \
  --service relasto-backend \
  --force-new-deployment

# Option 2: EC2/Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

#### 4. Run Migrations:
```bash
python manage.py migrate
```

#### 5. Deploy Frontend:
```bash
# Build and upload to S3
npm run build
aws s3 sync dist/ s3://relasto-frontend-prod/

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DIST_ID \
  --paths "/*"
```

#### 6. Verify Deployment:
```bash
# Check backend health
curl https://api.relasto.com/api/health

# Check frontend loads
curl https://relasto.com | head -20

# Monitor logs
tail -f /var/log/django/relasto.log
```

### Post-Deployment Validation

#### Smoke Tests (15 minutes after deployment):
- [ ] Website loads: https://relasto.com
- [ ] Login endpoint responds: POST /api/auth/login
- [ ] Registration works: POST /api/auth/register
- [ ] Property listing loads: GET /api/properties
- [ ] Property creation works (for admin): POST /api/properties
- [ ] No 500 errors in CloudWatch logs
- [ ] API response times normal (< 500ms)
- [ ] Database connections healthy

#### Monitoring (1 hour after deployment):
- [ ] CPU usage normal (< 70%)
- [ ] Memory usage normal (< 80%)
- [ ] Error rate acceptable (< 0.1%)
- [ ] No spike in 4xx errors
- [ ] No spike in 5xx errors
- [ ] Database query performance normal
- [ ] All transactions completing

### Rollback Procedure

**If deployment fails:**

```bash
# 1. Identify the issue
tail -f /var/log/django/relasto.log
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name HTTPCode_Target_5XX_Count

# 2. Revert to previous version
aws ecs update-service \
  --cluster relasto-prod \
  --service relasto-backend \
  --force-new-deployment  # Will use previous image

# 3. Revert frontend if needed
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DIST_ID \
  --paths "/*"

# 4. Restore database if migrations failed
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier relasto-prod-restore \
  --db-snapshot-identifier relasto-prod-YYYYMMDD-HHMMSS

# 5. Verify rollback successful
curl https://api.relasto.com/api/health
```

---

## PERFORMANCE TARGETS

| Metric | Target | Threshold |
|--------|--------|-----------|
| API Response Time (P95) | < 500ms | > 1000ms = alert |
| API Response Time (P99) | < 1000ms | > 2000ms = alert |
| Database Query Time (P95) | < 100ms | > 200ms = investigate |
| Frontend Bundle Size | < 500KB | > 750KB = investigate |
| Core Web Vitals LCP | < 2.5s | > 4s = investigate |
| Uptime | 99.5% | < 99% = page/alert |
| Error Rate | < 0.1% | > 0.5% = alert |
| CPU Utilization | < 60% | > 80% = scale up |

---

## INCIDENT RESPONSE

### Error Rates Spiking

```
1. Check logs: CloudWatch Logs
2. Check recent deployments: AWS CodePipeline
3. Check database: Query performance, connections
4. Check external services: API dependencies
5. If recent deployment: ROLLBACK
6. If database: Scale up or optimize queries
7. Notify team immediately
```

### Database Connection Issues

```
1. Check connection count: SELECT count(*) FROM pg_stat_activity;
2. Check for long-running queries: SELECT * FROM pg_stat_statements
3. Kill idle connections if needed
4. Scale up database if at capacity
5. Implement connection pooling (PgBouncer)
```

### High Latency

```
1. Check database query times
2. Check for N+1 queries in logs
3. Check AWS instance metrics (CPU, memory)
4. Check network latency: traceroute api.relasto.com
5. Optimize slow queries with indexes
6. Implement caching layer
```

---

## MAINTENANCE SCHEDULE

### Daily:
- [ ] Monitor error rates in CloudWatch
- [ ] Check database backup completion
- [ ] Review logs for warnings

### Weekly:
- [ ] Security patch assessment
- [ ] Dependency update check (npm/pip)
- [ ] Database connection pool health
- [ ] DNS resolution check

### Monthly:
- [ ] Security audit review
- [ ] Performance optimization review
- [ ] Cost optimization review
- [ ] Capacity planning check
- [ ] Disaster recovery drill

### Quarterly:
- [ ] Full security assessment
- [ ] Load testing and scaling validation
- [ ] Architecture review for optimization
- [ ] Documentation update

---

## CONTACTS & ESCALATION

| Incident Level | Who | Response Time |
|---|---|---|
| Critical (down) | Engineering Lead | 5 minutes |
| High (> 50% error) | Team | 15 minutes |
| Medium (degraded) | Senior Dev | 30 minutes |
| Low (warnings) | Dev on rotation | 4 hours |

---

**End of Security & Deployment Checklist**

