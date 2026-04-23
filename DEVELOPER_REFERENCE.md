# DEVELOPER REFERENCE: COMMON PATTERNS & CODE SNIPPETS

**Purpose:** Quick reference for implementing common patterns in Relasto  
**Audience:** Development team implementing from ARCHITECTURE.md

---

## TABLE OF CONTENTS

1. [Service Layer Pattern](#1-service-layer-pattern)
2. [Permission Checking Pattern](#2-permission-checking-pattern)
3. [Pagination Pattern](#3-pagination-pattern)
4. [Filtering & Search Pattern](#4-filtering--search-pattern)
5. [Error Handling Pattern](#5-error-handling-pattern)
6. [Signal/Event Pattern](#6-signalevent-pattern)
7. [Frontend API Integration](#7-frontend-api-integration)
8. [Frontend Form Handling](#8-frontend-form-handling)

---

## 1. SERVICE LAYER PATTERN

### What: Business Logic Encapsulation

```python
# apps/properties/services.py

from django.core.paginator import Paginator
from django.db import transaction
from rest_framework.exceptions import ValidationError, PermissionDenied

class PropertyService:
    """Encapsulates all property-related business logic"""
    
    @staticmethod
    def create_property(user, data):
        """
        Create a new property.
        
        Args:
            user: Authenticated user object
            data: Validated serializer data
            
        Returns:
            Property instance
            
        Raises:
            PermissionDenied: If user is not an agent
            ValidationError: If data invalid
        """
        # 1. Check authorization
        if not user.profile.is_agent:
            raise PermissionDenied('Only agents can create properties')
        
        # 2. Validate business rules
        if data['price'] <= 0:
            raise ValidationError({'price': 'Price must be positive'})
        
        # 3. Perform transaction
        with transaction.atomic():
            property_obj = Property.objects.create(
                agent=user.profile,
                title=data['title'],
                description=data['description'],
                price=data['price'],
                property_type=data['property_type'],
                status=data.get('status', 'sale'),
                address=data['address'],
                city=data['city'],
                state=data['state'],
                zip_code=data['zip_code'],
                slug=PropertySlugService.generate_unique_slug(data['title'])
            )
            
            # 4. Handle related objects
            if 'attributes' in data:
                property_obj.attributes = data['attributes']
                property_obj.save()
        
        return property_obj
    
    @staticmethod
    @transaction.atomic
    def update_property(property_obj, user, data):
        """Update property with ownership validation"""
        # 1. Check ownership
        if property_obj.agent.user != user:
            raise PermissionDenied('You cannot modify this property')
        
        # 2. Update allowed fields only
        allowed_fields = ['title', 'description', 'price', 'status', 'attributes']
        for field in allowed_fields:
            if field in data:
                setattr(property_obj, field, data[field])
        
        property_obj.save()
        return property_obj
    
    @staticmethod
    def search_properties(filters, page=1, page_size=20):
        """
        Search properties with filters and pagination.
        
        Args:
            filters: Dict with query parameters
            page: Page number (1-indexed)
            page_size: Items per page
            
        Returns:
            Dict with paginated results
        """
        queryset = Property.objects.all()
        
        # Apply filters
        if 'property_type' in filters:
            queryset = queryset.filter(property_type=filters['property_type'])
        
        if 'price_min' in filters and 'price_max' in filters:
            queryset = queryset.filter(
                price__gte=filters['price_min'],
                price__lte=filters['price_max']
            )
        
        if 'city' in filters:
            queryset = queryset.filter(city__icontains=filters['city'])
        
        if 'status' in filters:
            queryset = queryset.filter(status=filters['status'])
        
        # Optimize queries
        queryset = queryset.select_related(
            'agent__user'
        ).prefetch_related(
            'images',
            'features'
        )
        
        # Paginate
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        return {
            'total': paginator.count,
            'page': page,
            'page_size': page_size,
            'total_pages': paginator.num_pages,
            'results': page_obj.object_list
        }
```

---

## 2. PERMISSION CHECKING PATTERN

### What: Ownership Validation at Multiple Layers

```python
# apps/common/permissions.py

from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied

class OwnershipPermission(BasePermission):
    """Base permission for ownership-based access"""
    
    def get_owner_id(self, obj):
        """Override in subclass"""
        raise NotImplementedError
    
    def has_object_permission(self, request, view, obj):
        owner_id = self.get_owner_id(obj)
        return owner_id == request.user.id


class IsProfileOwner(OwnershipPermission):
    """Only user can access their own profile"""
    def get_owner_id(self, obj):
        return obj.user_id


class IsPropertyOwner(OwnershipPermission):
    """Only agent who created property can modify it"""
    def get_owner_id(self, obj):
        return obj.agent.user_id


class IsReviewAuthor(OwnershipPermission):
    """Only review author can modify it"""
    def get_owner_id(self, obj):
        return obj.reviewer_id


class IsAgentForVisitRequest(OwnershipPermission):
    """Only assigned agent can view/modify visit request"""
    def get_owner_id(self, obj):
        return obj.agent.user_id


# Usage in ViewSet:

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [IsAuthenticated, IsPropertyOwner]
    
    def retrieve(self, request, *args, **kwargs):
        """Public read access - no ownership check needed"""
        # Override permission_classes for retrieve only
        self.permission_classes = []
        return super().retrieve(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """PUT - requires ownership"""
        obj = self.get_object()
        self.check_object_permissions(request, obj)
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """DELETE - requires ownership"""
        obj = self.get_object()
        self.check_object_permissions(request, obj)
        return super().destroy(request, *args, **kwargs)
```

---

## 3. PAGINATION PATTERN

### What: Consistent Pagination Across All List Endpoints

```python
# apps/common/pagination.py

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class StandardPagination(PageNumberPagination):
    """Default pagination: 20 items per page, max 100"""
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    page_size_query_description = 'Number of results to return per page.'
    
    def get_paginated_response(self, data):
        """Custom response format"""
        return Response({
            'status': 'success',
            'data': data,
            'pagination': {
                'total': self.page.paginator.count,
                'count': len(data),
                'page': self.page.number,
                'page_size': self.page_size,
                'total_pages': self.page.paginator.num_pages,
                'has_next': self.page.has_next(),
                'has_previous': self.page.has_previous(),
            }
        })


class LargePagination(StandardPagination):
    """For large datasets: 100 items per page, max 500"""
    page_size = 100
    max_page_size = 500


# In ViewSet:

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    pagination_class = StandardPagination  # Automatically paginated
    
    def list(self, request, *args, **kwargs):
        """GET /api/properties/?page=1&page_size=20"""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
```

---

## 4. FILTERING & SEARCH PATTERN

### What: Reusable Filter Implementation

```python
# apps/properties/filters.py

import django_filters
from .models import Property

class PropertyFilter(django_filters.FilterSet):
    """Declarative filtering for properties"""
    
    # Exact matches
    property_type = django_filters.ChoiceFilter(
        choices=Property.PROPERTY_TYPE_CHOICES
    )
    status = django_filters.ChoiceFilter(
        choices=Property.STATUS_CHOICES
    )
    
    # Range queries
    price_min = django_filters.NumberFilter(
        field_name='price',
        lookup_expr='gte'
    )
    price_max = django_filters.NumberFilter(
        field_name='price',
        lookup_expr='lte'
    )
    
    # Text search
    city = django_filters.CharFilter(
        field_name='city',
        lookup_expr='icontains'
    )
    search = django_filters.CharFilter(
        method='filter_search'
    )
    
    # Ordering
    ordering = django_filters.OrderingFilter(
        fields=(
            ('created_at', 'newest'),
            ('price', 'price_asc'),
            ('-price', 'price_desc'),
        )
    )
    
    class Meta:
        model = Property
        fields = ['property_type', 'status', 'city']
    
    def filter_search(self, queryset, name, value):
        """Search across multiple fields"""
        return queryset.filter(
            Q(title__icontains=value) |
            Q(description__icontains=value) |
            Q(address__icontains=value)
        )


# In ViewSet:

class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    filterset_class = PropertyFilter
    filter_backends = [django_filters.DjangoFilterBackend, 
                       filters.SearchFilter,
                       filters.OrderingFilter]
    
    # GET /api/properties/?property_type=residential&price_min=100000&price_max=500000&city=San+Francisco&page=1
```

---

## 5. ERROR HANDLING PATTERN

### What: Consistent Error Response Format

```python
# apps/common/exceptions.py

from rest_framework.exceptions import APIException
from rest_framework import status

class ValidationErrorResponse(APIException):
    """Custom validation error"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Validation error'
    default_code = 'validation_error'


class OwnershipError(APIException):
    """Ownership validation failed"""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'You do not have permission to access this resource'
    default_code = 'ownership_error'


class BusinessLogicError(APIException):
    """Business rule violated"""
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Business rule violation'
    default_code = 'business_logic_error'


# apps/common/exception_handler.py

from rest_framework.views import exception_handler
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """Centralized exception handling"""
    
    # Log the exception
    logger.error(
        f"Exception in {context['view']}: {str(exc)}",
        exc_info=True,
        extra={'user': context['request'].user}
    )
    
    # Call default handler
    response = exception_handler(exc, context)
    
    if response is None:
        # Unhandled exception
        return Response({
            'status': 'error',
            'error': 'Internal server error',
            'code': 'INTERNAL_ERROR'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Format response
    if response.data.get('detail'):
        response.data = {
            'status': 'error',
            'error': str(response.data['detail']),
            'code': getattr(exc, 'default_code', 'ERROR')
        }
    
    return response


# In settings.py:

REST_FRAMEWORK = {
    'EXCEPTION_HANDLER': 'apps.common.exception_handler.custom_exception_handler'
}
```

---

## 6. SIGNAL/EVENT PATTERN

### What: Automated Side Effects (Django Signals)

```python
# apps/reviews/signals.py

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Review
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Review)
def update_agent_rating_on_review_save(sender, instance, created, **kwargs):
    """Update agent's average rating when review is created or updated"""
    try:
        instance.agent_profile.update_average_rating()
        logger.info(f"Updated rating for agent {instance.agent_profile.id}")
    except Exception as e:
        logger.error(f"Failed to update agent rating: {str(e)}")
        # Don't re-raise - don't block the signal


@receiver(post_delete, sender=Review)
def update_agent_rating_on_review_delete(sender, instance, **kwargs):
    """Update agent's average rating when review is deleted"""
    try:
        instance.agent_profile.update_average_rating()
        logger.info(f"Updated rating for agent {instance.agent_profile.id}")
    except Exception as e:
        logger.error(f"Failed to update agent rating: {str(e)}")


# In apps/__init__.py (or apps/reviews/apps.py):

from django.apps import AppConfig

class ReviewsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.reviews'
    
    def ready(self):
        """Import signals when app is ready"""
        import apps.reviews.signals  # noqa
```

---

## 7. FRONTEND API INTEGRATION

### What: Axios Service Layer with Auto-Refresh

```javascript
// src/services/api.client.ts

import axios, { AxiosError, AxiosResponse } from 'axios';
import { getStoredTokens, storeTokens, clearTokens } from '../utils/token.handler';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add token to every request
api.interceptors.request.use(
  (config) => {
    const tokens = getStoredTokens();
    if (tokens?.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  onSuccess: (token: string) => void;
  onError: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.onError(error);
    } else if (token) {
      prom.onSuccess(token);
    }
  });
  
  isRefreshing = false;
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request
        return new Promise((resolve, reject) => {
          failedQueue.push({
            onSuccess: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            onError: (err: Error) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = getStoredTokens();
        if (!tokens?.refresh) {
          throw new Error('No refresh token');
        }

        // Refresh token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh_token: tokens.refresh,
        });

        const newTokens = response.data.data;
        storeTokens(newTokens);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
        processQueue(null, newTokens.access);
        return api(originalRequest);
      } catch (err) {
        // Refresh failed - redirect to login
        clearTokens();
        window.location.href = '/auth/login';
        processQueue(new Error('Token refresh failed'), null);
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## 8. FRONTEND FORM HANDLING

### What: Form with Validation and API Integration

```javascript
// src/components/Property/PropertyForm.jsx

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import propertyService from '../../services/property.service';

export default function PropertyForm({ onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      price: '',
      property_type: 'residential',
      status: 'sale',
      address: '',
      city: '',
      state: '',
      zip_code: '',
    },
  });

  // Watch for price changes to validate
  const price = watch('price');

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Validate business rules
      if (!user?.is_agent) {
        throw new Error('Only agents can create properties');
      }

      // API call
      const response = await propertyService.createProperty(data);

      // Success feedback
      onSuccess?.(response);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(err.message || 'Failed to create property');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <Alert type="error" message={error} />}

      <div>
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          {...register('title', {
            required: 'Title is required',
            minLength: {
              value: 5,
              message: 'Title must be at least 5 characters',
            },
          })}
          placeholder="Beautiful House"
        />
        {errors.title && <span className="error">{errors.title.message}</span>}
      </div>

      <div>
        <label htmlFor="price">Price *</label>
        <input
          id="price"
          type="number"
          {...register('price', {
            required: 'Price is required',
            validate: (value) => {
              if (value <= 0) return 'Price must be positive';
              return true;
            },
          })}
          placeholder="500000"
        />
        {errors.price && <span className="error">{errors.price.message}</span>}
      </div>

      <div>
        <label htmlFor="property_type">Property Type *</label>
        <select id="property_type" {...register('property_type')}>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="industrial">Industrial</option>
          <option value="agricultural">Agricultural</option>
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Property'}
      </button>
    </form>
  );
}
```

---

## QUICK DECISION TREE

**Question: How do I implement X?**

| Scenario | Pattern | Reference |
|----------|---------|-----------|
| Check if user owns resource | Permission Class | [#2](#2-permission-checking-pattern) |
| Create/update with business logic | Service Layer | [#1](#1-service-layer-pattern) |
| Search & filter properties | FilterSet | [#4](#4-filtering--search-pattern) |
| List with page numbers | Pagination | [#3](#3-pagination-pattern) |
| Handle API errors consistently | Exception Handler | [#5](#5-error-handling-pattern) |
| Update related data automatically | Signals | [#6](#6-signalevent-pattern) |
| Call API from frontend | API Service | [#7](#7-frontend-api-integration) |
| Handle form submission | React Hook Form | [#8](#8-frontend-form-handling) |

---

**End of Developer Reference**

Reference: [ARCHITECTURE.md](./ARCHITECTURE.md)

