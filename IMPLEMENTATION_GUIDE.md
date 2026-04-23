# IMPLEMENTATION QUICK START GUIDE

**Target:** Senior Development Team  
**Objective:** Fast-track implementation using the ARCHITECTURE.md as blueprint  

---

## PHASE 1: BACKEND SETUP (Weeks 1-2)

### Step 1: Update Requirements & Dependencies

```bash
# backend/requirements.txt
Django==6.0.4
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.2
psycopg2-binary==2.9.9
python-decouple==3.8
Pillow==10.1.0
django-cors-headers==4.3.1
django-filter==23.5
drf-spectacular==0.27.0
gunicorn==21.2.0
whitenoise==6.6.0
python-dotenv==1.0.0
```

### Step 2: Django Settings Structure

Replace `backend/settings.py` with multi-environment approach:

```python
# backend/settings/__init__.py
from decouple import config

env = config('ENVIRONMENT', default='development')

if env == 'production':
    from .production import *
elif env == 'testing':
    from .testing import *
else:
    from .development import *
```

### Step 3: Create Django Apps

```bash
cd backend
python manage.py startapp accounts apps.accounts
python manage.py startapp profiles apps.profiles
python manage.py startapp properties apps.properties
python manage.py startapp reviews apps.reviews
python manage.py startapp visits apps.visits
python manage.py startapp common apps.common
```

### Step 4: Database Models Implementation Order

1. **accounts/models.py** - User (extend Django User)
2. **profiles/models.py** - Profile (1:1 with User)
3. **properties/models.py** - Property, PropertyImage, PropertyFeature
4. **reviews/models.py** - Review
5. **visits/models.py** - VisitRequest
6. **common/models.py** - BaseModel, custom managers

### Step 5: Implement Authentication Layer

Priority order:
1. **accounts/utils.py** - Token generation functions
2. **accounts/authentication.py** - JWT authentication class
3. **accounts/serializers.py** - User registration & login serializers
4. **accounts/views.py** - Auth endpoints (register, login, logout, refresh)

### Step 6: Create Base Serializers & Permissions

```python
# common/serializers.py - Base serializer with validation
# common/permissions.py - IsAuthenticated, IsOwner, IsPropertyOwner, etc.
# common/pagination.py - StandardPagination class
# common/exceptions.py - Custom exception classes
```

### Step 7: Implement Core Services

Order by dependency:
1. **accounts/services.py** - AuthService, TokenService
2. **profiles/services.py** - ProfileService
3. **properties/services.py** - PropertyService
4. **reviews/services.py** - ReviewService
5. **visits/services.py** - VisitRequestService

### Step 8: Implement ViewSets & API Endpoints

```python
# Priority order:
# 1. accounts/views.py (RegisterView, LoginView, LogoutView)
# 2. profiles/views.py (ProfileViewSet, AgentSearchView)
# 3. properties/views.py (PropertyViewSet, PropertySearchView)
# 4. reviews/views.py (ReviewViewSet)
# 5. visits/views.py (VisitRequestViewSet)
```

### Step 9: URL Configuration

```python
# backend/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'properties', PropertyViewSet, basename='property')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'visit-requests', VisitRequestViewSet, basename='visitrequest')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include([
        path('auth/', include('apps.accounts.urls')),
        path('', include(router.urls)),
    ])),
]
```

### Step 10: Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

---

## PHASE 2: FRONTEND SETUP (Weeks 2-3)

### Step 1: Install Additional Dependencies

```bash
cd frontend
npm install react-router-dom axios react-hook-form zod lucide-react
npm install -D @types/node @types/react @types/react-dom tailwindcss@latest postcss autoprefixer
```

### Step 2: Project Structure Setup

