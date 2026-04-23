# RELASTO PLATFORM - PRODUCTION-READY ARCHITECTURE DOCUMENT

**Version:** 1.0  
**Date:** 2026-04-22  
**Status:** Ready for Implementation  
**Target Team:** Senior Development Team

---

## TABLE OF CONTENTS

1. [High-Level Architecture](#1-high-level-architecture)
2. [Backend Architecture](#2-backend-architecture)
3. [Database Schema](#3-database-schema)
4. [Authentication System](#4-authentication-system)
5. [REST API Design](#5-rest-api-design)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Deployment & Environment Setup](#8-deployment--environment-setup)

---

## 1. HIGH-LEVEL ARCHITECTURE

### 1.1 System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                               │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ React SPA (Vite) - TypeScript/JSX                           │  │
│  │ - Components (Presentational, Container, Smart)             │  │
│  │ - Pages (Routing via React Router)                          │  │
│  │ - API Service Layer (Axios Interceptors)                    │  │
│  │ - State Management (Context API + useReducer/useState)      │  │
│  │ - Authentication Handler                                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ REST API (JSON)
                               │ HTTPS
┌──────────────────────────────▼──────────────────────────────────────┐
│                    API GATEWAY / Load Balancer                      │
│                    (Nginx / Application Load Balancer)              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────────┐
│                      APPLICATION SERVER LAYER                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Django REST Framework (DRF)                                 │  │
│  │ ┌────────────────────────────────────────────────────────┐  │  │
│  │ │ Controllers (ViewSets/APIViews)                       │  │  │
│  │ │ - AuthController      - PropertyController            │  │  │
│  │ │ - UserController      - VisitRequestController        │  │  │
│  │ │ - ProfileController   - ReviewController             │  │  │
│  │ ├────────────────────────────────────────────────────────┤  │  │
│  │ │ Business Logic Layer (Services)                       │  │  │
│  │ │ - AuthService         - PropertyService               │  │  │
│  │ │ - UserService         - VisitRequestService           │  │  │
│  │ │ - ProfileService      - ReviewService                 │  │  │
│  │ ├────────────────────────────────────────────────────────┤  │  │
│  │ │ Data Access Layer (Repositories)                      │  │  │
│  │ │ - UserRepository      - PropertyRepository            │  │  │
│  │ │ - ProfileRepository   - VisitRequestRepository        │  │  │
│  │ │ - ReviewRepository                                    │  │  │
│  │ ├────────────────────────────────────────────────────────┤  │  │
│  │ │ Middleware & Decorators                               │  │  │
│  │ │ - Authentication (JWT)                                │  │  │
│  │ │ - Permission/Ownership Validation                     │  │  │
│  │ │ - Input Validation (Serializers)                      │  │  │
│  │ │ - Error Handling                                      │  │  │
│  │ └────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼─────────┐  ┌────────▼──────────┐  ┌──────▼──────────┐
│  PostgreSQL DB  │  │  File Storage     │  │  Redis Cache    │
│  (Relational)   │  │  (S3/Azure/Local) │  │  (Optional)     │
│                 │  │                   │  │                 │
│ - Users         │  │ - Property Images │  │ - Tokens        │
│ - Profiles      │  │ - Media Files     │  │ - Session Data  │
│ - Properties    │  │                   │  │ - Cached Queries│
│ - Reviews       │  │                   │  │                 │
│ - VisitRequests │  │                   │  │                 │
└─────────────────┘  └───────────────────┘  └─────────────────┘
```

### 1.2 Technology Stack Recommendation

#### **Backend (Server)**
| Component | Technology | Justification |
|-----------|-----------|---|
| Framework | Django 6.0+ with Django REST Framework (DRF) | Enterprise-grade, battle-tested, built-in admin, ORM handles complex queries |
| Language | Python 3.11+ | Rapid development, excellent ecosystem, maintainability |
| Authentication | JWT (djangorestframework-simplejwt) | Stateless, scalable, industry standard for SPAs |
| Serialization | DRF Serializers | Built-in validation, automatic schema generation |
| Async Support | Django 4.1+ async views (optional) | Future scalability without rewrite |

#### **Database**
| Component | Technology | Justification |
|-----------|-----------|---|
| Primary | PostgreSQL 14+ | ACID compliance, advanced indexing, JSON support, proven reliability |
| ORM | Django ORM | Migrations built-in, relationship management, prevents SQL injection |
| Caching | Redis (optional, Phase 2) | Token blacklisting, session cache, query caching |

#### **Frontend (Client)**
| Component | Technology | Justification |
|-----------|-----------|---|
| Framework | React 18+ (Vite) | Component reusability, ecosystem maturity, performance |
| Language | TypeScript | Type safety, IDE support, reduced runtime errors |
| Build Tool | Vite | Fast development loop, smaller bundle sizes |
| HTTP Client | Axios | Interceptor support, automatic token refresh, error handling |
| State Management | React Context API + useReducer | No external dependency for simple state, hooks-based |
| Routing | React Router v6 | Standard, flexible, nested routes support |
| Styling | Tailwind CSS | Utility-first, rapid development, consistent design system |
| Form Handling | React Hook Form | Minimal re-renders, validation integration |

#### **Infrastructure & Deployment**
| Component | Technology | Justification |
|-----------|-----------|---|
| Web Server | Nginx (reverse proxy) | High performance, lightweight, SSL termination |
| Application Server | Gunicorn (with Uvicorn for async) | Production-grade, can scale horizontally |
| Containerization | Docker + Docker Compose | Environment consistency, easy deployment |
| Orchestration | Kubernetes (Phase 2) or AWS ECS | Horizontal scaling, self-healing, load balancing |
| Cloud Platform | AWS / Azure / GCP | Global presence, managed databases, CDN |
| CI/CD | GitHub Actions / GitLab CI | Pipeline automation, code quality gates |
| Media Storage | AWS S3 / Azure Blob | Scalable, CDN integrated, cost-effective |

### 1.3 Architecture Principles

1. **Separation of Concerns**: Each layer (presentation, business logic, data access) has distinct responsibilities
2. **Stateless Backend**: No session state on server (except optional Redis), all state in JWT tokens
3. **Ownership-First Validation**: All mutations validate user ownership before execution
4. **API-First Development**: Frontend consumes only REST APIs, no direct database access
5. **Fail-Secure**: All endpoints default to denying access, then explicitly grant permissions
6. **Pagination by Default**: All list endpoints paginate to prevent performance degradation
7. **Immutable Core**: Once created, core data (User, Property, Review) has audit trails for changes

### 1.4 Scalability Considerations

**Vertical Scalability:**
- Django handles 10k-50k requests/sec per instance with proper configuration
- PostgreSQL can scale to 100k+ connections with connection pooling (PgBouncer)
- Redis can handle 50k+ ops/sec per instance

**Horizontal Scalability:**
- Stateless backend allows N instances behind load balancer
- Database replication: Primary + Read Replicas for query scaling
- Cache layer (Redis) for token and session data
- CDN for static assets and media

**Query Optimization:**
- Strategic indexing on frequently queried fields (email, location, agent_id)
- Database query optimization and query analysis
- Result pagination with limit/offset (configurable 10-100 items per page)
- Denormalization of frequently accessed data (avg_rating on Profile)

**Future Scaling (Phase 2):**
- Elasticsearch for full-text property search
- Message queue (Celery + RabbitMQ) for async operations
- Microservices decomposition: Auth service, Property service, Review service

---

## 2. BACKEND ARCHITECTURE

### 2.1 Project Structure

```
backend/
├── manage.py                          # Django management script
├── requirements.txt                   # Python dependencies
├── .env                              # Environment variables (not in git)
├── .env.example                      # Template for .env
├── wsgi.py                           # WSGI entry point
├── asgi.py                           # ASGI entry point (async)
│
├── backend/                          # Django project settings
│   ├── __init__.py
│   ├── settings/                     # Settings management
│   │   ├── __init__.py
│   │   ├── base.py                   # Common settings
│   │   ├── development.py            # Dev-specific
│   │   ├── production.py             # Production-specific
│   │   ├── testing.py                # Test-specific
│   ├── urls.py                       # Root URL routing
│   ├── wsgi.py
│   └── asgi.py
│
├── apps/                             # Django applications
│   ├── __init__.py
│   │
│   ├── accounts/                     # Authentication & User Management
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── models.py                 # User, CustomUserManager
│   │   ├── serializers.py            # UserSerializer, LoginSerializer
│   │   ├── views.py                  # RegisterView, LoginView, LogoutView
│   │   ├── urls.py
│   │   ├── services.py               # AuthService, TokenService
│   │   ├── permissions.py            # IsAuthenticated, IsOwner
│   │   ├── authentication.py         # JWT authentication class
│   │   ├── utils.py                  # Token generation, validation
│   │   └── tests.py
│   │
│   ├── profiles/                     # User Profiles & Agents
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── models.py                 # Profile, Agent
│   │   ├── serializers.py            # ProfileSerializer, AgentSerializer
│   │   ├── views.py                  # ProfileViewSet, AgentViewSet
│   │   ├── urls.py
│   │   ├── services.py               # ProfileService
│   │   ├── filters.py                # Location-based filtering
│   │   └── tests.py
│   │
│   ├── properties/                   # Property Management
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── models.py                 # Property, PropertyImage, PropertyFeature
│   │   ├── serializers.py            # PropertySerializer, ImageSerializer
│   │   ├── views.py                  # PropertyViewSet
│   │   ├── urls.py
│   │   ├── services.py               # PropertyService, SearchService
│   │   ├── filters.py                # PropertyFilter
│   │   ├── permissions.py            # IsPropertyOwner
│   │   ├── slug.py                   # Slug generation utilities
│   │   └── tests.py
│   │
│   ├── reviews/                      # Reviews & Ratings
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── models.py                 # Review
│   │   ├── serializers.py            # ReviewSerializer
│   │   ├── views.py                  # ReviewViewSet
│   │   ├── urls.py
│   │   ├── services.py               # ReviewService
│   │   ├── permissions.py            # IsReviewAuthor
│   │   ├── validators.py             # One-review-per-user validation
│   │   └── tests.py
│   │
│   ├── visits/                       # Visit Requests
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── models.py                 # VisitRequest
│   │   ├── serializers.py            # VisitRequestSerializer
│   │   ├── views.py                  # VisitRequestViewSet
│   │   ├── urls.py
│   │   ├── services.py               # VisitRequestService
│   │   ├── permissions.py            # IsAgentForRequest
│   │   ├── validators.py             # Property ownership validation
│   │   └── tests.py
│   │
│   └── common/                       # Shared utilities
│       ├── __init__.py
│       ├── models.py                 # BaseModel, timestamps
│       ├── pagination.py             # StandardPagination, LargePagination
│       ├── responses.py              # StandardResponse, error formats
│       ├── exceptions.py             # CustomAPIException, error codes
│       ├── validators.py             # Common validators
│       ├── decorators.py             # Custom decorators
│       ├── constants.py              # Enums, status codes
│       ├── utils.py                  # Helper functions
│       ├── middleware.py             # Error handling middleware
│       └── tests.py
│
├── media/                            # User-uploaded files (development)
│   └── property_images/
│
├── static/                           # Static files (if any)
│
└── logs/                             # Application logs
```

### 2.2 Layered Architecture Details

#### **Layer 1: API/Views (Controllers)**

**Responsibility:** HTTP request handling, routing, response formatting

```python
# Example: accounts/views.py structure

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  # Calls service internally
            tokens = TokenService.generate_tokens(user)
            return Response({
                'message': 'User created successfully',
                'user': UserSerializer(user).data,
                'tokens': tokens
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def retrieve(self, request, pk=None):
        # GET /api/profiles/{id}/
        profile = self.get_object()
        self.check_object_permissions(request, profile)
        return Response(ProfileSerializer(profile).data)
    
    def update(self, request, pk=None):
        # PUT/PATCH /api/profiles/{id}/
        profile = self.get_object()
        self.check_object_permissions(request, profile)  # Ownership check
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            profile = ProfileService.update_profile(profile, serializer.validated_data)
            return Response(ProfileSerializer(profile).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def search_agents(self, request):
        # GET /api/profiles/search_agents/?location=San+Francisco&page=1
        filters = AgentFilter(request.query_params, queryset=Profile.objects.filter(is_agent=True))
        paginated = self.paginate_queryset(filters.qs)
        serializer = ProfileSerializer(paginated, many=True)
        return self.get_paginated_response(serializer.data)
```

#### **Layer 2: Services (Business Logic)**

**Responsibility:** Business rule enforcement, data transformation, cross-entity logic

```python
# Example: accounts/services.py

class AuthService:
    @staticmethod
    def register_user(email, username, password, password_confirm):
        """Handles user registration with validation"""
        if password != password_confirm:
            raise ValidationError('Passwords do not match')
        if User.objects.filter(email=email).exists():
            raise ValidationError('Email already registered')
        
        user = User.objects.create_user(
            email=email,
            username=username,
            password=password
        )
        Profile.objects.create(user=user)  # Auto-create profile
        return user
    
    @staticmethod
    def authenticate_user(email, password):
        """Handles login authentication"""
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed('Invalid credentials')
        
        if not user.check_password(password):
            raise AuthenticationFailed('Invalid credentials')
        
        if not user.is_active:
            raise AuthenticationFailed('Account disabled')
        
        return user

class TokenService:
    @staticmethod
    def generate_tokens(user):
        """Generate JWT access and refresh tokens"""
        payload = {
            'user_id': user.id,
            'email': user.email,
            'username': user.username,
            'is_agent': user.profile.is_agent,
            'is_admin': user.is_staff,
            'exp': timezone.now() + timedelta(hours=1),
            'iat': timezone.now()
        }
        access_token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
        
        refresh_payload = {
            'user_id': user.id,
            'exp': timezone.now() + timedelta(days=7),
            'iat': timezone.now()
        }
        refresh_token = jwt.encode(refresh_payload, REFRESH_SECRET_KEY, algorithm='HS256')
        
        return {
            'access': access_token,
            'refresh': refresh_token,
            'expires_in': 3600
        }

class PropertyService:
    @staticmethod
    def create_property(user, data):
        """Create property with ownership validation"""
        if not user.profile.is_agent:
            raise PermissionDenied('Only agents can create properties')
        
        property_obj = Property.objects.create(
            agent=user.profile,
            title=data['title'],
            description=data['description'],
            price=data['price'],
            property_type=data['property_type'],
            status=data.get('status', 'sale'),
            address=data['address'],
            slug=PropertySlugService.generate_unique_slug(data['title'])
        )
        return property_obj
    
    @staticmethod
    def search_properties(filters, page=1, page_size=20):
        """Search with filters and pagination"""
        queryset = Property.objects.all()
        
        # Apply filters
        if 'property_type' in filters:
            queryset = queryset.filter(property_type=filters['property_type'])
        if 'price_min' in filters and 'price_max' in filters:
            queryset = queryset.filter(
                price__gte=filters['price_min'],
                price__lte=filters['price_max']
            )
        if 'location' in filters:
            queryset = queryset.filter(address__icontains=filters['location'])
        
        # Pagination
        paginator = Paginator(queryset, page_size)
        return paginator.get_page(page)

class ReviewService:
    @staticmethod
    def create_or_update_review(reviewer, agent_profile, rating, comment=None):
        """Enforce one-review-per-user-per-agent rule"""
        # Check if review already exists
        review, created = Review.objects.update_or_create(
            reviewer=reviewer,
            agent_profile=agent_profile,
            defaults={
                'rating': rating,
                'comment': comment
            }
        )
        
        # Update profile average rating (denormalized)
        ReviewService.update_agent_average_rating(agent_profile)
        
        return review, created
    
    @staticmethod
    def update_agent_average_rating(agent_profile):
        """Recalculate and store average rating"""
        avg_rating = agent_profile.reviews.aggregate(
            avg=models.Avg('rating')
        )['avg'] or 0
        agent_profile.average_rating = avg_rating
        agent_profile.save(update_fields=['average_rating'])

class VisitRequestService:
    @staticmethod
    def create_visit_request(user, property_id, agent_id, preferred_date, contact_details):
        """Validate property-agent ownership before creating request"""
        try:
            property_obj = Property.objects.get(id=property_id)
            agent_profile = Profile.objects.get(id=agent_id, is_agent=True)
        except (Property.DoesNotExist, Profile.DoesNotExist):
            raise ValidationError('Invalid property or agent')
        
        # CRITICAL: Verify property belongs to agent
        if property_obj.agent_id != agent_profile.id:
            raise ValidationError('Property does not belong to this agent')
        
        visit_request = VisitRequest.objects.create(
            user=user,
            property=property_obj,
            agent=agent_profile,
            preferred_date=preferred_date,
            contact_phone=contact_details.get('phone'),
            contact_email=contact_details.get('email'),
            status='pending'
        )
        return visit_request
```

#### **Layer 3: Serializers (Data Validation)**

**Responsibility:** Input/output validation, schema definition, data transformation

```python
# Example: accounts/serializers.py

from rest_framework import serializers

class UserRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already registered')
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Username already taken')
        return value
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError('Passwords do not match')
        return data
    
    def create(self, validated_data):
        user = AuthService.register_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            password_confirm=validated_data['password_confirm']
        )
        return user

class ProfileSerializer(serializers.ModelSerializer):
    reviews_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = ['id', 'user_id', 'bio', 'phone', 'address', 'city', 
                  'state', 'zip_code', 'is_agent', 'average_rating', 
                  'reviews_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user_id', 'average_rating', 'created_at', 'updated_at']
    
    def get_reviews_count(self, obj):
        return obj.reviews.count() if obj.is_agent else 0
    
    def validate_phone(self, value):
        if not value.startswith('+') or len(value) < 10:
            raise serializers.ValidationError('Invalid phone format')
        return value
```

#### **Layer 4: Models (Data Layer)**

**Responsibility:** Data structure, database schema, relationships, validation rules

```python
# Example: accounts/models.py - See Section 3 for full schema

class BaseModel(models.Model):
    """Abstract base model with timestamps"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True

class User(AbstractUser):
    email = models.EmailField(unique=True, db_index=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
        ]

class Profile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255, blank=True, db_index=True)
    city = models.CharField(max_length=100, blank=True, db_index=True)
    state = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    is_agent = models.BooleanField(default=False, db_index=True)
    average_rating = models.FloatField(default=0.0)
    
    class Meta:
        db_table = 'profiles'
        indexes = [
            models.Index(fields=['is_agent']),
            models.Index(fields=['city', 'is_agent']),
        ]
```

#### **Layer 5: Permissions & Middleware**

**Responsibility:** Access control, ownership validation, error handling

```python
# Example: common/permissions.py

from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied

class IsAuthenticated(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

class IsOwner(BasePermission):
    """Verify user owns the resource"""
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        return False

class IsPropertyOwner(BasePermission):
    """Only agent who created property can modify it"""
    def has_object_permission(self, request, view, obj):
        # obj is Property
        return obj.agent.user == request.user or request.user.is_staff

class IsAgentForRequest(BasePermission):
    """Only assigned agent can view/manage visit request"""
    def has_object_permission(self, request, view, obj):
        # obj is VisitRequest
        return obj.agent.user == request.user or request.user.is_staff

class IsReviewAuthor(BasePermission):
    """Only review author can modify it"""
    def has_object_permission(self, request, view, obj):
        # obj is Review
        return obj.reviewer == request.user or request.user.is_staff

# Example: common/middleware.py

class ErrorHandlingMiddleware:
    """Centralized error handling"""
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        try:
            response = self.get_response(request)
        except AuthenticationFailed as e:
            return JsonResponse({'error': str(e)}, status=401)
        except PermissionDenied as e:
            return JsonResponse({'error': str(e)}, status=403)
        except ValidationError as e:
            return JsonResponse({'error': str(e)}, status=400)
        except Exception as e:
            logger.error(f"Unhandled exception: {str(e)}")
            return JsonResponse({'error': 'Internal server error'}, status=500)
        
        return response
```

### 2.3 API Request/Response Flow Example

```
REQUEST FLOW:
1. Frontend sends: POST /api/properties/
   Headers: Authorization: Bearer {access_token}
   Body: { title, description, price, ... }

2. Django URL Router → PropertyViewSet.create()

3. APIView calls:
   - JWTAuthentication.authenticate() → Validates token, sets request.user
   - IsAuthenticated.has_permission() → Checks if user exists
   - PropertySerializer.is_valid() → Validates input data

4. ViewSet calls PropertyService.create_property(request.user, validated_data)

5. Service layer:
   - Checks if user.profile.is_agent
   - Generates unique slug
   - Creates Property model instance
   - Triggers signals (if any)

6. Response:
   - Serializer formats response
   - Status 201 CREATED
   - Returns: { id, title, slug, agent, created_at, ... }

RESPONSE FORMAT:
{
  "status": "success",
  "data": {
    "id": 123,
    "title": "Beautiful House",
    "slug": "beautiful-house-456",
    "price": 500000,
    "property_type": "residential",
    "status": "sale",
    "address": "123 Main St",
    "agent": {
      "id": 5,
      "user": { "id": 1, "email": "agent@example.com" },
      "is_agent": true
    },
    "created_at": "2026-04-22T10:00:00Z",
    "updated_at": "2026-04-22T10:00:00Z"
  }
}
```

---

## 3. DATABASE SCHEMA

### 3.1 Entity Relationship Diagram (Textual)

```
┌─────────────┐         ┌──────────────┐
│   User      │◄───────►│   Profile    │
│  (1:1)      │         │              │
└─────────────┘         └──────────────┘
       │                       │
       │                       │ is_agent
       │                       │
       │                  ┌────▼─────────┐
       │                  │  Properties  │
       │◄─────────────────┤ (Many:One)   │
       │ reviewer    agent│              │
       │                  └────┬─────────┘
       │                       │
   ┌───┼─────────┐         ┌───▼────────────┐
   │   │         │         │                │
┌──▼───┐    ┌───▼──────┐   │ PropertyImages │
│Review│    │VisitReq  │   │ PropertyFeatur │
│(Many)│    │  (Many)  │   │ (Many)         │
└──────┘    └──────────┘   └────────────────┘
```

### 3.2 Detailed Schema Definition

#### **TABLE: users** (Django's User model extended)
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    
    -- Authentication
    email VARCHAR(254) UNIQUE NOT NULL,
    username VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,  -- Hashed via Django
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_superuser BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    date_joined TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP NULL,
    
    -- Denormalized for faster access
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);
```

#### **TABLE: profiles** (Extended user information + Agent flag)
```sql
CREATE TABLE profiles (
    id BIGSERIAL PRIMARY KEY,
    
    -- Foreign Keys
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Profile Information
    bio TEXT DEFAULT '',
    phone VARCHAR(20) DEFAULT '',
    
    -- Address Components (Indexed for location-based search)
    address VARCHAR(255) DEFAULT '',
    city VARCHAR(100) DEFAULT '',
    state VARCHAR(100) DEFAULT '',
    zip_code VARCHAR(20) DEFAULT '',
    
    -- Agent Information
    is_agent BOOLEAN DEFAULT FALSE,
    average_rating FLOAT DEFAULT 0.0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_is_agent ON profiles(is_agent);
CREATE INDEX idx_profiles_city_agent ON profiles(city, is_agent);  -- For agent search
CREATE INDEX idx_profiles_state_agent ON profiles(state, is_agent);
```

#### **TABLE: properties** (Property listings owned by agents)
```sql
CREATE TABLE properties (
    id BIGSERIAL PRIMARY KEY,
    
    -- Foreign Keys
    agent_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Identification
    slug VARCHAR(255) UNIQUE NOT NULL,  -- URL-friendly identifier
    
    -- Core Information
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Real Estate Details
    price DECIMAL(15, 2) NOT NULL,  -- Currency-agnostic
    property_type VARCHAR(50) NOT NULL,  -- residential, commercial, industrial, agricultural
    status VARCHAR(50) NOT NULL,  -- sale, rent, sold, rented
    
    -- Location (Indexed for filtering)
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    latitude FLOAT NULL,
    longitude FLOAT NULL,
    
    -- Flexible JSON data for extensibility
    attributes JSONB DEFAULT '{}',  -- e.g., { "bedrooms": 3, "bathrooms": 2, "sqft": 2000 }
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_properties_slug ON properties(slug);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_price ON properties(price);  -- For range queries
CREATE INDEX idx_properties_created_at ON properties(created_at);  -- For sorting
```

#### **TABLE: property_images** (Multiple images per property)
```sql
CREATE TABLE property_images (
    id BIGSERIAL PRIMARY KEY,
    
    -- Foreign Keys
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Image Data
    image_url VARCHAR(500) NOT NULL,  -- S3 URL or local path
    alt_text VARCHAR(255) DEFAULT '',
    is_primary BOOLEAN DEFAULT FALSE,  -- One per property marked as primary
    
    -- Order for gallery
    display_order SMALLINT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_property_images_property_id ON property_images(property_id);
CREATE INDEX idx_property_images_is_primary ON property_images(property_id, is_primary);
```

#### **TABLE: property_features** (Flexible key-value features)
```sql
CREATE TABLE property_features (
    id BIGSERIAL PRIMARY KEY,
    
    -- Foreign Keys
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Feature Data (Key-Value structure)
    feature_key VARCHAR(100) NOT NULL,
    feature_value VARCHAR(255) NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_property_features_property_id ON property_features(property_id);
CREATE INDEX idx_property_features_key ON property_features(feature_key);
CREATE UNIQUE INDEX idx_property_features_unique ON property_features(property_id, feature_key);
```

#### **TABLE: reviews** (User reviews on agent profiles)
```sql
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    
    -- Foreign Keys
    reviewer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_profile_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Review Data
    rating SMALLINT NOT NULL,  -- 1-5
    comment TEXT DEFAULT '',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Unique constraint: One review per user per agent
    UNIQUE (reviewer_id, agent_profile_id)
);

CREATE INDEX idx_reviews_agent_profile_id ON reviews(agent_profile_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

#### **TABLE: visit_requests** (Lead management - users requesting property visits)
```sql
CREATE TABLE visit_requests (
    id BIGSERIAL PRIMARY KEY,
    
    -- Foreign Keys
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    agent_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Request Information
    preferred_date DATE NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    contact_email VARCHAR(254) NOT NULL,
    message TEXT DEFAULT '',
    
    -- Status Tracking
    status VARCHAR(50) DEFAULT 'pending',  -- pending, reviewed, completed, cancelled
    is_reviewed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_visit_requests_agent_id ON visit_requests(agent_id);
CREATE INDEX idx_visit_requests_user_id ON visit_requests(user_id);
CREATE INDEX idx_visit_requests_property_id ON visit_requests(property_id);
CREATE INDEX idx_visit_requests_status ON visit_requests(status);
CREATE INDEX idx_visit_requests_created_at ON visit_requests(created_at);
```

### 3.3 Integrity Constraints & Business Rules

| Entity | Constraint | Enforcement | Business Rule |
|--------|-----------|-------------|---------------|
| User | UNIQUE(email) | Database + Application | Email uniqueness |
| User | NOT NULL(password) | Database | Required field |
| Profile | UNIQUE(user_id) | Database | One profile per user |
| Profile | FK user_id | Database | User must exist |
| Property | FK agent_id | Database | Agent must exist |
| Property | UNIQUE(slug) | Database | Slug uniqueness |
| PropertyImage | UNIQUE(property_id, is_primary) | Application | One primary image per property |
| PropertyFeature | UNIQUE(property_id, feature_key) | Database | No duplicate keys per property |
| Review | UNIQUE(reviewer_id, agent_profile_id) | Database | One review per user per agent |
| Review | rating BETWEEN 1 AND 5 | Application | Valid rating range |
| VisitRequest | FK property_id, FK agent_id | Application | Property must belong to agent |
| VisitRequest | NOT NULL(preferred_date) | Database | Date is required |

### 3.4 Query Optimization Strategy

#### **Indexing Strategy**
```sql
-- High-frequency queries
1. Get user by email (Authentication)
   Index: users(email) ✓

2. Get agent profiles by city
   Index: profiles(city, is_agent) ✓

3. Get properties by agent
   Index: properties(agent_id) ✓

4. Search properties by type and price
   Index: properties(property_type, price) ✓

5. Get visit requests for agent
   Index: visit_requests(agent_id, status) ✓

6. Get reviews for profile
   Index: reviews(agent_profile_id, rating) ✓
```

#### **Query Optimization Patterns**
```python
# Instead of:
# 1. Get all properties
# 2. Filter in Python
properties = Property.objects.all()
filtered = [p for p in properties if p.price <= 500000]

# Do this:
# Filter at database level with indexed fields
properties = Property.objects.filter(price__lte=500000).select_related('agent')

# N+1 Query Problem Prevention:
# ❌ WRONG
agents = Profile.objects.filter(is_agent=True)
for agent in agents:
    print(agent.user.email)  # Extra query per agent

# ✅ RIGHT
agents = Profile.objects.filter(is_agent=True).select_related('user')
```

### 3.5 Denormalization Strategy

**When to Denormalize:**
- `Profile.average_rating`: Recalculated when review is created/updated
- `Property` denormalization: `agent_id` stored for faster filtering

**Triggers/Signals (Django):**
```python
@receiver(post_save, sender=Review)
def update_agent_rating_on_review(sender, instance, **kwargs):
    ReviewService.update_agent_average_rating(instance.agent_profile)
```

---

## 4. AUTHENTICATION SYSTEM

### 4.1 Token Strategy

#### **Access Token**
```json
{
  "type": "access",
  "user_id": 1,
  "email": "user@example.com",
  "username": "john_doe",
  "is_agent": false,
  "is_admin": false,
  "exp": 1713883200,
  "iat": 1713879600,
  "iss": "relasto-api"
}
```

- **Expiration:** 1 hour (3600 seconds)
- **Usage:** Every API request (Authorization header)
- **Storage (Frontend):** Memory (NOT localStorage for XSS protection)
- **Refresh:** Automatic via refresh endpoint

#### **Refresh Token**
```json
{
  "type": "refresh",
  "user_id": 1,
  "exp": 1714484400,
  "iat": 1713879600,
  "iss": "relasto-api"
}
```

- **Expiration:** 7 days
- **Usage:** Only to get new access token
- **Storage (Frontend):** HttpOnly cookie (more secure) OR Secure cookie
- **Blacklisting:** Optional, via Redis for logout

### 4.2 Authentication Flow Sequence

```
REGISTRATION:
┌─────────────┐                      ┌─────────────┐
│   Client    │                      │   Server    │
└──────┬──────┘                      └─────┬───────┘
       │ POST /api/auth/register      │
       │ { email, username, password, │
       │   password_confirm }         │
       ├─────────────────────────────→│
       │                              │ 1. Validate input
       │                              │ 2. Check email uniqueness
       │                              │ 3. Hash password
       │                              │ 4. Create User & Profile
       │                              │ 5. Generate tokens
       │ 201 CREATED                  │
       │ { access, refresh, user }    │
       │◄─────────────────────────────┤
       │ Store tokens in memory       │
       │ Store refresh in cookie      │
       │ Redirect to dashboard        │


LOGIN:
┌─────────────┐                      ┌─────────────┐
│   Client    │                      │   Server    │
└──────┬──────┘                      └─────┬───────┘
       │ POST /api/auth/login         │
       │ { email, password }          │
       ├─────────────────────────────→│
       │                              │ 1. Find user by email
       │                              │ 2. Verify password
       │                              │ 3. Verify account active
       │                              │ 4. Generate tokens
       │ 200 OK                       │
       │ { access, refresh, user }    │
       │◄─────────────────────────────┤
       │ Store tokens in memory       │
       │ Store refresh in cookie      │
       │ Redirect to dashboard        │


API CALL with AUTO-REFRESH:
┌─────────────┐                      ┌─────────────┐
│   Client    │                      │   Server    │
└──────┬──────┘                      └─────┬───────┘
       │ GET /api/properties          │
       │ Authorization: Bearer {token}│
       ├─────────────────────────────→│
       │                              │ 1. Verify token signature
       │                              │ 2. Check expiration
       │                              │ [EXPIRED]
       │ 401 UNAUTHORIZED             │
       │ { error: "Token expired" }   │
       │◄─────────────────────────────┤
       │                              │
       │ POST /api/auth/refresh       │
       │ { refresh_token }            │
       ├─────────────────────────────→│
       │                              │ 1. Verify refresh token
       │                              │ 2. Generate new access
       │ 200 OK                       │
       │ { access, refresh }          │
       │◄─────────────────────────────┤
       │ Update tokens in memory      │
       │ Retry original request       │
       │ GET /api/properties          │
       │ Authorization: Bearer {token}│
       ├─────────────────────────────→│
       │                              │ 1. Verify token
       │                              │ 2. Process request
       │ 200 OK { properties }        │
       │◄─────────────────────────────┤


LOGOUT:
┌─────────────┐                      ┌─────────────┐
│   Client    │                      │   Server    │
└──────┬──────┘                      └─────┬───────┘
       │ POST /api/auth/logout        │
       │ { refresh_token }            │
       ├─────────────────────────────→│
       │                              │ 1. Add token to blacklist
       │                              │    (Redis, 7 days expiry)
       │ 200 OK                       │
       │ { message: "Logged out" }    │
       │◄─────────────────────────────┤
       │ Clear tokens from memory     │
       │ Delete refresh cookie        │
       │ Redirect to login            │
```

### 4.3 Token Payload Structure

```python
# Backend: generation in accounts/utils.py

def generate_access_token(user):
    """Generate JWT access token"""
    payload = {
        'type': 'access',
        'user_id': str(user.id),
        'email': user.email,
        'username': user.username,
        'is_agent': user.profile.is_agent,
        'is_admin': user.is_staff,
        'profile_id': str(user.profile.id),
        'exp': timezone.now() + timedelta(hours=1),
        'iat': timezone.now(),
        'iss': 'relasto-api'
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

def generate_refresh_token(user):
    """Generate JWT refresh token"""
    payload = {
        'type': 'refresh',
        'user_id': str(user.id),
        'exp': timezone.now() + timedelta(days=7),
        'iat': timezone.now(),
        'iss': 'relasto-api'
    }
    return jwt.encode(payload, settings.REFRESH_SECRET_KEY, algorithm='HS256')
```

### 4.4 Ownership Validation Middleware

```python
# apps/common/permissions.py

class OwnershipValidator:
    """Centralized ownership validation"""
    
    @staticmethod
    def validate_user_owns_profile(user, profile):
        """Ensure user owns the profile"""
        if profile.user_id != user.id:
            raise PermissionDenied('You do not have permission to access this profile')
    
    @staticmethod
    def validate_user_is_agent(user):
        """Ensure user is an agent"""
        if not user.profile.is_agent:
            raise PermissionDenied('Only agents can perform this action')
    
    @staticmethod
    def validate_agent_owns_property(agent_profile, property_obj):
        """Ensure agent owns the property"""
        if property_obj.agent_id != agent_profile.id:
            raise PermissionDenied('Property does not belong to this agent')
    
    @staticmethod
    def validate_user_owns_review(user, review):
        """Ensure user created the review"""
        if review.reviewer_id != user.id:
            raise PermissionDenied('You can only modify your own reviews')
    
    @staticmethod
    def validate_agent_has_request(agent_profile, visit_request):
        """Ensure visit request is for this agent"""
        if visit_request.agent_id != agent_profile.id:
            raise PermissionDenied('This visit request is not for you')
```

---

## 5. REST API DESIGN

### 5.1 Complete Endpoint Reference

#### **5.1.1 AUTHENTICATION ENDPOINTS**

| # | Method | Endpoint | Auth | Purpose | Status Code |
|---|--------|----------|------|---------|------------|
| 1 | POST | `/api/auth/register` | None | User registration | 201, 400 |
| 2 | POST | `/api/auth/login` | None | User login | 200, 401 |
| 3 | POST | `/api/auth/logout` | JWT | User logout | 200, 401 |
| 4 | POST | `/api/auth/refresh` | None | Refresh access token | 200, 401 |

**Endpoint 1: POST /api/auth/register**
```
Request:
{
  "email": "john@example.com",
  "username": "johndoe",
  "password": "SecurePassword123!",
  "password_confirm": "SecurePassword123!"
}

Validation:
- email: Valid format, unique
- username: 3-150 chars, unique, alphanumeric + underscore
- password: Min 8 chars, must contain uppercase, lowercase, number
- password_confirm: Exact match with password

Response 201:
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "username": "johndoe",
      "created_at": "2026-04-22T10:00:00Z"
    },
    "profile": {
      "id": 1,
      "is_agent": false,
      "created_at": "2026-04-22T10:00:00Z"
    },
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600
    }
  }
}

Response 400 (Validation Error):
{
  "status": "error",
  "errors": {
    "email": ["Email already registered"],
    "password": ["Password must contain uppercase, lowercase, and number"]
  }
}
```

**Endpoint 2: POST /api/auth/login**
```
Request:
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}

Response 200:
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "username": "johndoe",
      "profile": {
        "id": 1,
        "is_agent": false,
        "bio": "",
        "phone": "",
        "city": ""
      }
    },
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 3600
    }
  }
}

Response 401:
{
  "status": "error",
  "error": "Invalid credentials"
}
```

**Endpoint 3: POST /api/auth/logout**
```
Headers: Authorization: Bearer {access_token}

Request:
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response 200:
{
  "status": "success",
  "message": "Successfully logged out"
}

Response 401:
{
  "status": "error",
  "error": "Token invalid or expired"
}
```

**Endpoint 4: POST /api/auth/refresh**
```
Request:
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response 200:
{
  "status": "success",
  "data": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}

Response 401:
{
  "status": "error",
  "error": "Refresh token expired or invalid"
}
```

#### **5.1.2 USER & PROFILE ENDPOINTS**

| # | Method | Endpoint | Auth | Purpose | Status |
|---|--------|----------|------|---------|--------|
| 5 | GET | `/api/profiles/me` | JWT | Get current user's profile | 200, 401 |
| 6 | GET | `/api/profiles/{id}` | None | Get profile by ID | 200, 404 |
| 7 | PUT | `/api/profiles/{id}` | JWT | Update own profile | 200, 403, 404 |
| 8 | GET | `/api/profiles/search-agents` | None | Search agents by location | 200 |

**Endpoint 5: GET /api/profiles/me**
```
Headers: Authorization: Bearer {access_token}

Response 200:
{
  "status": "success",
  "data": {
    "id": 1,
    "user": {
      "id": 1,
      "email": "john@example.com",
      "username": "johndoe"
    },
    "bio": "Real estate expert",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip_code": "94105",
    "is_agent": true,
    "average_rating": 4.5,
    "reviews_count": 12,
    "created_at": "2026-04-22T10:00:00Z",
    "updated_at": "2026-04-22T10:00:00Z"
  }
}

Response 401:
{
  "status": "error",
  "error": "Unauthorized"
}
```

**Endpoint 7: PUT /api/profiles/{id}**
```
Headers: Authorization: Bearer {access_token}

Request:
{
  "bio": "Updated bio",
  "phone": "+1234567890",
  "address": "456 Oak Ave",
  "city": "New York",
  "state": "NY",
  "zip_code": "10001"
}

Validation:
- phone: Valid format if provided
- city: Max 100 chars
- state: Max 100 chars
- zip_code: Max 20 chars

Response 200:
{
  "status": "success",
  "data": {
    "id": 1,
    "bio": "Updated bio",
    "phone": "+1234567890",
    "address": "456 Oak Ave",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "is_agent": false,
    "average_rating": 0,
    "reviews_count": 0,
    "updated_at": "2026-04-22T10:30:00Z"
  }
}

Response 403:
{
  "status": "error",
  "error": "You cannot modify this profile"
}
```

**Endpoint 8: GET /api/profiles/search-agents**
```
Query Parameters:
  ?city=San Francisco
  &state=CA
  &page=1
  &page_size=20

Response 200:
{
  "status": "success",
  "data": [
    {
      "id": 5,
      "user": {
        "id": 2,
        "email": "agent@example.com",
        "username": "agent1"
      },
      "bio": "Top agent",
      "phone": "+9876543210",
      "city": "San Francisco",
      "state": "CA",
      "is_agent": true,
      "average_rating": 4.8,
      "reviews_count": 25
    }
  ],
  "pagination": {
    "total": 5,
    "count": 1,
    "page": 1,
    "page_size": 20,
    "total_pages": 1
  }
}
```

#### **5.1.3 PROPERTY ENDPOINTS**

| # | Method | Endpoint | Auth | Purpose | Status |
|---|--------|----------|------|---------|--------|
| 9 | POST | `/api/properties` | JWT | Create property (agents only) | 201, 403 |
| 10 | GET | `/api/properties` | None | List properties with filters | 200 |
| 11 | GET | `/api/properties/{id}` | None | Get property details | 200, 404 |
| 12 | PUT | `/api/properties/{id}` | JWT | Update property (owner only) | 200, 403, 404 |
| 13 | DELETE | `/api/properties/{id}` | JWT | Delete property (owner only) | 204, 403, 404 |
| 14 | POST | `/api/properties/{id}/images` | JWT | Upload property images | 201, 403, 404 |
| 15 | GET | `/api/properties/{id}/images` | None | Get property images | 200, 404 |

**Endpoint 9: POST /api/properties**
```
Headers: Authorization: Bearer {access_token}

Request:
{
  "title": "Beautiful 3-Bedroom House",
  "description": "Spacious house with garden",
  "price": 500000,
  "property_type": "residential",
  "status": "sale",
  "address": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "zip_code": "94105",
  "attributes": {
    "bedrooms": 3,
    "bathrooms": 2,
    "sqft": 2000,
    "year_built": 1995
  }
}

Validation:
- title: 5-255 chars, required
- description: Min 10 chars, required
- price: Positive number, required
- property_type: One of [residential, commercial, industrial, agricultural]
- status: One of [sale, rent, sold, rented]
- address: Required
- city: Required
- state: Required

Business Rules:
- Only agents can create properties
- Slug generated from title (unique)
- Agent ID set from authenticated user's profile

Response 201:
{
  "status": "success",
  "data": {
    "id": 42,
    "slug": "beautiful-3-bedroom-house-42",
    "title": "Beautiful 3-Bedroom House",
    "description": "Spacious house with garden",
    "price": 500000,
    "property_type": "residential",
    "status": "sale",
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip_code": "94105",
    "agent": {
      "id": 5,
      "user": {
        "id": 2,
        "email": "agent@example.com"
      },
      "is_agent": true
    },
    "attributes": {
      "bedrooms": 3,
      "bathrooms": 2,
      "sqft": 2000,
      "year_built": 1995
    },
    "created_at": "2026-04-22T10:00:00Z",
    "updated_at": "2026-04-22T10:00:00Z"
  }
}

Response 403:
{
  "status": "error",
  "error": "Only agents can create properties"
}
```

**Endpoint 10: GET /api/properties**
```
Query Parameters:
  ?property_type=residential
  &price_min=100000
  &price_max=1000000
  &city=San Francisco
  &status=sale
  &page=1
  &page_size=20
  &sort=-created_at  (- for descending)

Filtering Logic:
- property_type: Exact match
- price_min/max: Range query
- city: Partial match
- status: Exact match

Pagination:
- Default: 20 items per page
- Max: 100 items per page
- Offset: (page - 1) * page_size

Response 200:
{
  "status": "success",
  "data": [
    {
      "id": 42,
      "slug": "beautiful-3-bedroom-house-42",
      "title": "Beautiful 3-Bedroom House",
      "price": 500000,
      "property_type": "residential",
      "status": "sale",
      "city": "San Francisco",
      "agent": {
        "id": 5,
        "user": { "username": "agent1" }
      },
      "primary_image": {
        "id": 100,
        "image_url": "https://s3.../property_42_1.jpg"
      },
      "created_at": "2026-04-22T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 125,
    "count": 20,
    "page": 1,
    "page_size": 20,
    "total_pages": 7
  }
}
```

**Endpoint 11: GET /api/properties/{id}**
```
Response 200:
{
  "status": "success",
  "data": {
    "id": 42,
    "slug": "beautiful-3-bedroom-house-42",
    "title": "Beautiful 3-Bedroom House",
    "description": "Spacious house with garden",
    "price": 500000,
    "property_type": "residential",
    "status": "sale",
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip_code": "94105",
    "attributes": {
      "bedrooms": 3,
      "bathrooms": 2,
      "sqft": 2000
    },
    "agent": {
      "id": 5,
      "user": {
        "id": 2,
        "email": "agent@example.com",
        "username": "agent1"
      },
      "phone": "+9876543210",
      "bio": "Top agent",
      "average_rating": 4.8,
      "reviews_count": 25
    },
    "images": [
      {
        "id": 100,
        "image_url": "https://s3.../property_42_1.jpg",
        "alt_text": "Front view",
        "is_primary": true,
        "display_order": 0
      },
      {
        "id": 101,
        "image_url": "https://s3.../property_42_2.jpg",
        "alt_text": "Living room",
        "is_primary": false,
        "display_order": 1
      }
    ],
    "features": [
      { "feature_key": "pool", "feature_value": "yes" },
      { "feature_key": "garage", "feature_value": "2-car" }
    ],
    "created_at": "2026-04-22T10:00:00Z",
    "updated_at": "2026-04-22T10:00:00Z"
  }
}

Response 404:
{
  "status": "error",
  "error": "Property not found"
}
```

**Endpoint 12: PUT /api/properties/{id}**
```
Headers: Authorization: Bearer {access_token}

Request:
{
  "title": "Updated Title",
  "description": "Updated description",
  "price": 550000,
  "status": "rent",
  "attributes": {
    "bedrooms": 4
  }
}

Validation:
- Only owner (agent) can modify
- Slug is immutable
- Property-agent relationship is immutable

Response 200:
{
  "status": "success",
  "data": {
    "id": 42,
    "title": "Updated Title",
    "description": "Updated description",
    "price": 550000,
    "status": "rent",
    "updated_at": "2026-04-22T11:00:00Z"
  }
}

Response 403:
{
  "status": "error",
  "error": "You are not the owner of this property"
}
```

**Endpoint 14: POST /api/properties/{id}/images**
```
Headers: 
  Authorization: Bearer {access_token}
  Content-Type: multipart/form-data

Request:
- file: (image file, max 10MB)
- alt_text: (optional)
- is_primary: (optional, boolean)

Validation:
- File size: Max 10MB
- File type: jpeg, png, webp
- Only property owner can upload
- Max 20 images per property

Response 201:
{
  "status": "success",
  "data": {
    "id": 102,
    "property_id": 42,
    "image_url": "https://s3.../property_42_3.jpg",
    "alt_text": "Backyard",
    "is_primary": false,
    "display_order": 2,
    "created_at": "2026-04-22T11:00:00Z"
  }
}
```

#### **5.1.4 REVIEW ENDPOINTS**

| # | Method | Endpoint | Auth | Purpose | Status |
|---|--------|----------|------|---------|--------|
| 16 | POST | `/api/reviews` | JWT | Create/update review | 201, 200, 400 |
| 17 | GET | `/api/profiles/{agent_id}/reviews` | None | Get reviews for agent | 200 |
| 18 | GET | `/api/reviews/{id}` | None | Get review details | 200, 404 |
| 19 | DELETE | `/api/reviews/{id}` | JWT | Delete review (author only) | 204, 403, 404 |

**Endpoint 16: POST /api/reviews**
```
Headers: Authorization: Bearer {access_token}

Request:
{
  "agent_profile_id": 5,
  "rating": 5,
  "comment": "Excellent agent, very professional!"
}

Validation:
- agent_profile_id: Valid agent profile, required
- rating: 1-5, required
- comment: Optional, max 1000 chars

Business Rules:
- One review per user per agent (create or update)
- User cannot review themselves
- Only authenticated users can review

Response 201 (New Review):
{
  "status": "success",
  "data": {
    "id": 500,
    "reviewer": {
      "id": 1,
      "username": "john_doe"
    },
    "agent_profile": {
      "id": 5,
      "user": { "username": "agent1" }
    },
    "rating": 5,
    "comment": "Excellent agent, very professional!",
    "created_at": "2026-04-22T10:00:00Z"
  },
  "message": "Review created successfully"
}

Response 200 (Updated Existing Review):
{
  "status": "success",
  "data": {
    "id": 500,
    "rating": 5,
    "comment": "Updated comment",
    "updated_at": "2026-04-22T11:00:00Z"
  },
  "message": "Review updated successfully"
}

Response 400:
{
  "status": "error",
  "error": "You cannot review yourself"
}
```

**Endpoint 17: GET /api/profiles/{agent_id}/reviews**
```
Query Parameters:
  ?page=1
  &page_size=10

Response 200:
{
  "status": "success",
  "data": [
    {
      "id": 500,
      "reviewer": {
        "id": 1,
        "username": "john_doe"
      },
      "rating": 5,
      "comment": "Excellent agent!",
      "created_at": "2026-04-22T10:00:00Z",
      "updated_at": "2026-04-22T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "count": 10,
    "page": 1,
    "page_size": 10,
    "total_pages": 3
  }
}
```

#### **5.1.5 VISIT REQUEST ENDPOINTS**

| # | Method | Endpoint | Auth | Purpose | Status |
|---|--------|----------|------|---------|--------|
| 20 | POST | `/api/visit-requests` | JWT | Create visit request | 201, 400 |
| 21 | GET | `/api/visit-requests` | JWT | Get my visit requests | 200 |
| 22 | GET | `/api/visit-requests/{id}` | JWT | Get request details | 200, 404, 403 |
| 23 | PATCH | `/api/visit-requests/{id}` | JWT | Update request status (agent only) | 200, 403, 404 |

**Endpoint 20: POST /api/visit-requests**
```
Headers: Authorization: Bearer {access_token}

Request:
{
  "property_id": 42,
  "agent_id": 5,
  "preferred_date": "2026-05-15",
  "contact_phone": "+1234567890",
  "contact_email": "visitor@example.com",
  "message": "Interested in visiting"
}

Validation:
- property_id: Valid property, required
- agent_id: Valid agent, required
- preferred_date: Valid date (future), required
- contact_phone: Valid format, required
- contact_email: Valid email, required
- message: Max 1000 chars, optional

Business Rules:
- Property must belong to agent (CRITICAL)
- User cannot request visit for their own property
- Preferred date must be in future

Response 201:
{
  "status": "success",
  "data": {
    "id": 300,
    "user": {
      "id": 1,
      "email": "visitor@example.com",
      "username": "john_doe"
    },
    "property": {
      "id": 42,
      "slug": "beautiful-3-bedroom-house-42",
      "title": "Beautiful 3-Bedroom House"
    },
    "agent": {
      "id": 5,
      "user": { "username": "agent1" }
    },
    "preferred_date": "2026-05-15",
    "contact_phone": "+1234567890",
    "contact_email": "visitor@example.com",
    "message": "Interested in visiting",
    "status": "pending",
    "is_reviewed": false,
    "created_at": "2026-04-22T10:00:00Z"
  }
}

Response 400:
{
  "status": "error",
  "error": "Property does not belong to this agent"
}
```

**Endpoint 21: GET /api/visit-requests**
```
Headers: Authorization: Bearer {access_token}

Query Parameters (agent view):
  ?status=pending
  &page=1
  &page_size=20

Query Parameters (user view):
  Shows own requests only

Response 200 (Agent View - Their Requests):
{
  "status": "success",
  "data": [
    {
      "id": 300,
      "user": {
        "id": 1,
        "username": "john_doe",
        "contact_email": "visitor@example.com"
      },
      "property": {
        "id": 42,
        "title": "Beautiful 3-Bedroom House"
      },
      "preferred_date": "2026-05-15",
      "status": "pending",
      "is_reviewed": false,
      "created_at": "2026-04-22T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "count": 5,
    "page": 1
  }
}
```

**Endpoint 23: PATCH /api/visit-requests/{id}**
```
Headers: Authorization: Bearer {access_token}

Request (Agent Only):
{
  "status": "reviewed",
  "is_reviewed": true
}

Allowed Status Transitions:
- pending → reviewed
- pending → cancelled
- reviewed → completed
- reviewed → cancelled

Validation:
- Only agent assigned to request can update
- Status must be valid transition

Response 200:
{
  "status": "success",
  "data": {
    "id": 300,
    "status": "reviewed",
    "is_reviewed": true,
    "updated_at": "2026-04-22T11:00:00Z"
  }
}

Response 403:
{
  "status": "error",
  "error": "You are not the assigned agent for this request"
}
```

### 5.2 Error Handling & Response Format

#### **Standard Error Response**
```json
{
  "status": "error",
  "error": "Invalid request",
  "code": "VALIDATION_ERROR",
  "details": {
    "field_name": ["Error message"],
    "another_field": ["Error message 1", "Error message 2"]
  }
}
```

#### **Error Codes**
| Code | HTTP | Meaning |
|------|------|---------|
| VALIDATION_ERROR | 400 | Input validation failed |
| UNAUTHORIZED | 401 | Missing or invalid auth |
| FORBIDDEN | 403 | User lacks permission |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Business logic conflict |
| RATE_LIMIT | 429 | Too many requests |
| SERVER_ERROR | 500 | Unexpected error |

---

## 6. FRONTEND ARCHITECTURE

### 6.1 Technology Stack & Justification

```
Framework: React 19 with Vite
├── Why: Component reusability, mature ecosystem, excellent dev experience
├── Performance: Hot Module Replacement, minimal bundle size
└── Community: Largest React community, abundant libraries

Language: TypeScript (Recommended)
├── Why: Type safety, IDE support, catch errors at compile time
├── ROI: High (reduces bugs 15-30%)
└── Learning: Steep but worthwhile for team

HTTP Client: Axios
├── Why: Interceptor support, automatic token refresh capability
├── Alternative: fetch with custom wrapper
└── Features: Request/response transformation, timeout handling

State Management: React Context API + useReducer
├── Why: No external deps for simple state, hooks-based, sufficient for this scope
├── When to upgrade: Complex nested state → Redux/Zustand (Phase 2)
└── Why not Redux: Overkill for this project initially

Styling: Tailwind CSS
├── Why: Utility-first, rapid development, consistent design
├── Setup: Already installed (@tailwindcss/vite)
└── Design System: Create config-driven color/spacing system

Routing: React Router v6
├── Why: Standard, well-maintained, nested routing support
├── Features: Protected routes, lazy loading, history management
└── Status: Not yet installed (will add)

Form Handling: React Hook Form
├── Why: Minimal re-renders, easy validation integration
├── Alternative: Formik (heavier, but more features)
└── Status: Not yet installed (will add)

Testing: Vitest + React Testing Library
├── Why: Fast, compatible with Vite, React best practices
└── Status: Can add later (Phase 2)
```

### 6.2 Folder Structure (Scalable)

```
frontend/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── main.jsx                      # Entry point
│   ├── index.css                     # Global styles
│   ├── App.jsx                       # Root component
│   │
│   ├── config/                       # Configuration
│   │   ├── constants.ts              # App constants
│   │   ├── env.ts                    # Environment variables
│   │   └── api.config.ts             # API base URLs, timeouts
│   │
│   ├── services/                     # API & External Services
│   │   ├── api.client.ts             # Axios instance with interceptors
│   │   ├── auth.service.ts           # Auth API calls
│   │   ├── property.service.ts       # Property API calls
│   │   ├── profile.service.ts        # Profile API calls
│   │   ├── review.service.ts         # Review API calls
│   │   ├── visit.service.ts          # Visit request API calls
│   │   └── index.ts                  # Export all services
│   │
│   ├── utils/                        # Helper Functions
│   │   ├── formatters.ts             # Date, currency formatting
│   │   ├── validators.ts             # Input validation
│   │   ├── token.handler.ts          # Token storage/retrieval
│   │   ├── storage.ts                # localStorage utilities
│   │   └── index.ts
│   │
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useAuth.ts                # Authentication state & functions
│   │   ├── useForm.ts                # Form handling
│   │   ├── useFetch.ts               # Data fetching
│   │   ├── useLocalStorage.ts        # LocalStorage sync
│   │   ├── usePagination.ts          # Pagination logic
│   │   └── index.ts
│   │
│   ├── context/                      # React Context (State Management)
│   │   ├── AuthContext.jsx           # Auth state
│   │   ├── UserContext.jsx           # User data
│   │   ├── NotificationContext.jsx   # Notifications/toasts
│   │   └── index.ts
│   │
│   ├── pages/                        # Route Pages (Lazy Loaded)
│   │   ├── Home.jsx                  # Home / Landing
│   │   ├── Login.jsx                 # Login page
│   │   ├── Register.jsx              # Registration page
│   │   ├── Properties.jsx            # Property listings
│   │   ├── PropertyDetail.jsx        # Single property view
│   │   ├── Agents.jsx                # Agents directory
│   │   ├── AgentProfile.jsx          # Agent profile + reviews
│   │   ├── Dashboard/
│   │   │   ├── AgentDashboard.jsx    # Agent's dashboard
│   │   │   └── VisitRequests.jsx     # Manage visit requests
│   │   ├── AddProperty.jsx           # Create property (agent)
│   │   ├── NotFound.jsx              # 404 page
│   │   └── index.ts
│   │
│   ├── components/                   # Reusable Components
│   │   ├── Layout/
│   │   │   ├── Header.jsx            # Navigation bar
│   │   │   ├── Footer.jsx            # Footer
│   │   │   ├── Sidebar.jsx           # Side navigation
│   │   │   └── MainLayout.jsx        # Wrapper layout
│   │   │
│   │   ├── Auth/
│   │   │   ├── ProtectedRoute.jsx    # Route guard
│   │   │   ├── LoginForm.jsx         # Login form
│   │   │   └── RegisterForm.jsx      # Registration form
│   │   │
│   │   ├── Property/
│   │   │   ├── PropertyCard.jsx      # Property list item
│   │   │   ├── PropertyGrid.jsx      # Property grid view
│   │   │   ├── PropertyFilters.jsx   # Filter sidebar
│   │   │   ├── PropertyGallery.jsx   # Image gallery
│   │   │   ├── VisitRequestForm.jsx  # Request visit modal
│   │   │   └── PropertyForm.jsx      # Create/edit property
│   │   │
│   │   ├── Agent/
│   │   │   ├── AgentCard.jsx         # Agent list item
│   │   │   ├── AgentGrid.jsx         # Agent grid
│   │   │   ├── ReviewList.jsx        # Reviews list
│   │   │   └── ReviewForm.jsx        # Add/edit review
│   │   │
│   │   ├── Common/
│   │   │   ├── Button.jsx            # Reusable button
│   │   │   ├── Input.jsx             # Reusable input
│   │   │   ├── Modal.jsx             # Modal dialog
│   │   │   ├── Pagination.jsx        # Pagination controls
│   │   │   ├── Loading.jsx           # Loading spinner
│   │   │   ├── Alert.jsx             # Alert/notification
│   │   │   └── ErrorBoundary.jsx     # Error handling
│   │   │
│   │   └── index.ts                  # Export all components
│   │
│   ├── types/                        # TypeScript Type Definitions
│   │   ├── auth.types.ts             # Auth-related types
│   │   ├── property.types.ts         # Property types
│   │   ├── user.types.ts             # User types
│   │   ├── api.types.ts              # API response types
│   │   └── index.ts
│   │
│   ├── App.css                       # App styles
│   └── tailwind.config.js            # Tailwind config
│
├── index.html
├── vite.config.js
├── .env.example                      # Template for .env
├── .env                              # Environment variables (gitignored)
├── .eslintrc.json                    # ESLint config
├── package.json
└── README.md
```

### 6.3 Routing Architecture

```
├── / (Public)
│   ├── Home
│   ├── /properties (Search listing)
│   ├── /properties/:slug (Detail)
│   ├── /agents (Directory)
│   ├── /agents/:id (Profile)
│   ├── /auth/login
│   ├── /auth/register
│   └── /contact
│
├── /dashboard (Protected: Authenticated Users)
│   ├── /dashboard/profile
│   ├── /dashboard/profile/edit
│   │
│   ├── /dashboard/agent (Protected: Agents Only)
│   │   ├── /dashboard/agent/properties
│   │   ├── /dashboard/agent/properties/new
│   │   ├── /dashboard/agent/properties/:id/edit
│   │   ├── /dashboard/agent/requests (Visit requests)
│   │   └── /dashboard/agent/requests/:id
│   │
│   └── /dashboard/visits (Protected: Users)
│       └── My visit requests
│
└── /admin (Protected: Admin Only - Phase 2)
    ├── Users management
    ├── Properties management
    └── System settings
```

### 6.4 Authentication Flow Implementation

```javascript
// Frontend: Authentication Flow

// 1. CONTEXT SETUP (AuthContext.jsx)
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. INITIALIZE ON MOUNT
  useEffect(() => {
    const initializeAuth = async () => {
      const storedTokens = getStoredTokens(); // From localStorage
      if (storedTokens) {
        try {
          // Attempt to refresh token
          const newTokens = await authService.refreshToken(storedTokens.refresh);
          setTokens(newTokens);
          
          // Decode and set user
          const decoded = jwtDecode(newTokens.access);
          setUser(decoded);
        } catch (error) {
          // Token invalid, clear auth
          clearAuth();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setTokens(response.tokens);
    setUser(response.user);
    storeTokens(response.tokens);
    return response;
  };

  const logout = async () => {
    await authService.logout(tokens.refresh);
    clearAuth();
  };

  const clearAuth = () => {
    setTokens(null);
    setUser(null);
    removeStoredTokens();
  };

  return (
    <AuthContext.Provider value={{ user, tokens, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. CUSTOM HOOK
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// 4. API INTERCEPTOR (api.client.ts)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
});

// Request interceptor: Add token to every request
api.interceptors.request.use((config) => {
  const tokens = getStoredTokens();
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

// Response interceptor: Handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = getStoredTokens();
        if (tokens?.refresh) {
          // Try to refresh
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh/`,
            { refresh_token: tokens.refresh }
          );
          
          // Store new tokens
          storeTokens(response.data.data);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = 
            `Bearer ${response.data.data.access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/auth/login';
        clearAuth();
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// 5. PROTECTED ROUTE
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <Loading />;

  if (!user) {
    navigate('/auth/login', { replace: true });
    return null;
  }

  if (requiredRole === 'agent' && !user.is_agent) {
    return <Alert message="Only agents can access this page" />;
  }

  return children;
}

// 6. USAGE IN APP.jsx
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/auth/login" element={<Login />} />

          {/* Protected */}
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
```

### 6.5 UI Data Flow Examples

#### **Property Listing Page Flow**
```javascript
// Pages/Properties.jsx

function Properties() {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({
    property_type: '',
    price_min: '',
    price_max: '',
    city: '',
    page: 1,
  });
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. FETCH PROPERTIES
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await propertyService.searchProperties(filters);
      setProperties(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // 2. INITIAL LOAD & ON FILTER CHANGE
  useEffect(() => {
    fetchProperties();
  }, [filters, fetchProperties]);

  // 3. HANDLE FILTER CHANGE
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to page 1 on filter change
    }));
  };

  // 4. HANDLE PAGINATION
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
    window.scrollTo(0, 0); // Scroll to top
  };

  // 5. RENDER
  if (loading) return <Loading />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-1">
        <PropertyFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
      </div>
      <div className="col-span-3">
        <PropertyGrid properties={properties} />
        <Pagination 
          pagination={pagination} 
          onPageChange={handlePageChange} 
        />
      </div>
    </div>
  );
}
```

#### **Property Detail Page Flow**
```javascript
// Pages/PropertyDetail.jsx

function PropertyDetail() {
  const { slug } = useParams();
  const [property, setProperty] = useState(null);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const data = await propertyService.getPropertyBySlug(slug);
        setProperty(data);
      } catch (error) {
        console.error('Failed to load property', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [slug]);

  if (loading) return <Loading />;
  if (!property) return <NotFound />;

  const handleVisitRequest = async (formData) => {
    try {
      await visitService.createVisitRequest({
        property_id: property.id,
        agent_id: property.agent.id,
        ...formData,
      });
      setShowVisitModal(false);
      showNotification('Visit request submitted successfully!', 'success');
    } catch (error) {
      showNotification('Failed to submit request', 'error');
    }
  };

  return (
    <div>
      <PropertyGallery images={property.images} />
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <h1>{property.title}</h1>
          <p className="price">${property.price.toLocaleString()}</p>
          <p>{property.description}</p>
          <PropertyFeatures features={property.features} />
        </div>
        <div className="col-span-1">
          <AgentCard agent={property.agent} />
          <button onClick={() => setShowVisitModal(true)}>
            Request Visit
          </button>
        </div>
      </div>
      {showVisitModal && (
        <Modal onClose={() => setShowVisitModal(false)}>
          <VisitRequestForm 
            property={property} 
            onSubmit={handleVisitRequest} 
          />
        </Modal>
      )}
    </div>
  );
}
```

#### **Review Submission Flow**
```javascript
// Components/ReviewForm.jsx

function ReviewForm({ agentId, onSubmitSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await reviewService.createOrUpdateReview(agentId, formData);
      showNotification('Review submitted successfully!', 'success');
      setFormData({ rating: 5, comment: '' });
      onSubmitSuccess?.();
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to submit review');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error" message={error} />}
      
      <div>
        <label>Rating</label>
        <select 
          value={formData.rating}
          onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
        >
          <option value={1}>⭐ Poor</option>
          <option value={2}>⭐⭐ Fair</option>
          <option value={3}>⭐⭐⭐ Good</option>
          <option value={4}>⭐⭐⭐⭐ Very Good</option>
          <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
        </select>
      </div>

      <div>
        <label>Comment</label>
        <textarea
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          maxLength={1000}
          placeholder="Share your experience..."
        />
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
```

---

## 7. NON-FUNCTIONAL REQUIREMENTS

### 7.1 Security Implementation

#### **Frontend Security**
```javascript
// Token Storage Strategy (SECURE)
// ❌ DON'T use localStorage (vulnerable to XSS)
// ✅ DO use memory + httpOnly cookies

// Token Handler (utils/token.handler.ts)
class TokenHandler {
  // Store access token in memory (lost on refresh)
  private static accessToken = null;

  static setAccessToken(token) {
    this.accessToken = token;
  }

  static getAccessToken() {
    return this.accessToken;
  }

  // Store refresh token in httpOnly cookie (set by server)
  // Server sets: Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict
  // Frontend cannot access it, but automatically sent with requests
}

// Input Validation Example
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// XSS Prevention (Sanitize output)
import DOMPurify from 'dompurify';

function SafeHTML({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
}
```

#### **Backend Security**
```python
# settings/base.py

# 1. CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "https://relasto.com",
    "https://www.relasto.com",
]
CORS_ALLOW_CREDENTIALS = True  # For httpOnly cookies

# 2. CSRF Protection
CSRF_TRUSTED_ORIGINS = [
    "https://relasto.com",
    "https://www.relasto.com",
]

# 3. Security Headers
SECURE_SSL_REDIRECT = True  # In production
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 year

# 4. Password Validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', 'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# 5. Rate Limiting
RATELIMIT_ENABLE = True
RATELIMIT_USE_CACHE = 'default'
RATELIMIT_VIEW = '100/h'  # 100 requests per hour per IP

# 6. SQL Injection Prevention
# Django ORM parameterizes all queries by default
# NEVER use raw SQL with string concatenation
# ❌ WRONG: Property.objects.raw(f"SELECT * FROM properties WHERE id = {id}")
# ✅ RIGHT: Property.objects.get(id=id)

# 7. JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': os.environ.get('SECRET_KEY'),
    'AUTH_HEADER_TYPES': ('Bearer',),
}
```

### 7.2 Performance Optimization

#### **Database Query Optimization**
```python
# ❌ N+1 Query Problem
properties = Property.objects.all()
for prop in properties:
    print(prop.agent.user.email)  # Extra query per property!

# ✅ Solution: Use select_related for foreign keys
properties = Property.objects.select_related(
    'agent__user'  # Fetch agent and user in single query
).all()

# ✅ For reverse foreign keys: Use prefetch_related
agents = Profile.objects.filter(is_agent=True).prefetch_related(
    'reviews',  # Fetch reviews in separate optimized query
    'properties'
).all()

# Pagination Example
class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        return Response({
            'total': self.page.paginator.count,
            'count': len(data),
            'page': self.page.number,
            'page_size': self.page_size,
            'total_pages': self.page.paginator.num_pages,
            'results': data
        })
```

#### **API Response Optimization**
```python
# 1. Return only necessary fields
class PropertySummarySerializer(serializers.ModelSerializer):
    """Lightweight version for listings"""
    class Meta:
        model = Property
        fields = ['id', 'slug', 'title', 'price', 'city', 'primary_image']

class PropertyDetailSerializer(serializers.ModelSerializer):
    """Full version for detail page"""
    class Meta:
        model = Property
        fields = '__all__'

# 2. Use different serializers based on context
def get_serializer_class(self):
    if self.action == 'list':
        return PropertySummarySerializer
    return PropertyDetailSerializer

# 3. Implement field filtering
# GET /api/properties?fields=id,title,price
class DynamicFieldsSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        request = self.context.get('request')
        if request:
            fields = request.query_params.get('fields')
            if fields:
                allowed = set(fields.split(','))
                existing = set(self.fields.keys())
                for field_name in existing - allowed:
                    self.fields.pop(field_name)
```

#### **Frontend Performance**
```javascript
// 1. Code Splitting & Lazy Loading
const Home = lazy(() => import('./pages/Home'));
const Properties = lazy(() => import('./pages/Properties'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
}

// 2. Memoization to prevent unnecessary re-renders
const PropertyCard = memo(({ property, onClick }) => {
  return <div onClick={onClick}>{property.title}</div>;
}, (prevProps, nextProps) => {
  return prevProps.property.id === nextProps.property.id;
});

// 3. Image Optimization
function PropertyImage({ src, alt }) {
  return (
    <img 
      src={src} 
      alt={alt}
      loading="lazy"  // Native lazy loading
      srcSet={`${src}?w=400 400w, ${src}?w=800 800w`}
      sizes="(max-width: 600px) 100vw, 400px"
    />
  );
}

// 4. Debounce Search
import { debounce } from 'lodash-es';

function PropertySearch() {
  const handleSearch = useCallback(
    debounce((query) => {
      fetchProperties({ search: query });
    }, 300),  // Wait 300ms after user stops typing
    []
  );

  return (
    <input 
      onChange={(e) => handleSearch(e.target.value)} 
      placeholder="Search properties..."
    />
  );
}

// 5. Request Caching
class QueryCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value) {
    this.cache.set(key, { value, timestamp: Date.now() });
  }
}

const queryCache = new QueryCache();

async function useFetch(url) {
  const cached = queryCache.get(url);
  if (cached) return cached;

  const response = await fetch(url);
  const data = await response.json();
  queryCache.set(url, data);
  return data;
}
```

### 7.3 Caching Strategy

```
LAYER 1: Frontend Cache
├── HTTP Cache Headers (304 Not Modified)
├── Query Cache (5 min TTL)
└── Image Cache (browser native)

LAYER 2: API Response Cache (CDN)
├── Properties listing: 5 minutes
├── Agent profiles: 10 minutes
└── Static data: 1 hour

LAYER 3: Database Query Cache (Redis) - Optional Phase 2
├── User lookups: 1 hour
├── Agent searches: 30 minutes
└── Property filters: 5 minutes

LAYER 4: Database-level Optimization
├── Connection pooling
├── Read replicas for SELECT queries
└── Write master for INSERT/UPDATE
```

### 7.4 Rate Limiting

```python
# apps/common/decorators.py

from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='100/h')  # 100 requests per hour per IP
def public_api_view(request):
    pass

@ratelimit(key='user', rate='50/h')  # 50 requests per hour per user
def authenticated_api_view(request):
    pass

# In settings.py
RATELIMIT_SETTINGS = {
    # Auth endpoints
    'auth.login': '5/5m',           # 5 attempts per 5 minutes
    'auth.register': '3/10m',       # 3 registrations per 10 minutes
    
    # Property endpoints
    'property.create': '20/h',      # 20 properties per hour (agents)
    'property.search': '1000/h',    # 1000 searches per hour
    
    # Review endpoints
    'review.create': '50/h',        # 50 reviews per hour
    
    # Visit endpoints
    'visit.create': '100/h',        # 100 visit requests per hour
}
```

---

## 8. DEPLOYMENT & ENVIRONMENT SETUP

### 8.1 Environment Configuration

```bash
# .env (development)
DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production
DATABASE_URL=postgresql://user:password@localhost:5432/relasto_dev
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Redis (optional, Phase 2)
REDIS_URL=redis://localhost:6379/0

# Email (Phase 2)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# File Storage (development uses local, production uses S3)
DEFAULT_FILE_STORAGE=django.core.files.storage.FileSystemStorage
MEDIA_URL=/media/
MEDIA_ROOT=/app/media

# AWS S3 (production)
USE_S3=False
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
AWS_S3_REGION_NAME=us-east-1
```

```bash
# .env.production
DEBUG=False
SECRET_KEY=<generate-with: python -c 'import secrets; print(secrets.token_urlsafe(50))'>
DATABASE_URL=postgresql://user:password@rds-hostname:5432/relasto
ALLOWED_HOSTS=relasto.com,www.relasto.com
CORS_ALLOWED_ORIGINS=https://relasto.com,https://www.relasto.com

REDIS_URL=redis://redis-hostname:6379/0
DEFAULT_FILE_STORAGE=storages.backends.s3boto3.S3Boto3Storage
USE_S3=True
AWS_ACCESS_KEY_ID=<production-key>
AWS_SECRET_ACCESS_KEY=<production-secret>
AWS_STORAGE_BUCKET_NAME=relasto-prod-media
```

### 8.2 Containerization (Docker)

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y postgresql-client

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Run Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "--timeout", "120", "backend.wsgi:application"]
```

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine as builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: relasto_dev
      POSTGRES_USER: relasto_user
      POSTGRES_PASSWORD: relasto_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # Redis Cache (Optional)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # Django Backend
  backend:
    build: ./backend
    command: |
      sh -c "python manage.py migrate &&
             python manage.py runserver 0.0.0.0:8000"
    environment:
      - DEBUG=True
      - DATABASE_URL=postgresql://relasto_user:relasto_password@postgres:5432/relasto_dev
      - REDIS_URL=redis://redis:6379/0
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis

  # React Frontend
  frontend:
    build: ./frontend
    command: npm run dev
    environment:
      - VITE_API_URL=http://localhost:8000/api
    volumes:
      - ./frontend:/app
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 8.3 CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/test-and-deploy.yml
name: Test & Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Backend Tests
  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: test_relasto
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        working-directory: ./backend
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: Run migrations
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_relasto
        run: python manage.py migrate

      - name: Run tests
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/test_relasto
        run: python manage.py test

  # Frontend Tests
  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run linting
        working-directory: ./frontend
        run: npm run lint

      - name: Build
        working-directory: ./frontend
        run: npm run build

  # Deploy to Production (only on main branch)
  deploy:
    needs: [backend-test, frontend-test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to AWS ECS
        run: |
          # Update ECS service
          aws ecs update-service \
            --cluster relasto-prod \
            --service relasto-backend \
            --force-new-deployment \
            --region us-east-1

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

### 8.4 Database Setup & Migrations

```bash
# Initial setup
python manage.py makemigrations
python manage.py migrate

# Creating superuser
python manage.py createsuperuser

# Backup database
pg_dump relasto_dev > backup_$(date +%Y%m%d).sql

# Restore database
psql relasto_dev < backup_20260422.sql
```

### 8.5 Production Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│              Internet / CDN (CloudFront)             │
└─────────────────────┬───────────────────────────────┘
                      │
        ┌─────────────▼──────────────┐
        │  Application Load Balancer │
        │   (SSL/TLS Termination)    │
        └────┬────────────────┬──────┘
             │                │
    ┌────────▼────────┐  ┌───▼────────────┐
    │  Frontend (Nginx)│  │Backend (Gunicorn)
    │  Static + SPA    │  │  Django API
    │  [Multiple AZs]  │  │ [Multiple AZs]
    └────────┬────────┘  └───┬────────────┘
             │                │
        ┌────▼────────────────▼─────┐
        │  RDS PostgreSQL (Primary + │
        │  Read Replicas)            │
        │  Multi-AZ enabled          │
        │  Automated backups         │
        └────────────────────────────┘
             │
        ┌────▼────────────────────┐
        │  S3 (Media Storage)      │
        │  - Property images       │
        │  - CloudFront integration │
        └──────────────────────────┘
```

**Recommended Cloud Setup: AWS**
- **Compute:** ECS with Auto Scaling, minimum 2 instances backend
- **Database:** RDS PostgreSQL Multi-AZ, db.t4g.medium minimum
- **Storage:** S3 with CloudFront CDN
- **Caching:** ElastiCache Redis (optional)
- **Monitoring:** CloudWatch + AWS X-Ray
- **Logging:** ELK Stack or CloudWatch Logs

---

## SUMMARY & NEXT STEPS

### Key Architectural Decisions Made:
1. **Layered Architecture:** Clear separation (Views → Services → Repositories → Models)
2. **Stateless Backend:** JWT-based, scalable horizontally
3. **Database-First Validation:** All business rules enforced at API layer
4. **Pagination Standard:** All list endpoints paginated by default
5. **Ownership Validation:** Central permission layer ensures data isolation
6. **Comprehensive Error Handling:** Structured error responses with codes

### Implementation Priorities:
1. **Phase 1 (MVP):** Core CRUD, auth, pagination
2. **Phase 2 (Scaling):** Caching, async jobs, monitoring
3. **Phase 3 (Features):** Search optimization, notifications, admin dashboard

---

**End of Architecture Document**

