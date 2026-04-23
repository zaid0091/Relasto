from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Property, PropertyImage
from .serializers import (
    PropertySerializer,
    PropertyCreateSerializer,
    PropertyUpdateSerializer,
    PropertyListSerializer,
    PropertyImageSerializer
)
from .services import PropertyService
from apps.common.permissions import IsAgentUser, IsPropertyOwner


class PropertyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for property management
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['title', 'description', 'address', 'city', 'state']
    filterset_fields = ['property_type', 'status', 'city', 'state']
    ordering_fields = ['created_at', 'price', 'title']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return PropertyCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PropertyUpdateSerializer
        elif self.action == 'list':
            return PropertyListSerializer
        return PropertySerializer
    
    def get_queryset(self):
        """Get properties with optimizations"""
        return Property.objects.select_related(
            'agent__user'
        ).prefetch_related(
            'images',
            'features'
        )
    
    def list(self, request):
        """List properties with filters and pagination"""
        try:
            # Extract filters from query params
            filters = {}
            
            # Direct filter fields
            for field in ['property_type', 'status', 'city', 'state', 'agent_id']:
                if field in request.query_params:
                    filters[field] = request.query_params.get(field)
            
            # Range filters
            if 'price_min' in request.query_params:
                try:
                    filters['price_min'] = float(request.query_params.get('price_min'))
                except ValueError:
                    pass
            
            if 'price_max' in request.query_params:
                try:
                    filters['price_max'] = float(request.query_params.get('price_max'))
                except ValueError:
                    pass
            
            # Search term
            if 'search' in request.query_params:
                filters['search'] = request.query_params.get('search')
            
            # Ordering
            if 'ordering' in request.query_params:
                filters['ordering'] = request.query_params.get('ordering')
            
            # Pagination
            page = int(request.query_params.get('page', 1))
            page_size = min(int(request.query_params.get('page_size', 20)), 100)
            
            result = PropertyService.search_properties(filters, page, page_size)
            
            serializer = PropertyListSerializer(result['results'], many=True)
            
            return Response({
                'status': 'success',
                'data': {
                    'properties': serializer.data,
                    'pagination': {
                        'total': result['total'],
                        'page': result['page'],
                        'page_size': result['page_size'],
                        'total_pages': result['total_pages'],
                        'has_next': result['page'] < result['total_pages'],
                        'has_previous': result['page'] > 1
                    }
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'SEARCH_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, pk=None):
        """Get property by ID or slug"""
        try:
            # pk here can be either ID or slug
            # Try to get by slug first
            if pk:
                property_obj = PropertyService.get_property_by_slug(pk)
                if not property_obj:
                    # Try by ID
                    property_obj = PropertyService.get_property_by_id(pk)
            
            serializer = PropertySerializer(property_obj)
            return Response({
                'status': 'success',
                'data': {
                    'property': serializer.data
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'PROPERTY_NOT_FOUND'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def create(self, request):
        """Create new property (agents only)"""
        if not IsAgentUser().has_permission(request, self):
            return Response({
                'status': 'error',
                'error': 'Only agents can create properties',
                'code': 'PERMISSION_DENIED'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            serializer = PropertyCreateSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                property_obj = serializer.save()
                response_serializer = PropertySerializer(property_obj)
                return Response({
                    'status': 'success',
                    'message': 'Property created successfully',
                    'data': {
                        'property': response_serializer.data
                    }
                }, status=status.HTTP_201_CREATED)
            
            errors = serializer.errors
            for k, v in errors.items():
                first_error = v[0] if isinstance(v, list) else str(v)
                break
            else:
                first_error = 'Validation failed'
            return Response({
                'status': 'error',
                'error': str(first_error),
                'code': 'VALIDATION_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'PROPERTY_CREATE_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        """Update property (ownership validation)"""
        try:
            property_obj = PropertyService.validate_property_ownership(request.user, pk)
            serializer = PropertyUpdateSerializer(property_obj, data=request.data, partial=True)
            
            if serializer.is_valid():
                updated_property = PropertyService.update_property(property_obj, request.user, serializer.validated_data)
                response_serializer = PropertySerializer(updated_property)
                return Response({
                    'status': 'success',
                    'message': 'Property updated successfully',
                    'data': {
                        'property': response_serializer.data
                    }
                }, status=status.HTTP_200_OK)
            
            return Response({
                'status': 'error',
                'error': serializer.errors,
                'code': 'VALIDATION_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'PROPERTY_UPDATE_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def partial_update(self, request, pk=None):
        """Partially update property"""
        return self.update(request, pk)
    
    def destroy(self, request, pk=None):
        """Delete property (ownership validation)"""
        try:
            property_obj = PropertyService.validate_property_ownership(request.user, pk)
            PropertyService.delete_property(property_obj, request.user)
            return Response({
                'status': 'success',
                'message': 'Property deleted successfully'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'PROPERTY_DELETE_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[IsPropertyOwner])
    def images(self, request, pk=None):
        """Add image to property"""
        try:
            property_obj = PropertyService.validate_property_ownership(request.user, pk)
            
            serializer = PropertyImageSerializer(data=request.data, context={'property': property_obj})
            if serializer.is_valid():
                image = PropertyService.add_property_image(property_obj, serializer.validated_data)
                response_serializer = PropertyImageSerializer(image)
                return Response({
                    'status': 'success',
                    'message': 'Image added successfully',
                    'data': {
                        'image': response_serializer.data
                    }
                }, status=status.HTTP_201_CREATED)
            
            return Response({
                'status': 'error',
                'error': serializer.errors,
                'code': 'VALIDATION_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'IMAGE_ADD_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def images_list(self, request, pk=None):
        """Get property images"""
        try:
            # pk can be ID or slug
            property_obj = PropertyService.get_property_by_slug(pk)
            if not property_obj:
                property_obj = PropertyService.get_property_by_id(pk)
            
            images = property_obj.images.all().order_by('display_order')
            serializer = PropertyImageSerializer(images, many=True)
            
            return Response({
                'status': 'success',
                'data': {
                    'images': serializer.data
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'IMAGES_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def my_properties(self, request):
        """Get current user's properties (agents only)"""
        if not IsAgentUser().has_permission(request, self):
            return Response({
                'status': 'error',
                'error': 'Only agents can view their properties',
                'code': 'PERMISSION_DENIED'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            status_filter = request.query_params.get('status')
            # Use profile user_id, not id (profile uses user as primary key)
            profile_user_id = request.user.profile.user_id
            properties = PropertyService.get_agent_properties(profile_user_id, status_filter)
            
            # Pagination
            page = int(request.query_params.get('page', 1))
            page_size = min(int(request.query_params.get('page_size', 20)), 100)
            
            from django.core.paginator import Paginator
            paginator = Paginator(properties, page_size)
            page_obj = paginator.get_page(page)
            
            serializer = PropertyListSerializer(page_obj.object_list, many=True)
            
            return Response({
                'status': 'success',
                'data': {
                    'properties': serializer.data,
                    'pagination': {
                        'total': paginator.count,
                        'page': page_obj.number,
                        'page_size': page_size,
                        'total_pages': paginator.num_pages,
                        'has_next': page_obj.has_next(),
                        'has_previous': page_obj.has_previous()
                    }
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'MY_PROPERTIES_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