Create folders according to [Frontend Architecture Section 6.2](./ARCHITECTURE.md#62-folder-structure-scalable)

### Step 3: Create Configuration Files

```javascript
// src/config/api.config.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const API_TIMEOUT = 10000;

// src/config/constants.ts
export const PROPERTY_TYPES = ['residential', 'commercial', 'industrial', 'agricultural'];
export const PROPERTY_STATUS = ['sale', 'rent', 'sold', 'rented'];
export const PAGINATION_DEFAULT = 20;
export const PAGINATION_MAX = 100;
```

### Step 4: Implement API Layer

1. **src/services/api.client.ts** - Axios instance with interceptors
2. **src/services/auth.service.ts** - Auth API calls
3. **src/services/property.service.ts** - Property CRUD & search
4. **src/services/profile.service.ts** - Profile management
5. **src/services/review.service.ts** - Review management
6. **src/services/visit.service.ts** - Visit request management

### Step 5: Create Context & Hooks

1. **src/context/AuthContext.jsx** - Authentication state
2. **src/hooks/useAuth.ts** - Auth hook
3. **src/hooks/useFetch.ts** - Data fetching logic
4. **src/hooks/usePagination.ts** - Pagination helpers

### Step 6: Build Core Components

**Layout Components:**
- Header (navigation)
- Footer
- MainLayout (wrapper)

**Auth Components:**
- LoginForm
- RegisterForm
- ProtectedRoute

**Property Components:**
- PropertyCard
- PropertyGrid
- PropertyFilters
- PropertyGallery
- VisitRequestForm

**Agent Components:**
- AgentCard
- AgentGrid
- ReviewList
- ReviewForm

### Step 7: Create Pages

Priority order:
1. Home
2. Properties (with filters)
3. PropertyDetail
4. Agents
5. AgentProfile
6. Login/Register
7. Dashboard (protected)

### Step 8: Setup Routing

```javascript
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:slug" element={<PropertyDetail />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/agents/:id" element={<AgentProfile />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard/*" 
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/dashboard/agent/*" 
            element={
              <ProtectedRoute requiredRole="agent">
                <AgentDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

---

## TESTING STRATEGY (Phase 1 Critical Features)

### Backend Tests

```python
# tests/test_auth.py
from django.test import TestCase
from apps.accounts.models import User

class UserRegistrationTest(TestCase):
    def test_register_success(self):
        """Test successful user registration"""
        response = self.client.post('/api/auth/register/', {
            'email': 'test@example.com',
            'username': 'testuser',
            'password': 'TestPassword123!',
            'password_confirm': 'TestPassword123!'
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(User.objects.count(), 1)

    def test_register_duplicate_email(self):
        """Test registration with duplicate email"""
        User.objects.create_user(
            email='test@example.com',
            username='existing',
            password='pass'
        )
        response = self.client.post('/api/auth/register/', {
            'email': 'test@example.com',
            'username': 'newuser',
            'password': 'TestPassword123!',
            'password_confirm': 'TestPassword123!'
        })
        self.assertEqual(response.status_code, 400)

# tests/test_properties.py
class PropertyOwnershipTest(TestCase):
    def test_property_ownership_validation(self):
        """CRITICAL: Verify property-agent ownership"""
        agent = create_agent_user()
        other_agent = create_agent_user()
        property_obj = create_property(agent=agent)
        
        # Other agent should NOT be able to update
        self.assertFalse(PropertyPermission.check_ownership(other_agent, property_obj))
        
        # Original agent SHOULD be able to update
        self.assertTrue(PropertyPermission.check_ownership(agent, property_obj))

# tests/test_reviews.py
class ReviewUniquenessTest(TestCase):
    def test_one_review_per_user_per_agent(self):
        """CRITICAL: Enforce one review per user per agent"""
        reviewer = create_user()
        agent = create_agent_user()
        
        # First review
        Review.objects.create(reviewer=reviewer, agent_profile=agent.profile, rating=5)
        
        # Second review should fail or update
        with self.assertRaises(IntegrityError):
            Review.objects.create(reviewer=reviewer, agent_profile=agent.profile, rating=3)
```

### Frontend Tests

```javascript
// src/__tests__/auth.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '../components/Auth/LoginForm';

describe('LoginForm', () => {
  it('should display login form', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should handle login submission', async () => {
    render(<LoginForm onSuccess={() => {}} />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByText(/sign in/i));
    
    // Assertions...
  });
});
```

---

## VALIDATION CHECKLIST

### Backend MVP Checklist:
- [ ] Database schema created and migrated
- [ ] User registration endpoint working
- [ ] User login endpoint working
- [ ] Token refresh endpoint working
- [ ] JWT authentication middleware working
- [ ] Profile endpoints (GET, UPDATE)
- [ ] Property CRUD endpoints
- [ ] Property search with filters & pagination
- [ ] Review create/update endpoint (1 per user per agent enforced)
- [ ] Visit request endpoints
- [ ] All ownership validations working
- [ ] Error handling for all endpoints
- [ ] All tests passing
- [ ] API documentation generated (DRF Spectacular)

### Frontend MVP Checklist:
- [ ] Authentication flow (register, login, logout)
- [ ] Token storage and refresh working
- [ ] Protected routes functional
- [ ] Home page displaying
- [ ] Properties listing with filters
- [ ] Property detail page
- [ ] Agent directory and profiles
- [ ] Visit request submission
- [ ] Review submission
- [ ] Error handling and user feedback
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Build production-ready bundle

---

## DEVELOPMENT WORKFLOW

### Git Workflow
```bash
# Main branch: production-ready code
# Develop branch: integration point
# Feature branches: individual features

git checkout -b feature/auth-system
# ... implement ...
git push origin feature/auth-system
# Create PR for code review
# After review & tests pass: merge to develop
# Periodic: develop → main releases
```

### Local Development
```bash
# Terminal 1: Backend
cd backend
python manage.py runserver

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Database (if using docker)
docker-compose up postgres redis

# Browser: http://localhost:5173
```

---

## COMMON IMPLEMENTATION PITFALLS TO AVOID

❌ **DON'T:**
- Store sensitive data in localStorage (use httpOnly cookies)
- Skip ownership validation in any mutation endpoint
- Return full objects in list endpoints (paginate & summarize)
- Use string concatenation in SQL queries
- Expose database errors to users
- Skip CORS configuration
- Deploy without HTTPS/SSL
- Use hardcoded secrets in code
- Implement custom authentication (use JWT library)
- Forget to validate on both frontend AND backend

✅ **DO:**
- Use Django ORM (prevents SQL injection)
- Implement middleware for error handling
- Use Django signals for side effects
- Leverage DRF serializers for validation
- Cache aggressively (but invalidate correctly)
- Log important operations
- Use type hints in Python (mypy)
- Document API endpoints with DRF Spectacular
- Write tests for critical paths
- Use environment variables for configuration

---

## TIMELINE ESTIMATE

| Phase | Component | Estimated Days |
|-------|-----------|-----------------|
| **1** | Backend Structure & Setup | 2-3 |
| **1** | Authentication & JWT | 3-4 |
| **1** | User & Profile APIs | 2-3 |
| **1** | Property CRUD & Search | 4-5 |
| **1** | Reviews & Visit Requests | 2-3 |
| **1** | Testing & Documentation | 3-4 |
| **2** | Frontend Setup & Structure | 2-3 |
| **2** | Auth UI & Flow | 2-3 |
| **2** | Property Listing & Detail | 3-4 |
| **2** | Agent Directory | 2-3 |
| **2** | Dashboard & Forms | 3-4 |
| **2** | Testing & Deployment | 2-3 |
| **3** | Optimization & Scaling | 4-5 |
| **3** | Monitoring & Maintenance | 2 |

**Total: 6-8 weeks for MVP**

---

**Reference:** See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed specifications

