# RELASTO PLATFORM - COMPLETE ARCHITECTURE PACKAGE

**Created:** April 22, 2026  
**Status:** Production-Ready Implementation Plan  
**Target:** Senior Development Team

---

## PACKAGE CONTENTS

This architecture package contains everything a senior development team needs to implement the Relasto Platform without additional architectural clarification.

### 📋 DOCUMENTS INCLUDED

| Document | Purpose | Audience | Time to Read |
|----------|---------|----------|--------------|
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Complete system design & specifications | All | 45 min |
| **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** | Step-by-step implementation roadmap | Developers | 30 min |
| **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** | Full Django models with validation rules | Backend Devs | 25 min |
| **[DEVELOPER_REFERENCE.md](./DEVELOPER_REFERENCE.md)** | Common patterns & code snippets | Developers | 20 min (reference) |
| **[SECURITY_DEPLOYMENT.md](./SECURITY_DEPLOYMENT.md)** | Security checklist & deployment guide | DevOps/Security | 35 min |

---

## QUICK NAVIGATION

### 🚀 "I need to start development NOW"
1. Read: [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Phase 1 (Weeks 1-2)
2. Reference: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for model implementation
3. Copy patterns from: [DEVELOPER_REFERENCE.md](./DEVELOPER_REFERENCE.md)

### 🔍 "I need to understand the full system"
1. Read: [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete overview
2. Reference: Sections 5 (REST API) and 6 (Frontend)

### 🔐 "I need security & deployment info"
1. Read: [SECURITY_DEPLOYMENT.md](./SECURITY_DEPLOYMENT.md)
2. Pre-deployment: Complete the checklist (1 week before release)

### 💾 "I need to design the database"
1. Read: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Full schema with Django models
2. Reference: Table definitions and relationships

### 💡 "I need code examples"
1. Go to: [DEVELOPER_REFERENCE.md](./DEVELOPER_REFERENCE.md)
2. Find your pattern in the quick decision tree

---

## ARCHITECTURE SUMMARY

### System Overview
```
Frontend (React/Vite) ←→ REST API (Django/DRF) ←→ PostgreSQL
                        ↓
                  Redis (optional)
                        ↓
                   S3 Storage
```

### Key Architectural Decisions
- ✅ **Layered Architecture:** Views → Services → Repositories → Models
- ✅ **Stateless Backend:** JWT-based, horizontally scalable
- ✅ **Ownership-First:** All mutations validate user ownership
- ✅ **API-First:** Frontend only accesses REST APIs
- ✅ **Pagination Standard:** All list endpoints paginated
- ✅ **Database-Level Constraints:** Unique constraints enforce business rules
- ✅ **Clean Error Handling:** Structured responses with error codes

### Technology Stack (Finalized)
```
Backend:       Django 6.0 + DRF + PostgreSQL
Frontend:      React 19 + Vite + TypeScript + Tailwind
Authentication: JWT (djangorestframework-simplejwt)
Deployment:    Docker + AWS (ECS/RDS/S3/CloudFront)
```

---

## CRITICAL BUSINESS RULES IMPLEMENTED

### 1. One Review Per User Per Agent
```sql
UNIQUE (reviewer_id, agent_profile_id)
```
- Enforced at database level
- Enforced at service layer (update_or_create)

### 2. Property Ownership
```python
# Only agent who created property can modify
if property_obj.agent.user != request.user:
    raise PermissionDenied()
```
- Enforced at API layer
- Enforced in service layer
- Checked before any mutation

### 3. Property-Agent Validation in Visit Requests
```python
# Property must belong to specified agent
if property_obj.agent_id != agent_profile.id:
    raise ValidationError()
```
- Enforced at API layer
- Critical for data integrity

### 4. Only Agents Create Properties
```python
if not user.profile.is_agent:
    raise PermissionDenied('Only agents can create properties')
```
- Enforced at service layer
- Enforced at permission layer

---

## API ENDPOINTS DESIGNED (42 endpoints total)

### Authentication (4)
```
POST   /api/auth/register/
POST   /api/auth/login/
POST   /api/auth/logout/
POST   /api/auth/refresh/
```

### Users & Profiles (4)
```
GET    /api/profiles/me/
GET    /api/profiles/{id}/
PUT    /api/profiles/{id}/
GET    /api/profiles/search-agents/
```

### Properties (7)
```
POST   /api/properties/
GET    /api/properties/
GET    /api/properties/{id}/
PUT    /api/properties/{id}/
DELETE /api/properties/{id}/
POST   /api/properties/{id}/images/
GET    /api/properties/{id}/images/
```

### Reviews (4)
```
POST   /api/reviews/
GET    /api/profiles/{id}/reviews/
GET    /api/reviews/{id}/
DELETE /api/reviews/{id}/
```

### Visit Requests (4)
```
POST   /api/visit-requests/
GET    /api/visit-requests/
GET    /api/visit-requests/{id}/
PATCH  /api/visit-requests/{id}/
```

### Database Schema (6 tables)
```
users                    (2 indexes)
profiles                 (4 indexes)
properties               (9 indexes)
property_images          (2 indexes)
property_features        (2 indexes)
reviews                  (3 indexes)
visit_requests           (5 indexes)
```

---

## DATABASE SCHEMA (At a Glance)

```sql
-- Users: Email-based authentication
users(id, email*, username*, password, is_active)

-- Profiles: 1:1 with User, includes agent flag
profiles(user_id*, is_agent*, average_rating, city*, ...)

-- Properties: Agent-owned listings
properties(id, agent_id*, slug*, title, price, city*, ...)

-- PropertyImages: Multiple images per property
property_images(id, property_id*, image_url, is_primary*)

-- PropertyFeatures: Flexible key-value storage
property_features(id, property_id*, feature_key*, feature_value)

-- Reviews: Agent feedback
reviews(id, reviewer_id*, agent_profile_id*, rating, UNIQUE(reviewer, agent))

-- VisitRequests: Lead management
visit_requests(id, user_id*, property_id*, agent_id*, preferred_date)
```

---

## IMPLEMENTATION TIMELINE

| Phase | Duration | Components | Status |
|-------|----------|-----------|--------|
| **Phase 1** | 2-3 weeks | Backend setup, Auth, CRUD APIs, Database | Ready to implement |
| **Phase 2** | 2-3 weeks | Frontend UI, State management, Integration | Ready to implement |
| **Phase 3** | 1-2 weeks | Testing, Optimization, Deployment | Ready to implement |
| **Total** | 6-8 weeks | Full MVP | Estimated timeline |

---

## VALIDATION CHECKLIST (Pre-Release)

### Backend MVP (Testable)
- [ ] User registration & login
- [ ] Token refresh working
- [ ] Property CRUD
- [ ] Property search with filters
- [ ] Reviews (one per user per agent enforced)
- [ ] Visit requests
- [ ] All ownership validations
- [ ] API tests: 80%+ coverage

### Frontend MVP (Deployable)
- [ ] Auth flow (register, login, logout)
- [ ] Property listing & detail
- [ ] Agent directory & profiles
- [ ] Visit request form
- [ ] Review form
- [ ] Protected routes
- [ ] Responsive design
- [ ] Production build < 500KB

### Security & Deployment
- [ ] All security checklist items ✓
- [ ] Environment configuration ✓
- [ ] Database backups automated ✓
- [ ] SSL/TLS configured ✓
- [ ] Rate limiting enabled ✓
- [ ] Logging configured ✓

---

## KEY FILES TO IMPLEMENT

### Backend (Priority Order)
1. **models.py** (all apps) - Database schema
2. **serializers.py** - Input/output validation
3. **services.py** - Business logic
4. **views.py** - API endpoints
5. **urls.py** - URL routing
6. **permissions.py** - Access control
7. **tests.py** - Unit tests

### Frontend (Priority Order)
1. **App.jsx** - Main component & routing
2. **context/AuthContext.jsx** - State management
3. **services/** - API client layer
4. **pages/** - Route pages
5. **components/** - Reusable UI components
6. **hooks/** - Custom React hooks

---

## IMPORTANT NOTES FOR DEVELOPERS

### ⚠️ CRITICAL - DO NOT SKIP

1. **Ownership Validation**
   - Every mutation endpoint MUST validate user ownership
   - Check at API layer AND service layer
   - See [DEVELOPER_REFERENCE.md](#2-permission-checking-pattern)

2. **Review Uniqueness**
   - Database constraint: UNIQUE(reviewer_id, agent_profile_id)
   - Service layer: use update_or_create()
   - See [DATABASE_SCHEMA.md](#6-review-model)

3. **Property-Agent Relationship**
   - Before creating VisitRequest: verify property.agent_id == agent.id
   - See [DATABASE_SCHEMA.md](#6-visit-request-model)

4. **Pagination**
   - ALL list endpoints must paginate (20-100 items default)
   - See [DEVELOPER_REFERENCE.md](#3-pagination-pattern)

5. **Error Handling**
   - Use consistent error format: { status, error, code }
   - Never expose database errors to users
   - See [DEVELOPER_REFERENCE.md](#5-error-handling-pattern)

### 🚀 BEST PRACTICES

- Use Service Layer for all business logic
- Use Serializers for all input validation
- Use Permissions for access control
- Use Signals for side effects (not required flow)
- Use Manager/QuerySet for complex queries
- Use TypeScript on frontend (recommended)
- Test critical paths before release
- Document API with DRF Spectacular

### 🔒 SECURITY REMINDERS

- HTTPS only in production
- Secrets in environment variables
- Rate limiting on auth endpoints
- SQL injection prevention (use ORM)
- XSS prevention (React escapes by default)
- CSRF protection enabled
- CORS configured for allowed origins only

---

## NEXT STEPS

### For Development Team Lead:
1. Review [ARCHITECTURE.md](./ARCHITECTURE.md) - 45 minutes
2. Assign tasks using [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
3. Set up Git workflow and CI/CD pipeline
4. Create Jira/Linear tickets from implementation phases

### For Backend Developers:
1. Read [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
2. Implement models first (Week 1)
3. Reference [DEVELOPER_REFERENCE.md](./DEVELOPER_REFERENCE.md) for patterns
4. Write tests for all business logic

### For Frontend Developers:
1. Read sections 6-7 in [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Set up project structure from [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
3. Reference [DEVELOPER_REFERENCE.md](./DEVELOPER_REFERENCE.md) for patterns
4. Build components incrementally

### For DevOps/Security:
1. Read [SECURITY_DEPLOYMENT.md](./SECURITY_DEPLOYMENT.md)
2. Prepare AWS infrastructure (RDS, S3, ECS)
3. Set up CI/CD pipeline (GitHub Actions)
4. Configure monitoring (CloudWatch)

---

## SUPPORT & CLARIFICATION

**Architecture Questions?**
- Refer to [ARCHITECTURE.md](./ARCHITECTURE.md)
- Email architect with section reference

**Implementation Questions?**
- Check [DEVELOPER_REFERENCE.md](./DEVELOPER_REFERENCE.md)
- Refer to code patterns for your use case

**Database Questions?**
- Check [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- Review model relationships and constraints

**Deployment Questions?**
- Check [SECURITY_DEPLOYMENT.md](./SECURITY_DEPLOYMENT.md)
- Follow step-by-step deployment guide

---

## METRICS FOR SUCCESS

### Development Phase
- [ ] All tests passing
- [ ] 80%+ code coverage
- [ ] 0 security vulnerabilities
- [ ] API documentation complete

### Launch Phase
- [ ] All checklist items complete
- [ ] < 500ms P95 response time
- [ ] Uptime: 99.5%
- [ ] Error rate: < 0.1%

### First Month
- [ ] No critical bugs in production
- [ ] User adoption on track
- [ ] System performing within SLA
- [ ] Monitoring & alerting functional

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-22 | Initial complete architecture package |

---

## DOCUMENT MAP

```
RELASTO ARCHITECTURE PACKAGE
├── README.md (this file)
├── ARCHITECTURE.md
│   ├── System Overview
│   ├── Technology Stack
│   ├── Backend Architecture
│   ├── Database Schema
│   ├── Authentication System
│   ├── REST API Design
│   ├── Frontend Architecture
│   ├── Non-Functional Requirements
│   └── Deployment & Environment
├── IMPLEMENTATION_GUIDE.md
│   ├── Phase 1: Backend Setup
│   ├── Phase 2: Frontend Setup
│   ├── Testing Strategy
│   └── Timeline Estimate
├── DATABASE_SCHEMA.md
│   ├── Base Model
│   ├── All 6 Data Models
│   ├── Migrations Guide
│   ├── Data Validation Rules
│   └── Index Strategy
├── DEVELOPER_REFERENCE.md
│   ├── Service Layer Pattern
│   ├── Permission Pattern
│   ├── Pagination Pattern
│   ├── Filtering Pattern
│   ├── Error Handling Pattern
│   ├── Signal Pattern
│   ├── Frontend API Pattern
│   ├── Form Handling Pattern
│   └── Quick Decision Tree
└── SECURITY_DEPLOYMENT.md
    ├── Security Checklist
    ├── Production Deployment
    ├── Pre-Deployment Checks
    ├── Deployment Steps
    ├── Post-Deployment Validation
    ├── Performance Targets
    ├── Incident Response
    └── Maintenance Schedule
```

---

**This architecture package is complete and production-ready.**

**Questions?** Refer to the document map above or contact architecture team.

**Ready to build?** Start with [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

