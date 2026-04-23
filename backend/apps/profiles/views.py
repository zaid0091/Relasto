from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Profile
from .serializers import (
    ProfileSerializer,
    ProfileUpdateSerializer,
    AgentProfileSerializer,
    AgentSearchSerializer
)
from .services import ProfileService
from apps.common.permissions import IsProfileOwner


class ProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user profiles
    """
    queryset = Profile.objects.all()
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['bio', 'city', 'state']
    ordering_fields = ['created_at', 'average_rating']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return ProfileUpdateSerializer
        elif self.action == 'retrieve':
            return AgentProfileSerializer
        return ProfileSerializer
    
    def get_queryset(self):
        """Filter queryset based on action"""
        if self.action == 'list':
            # Only show agent profiles in public listing
            return Profile.objects.filter(is_agent=True)
        return Profile.objects.all()
    
    def retrieve(self, request, pk=None):
        """Get profile by ID (public access for agents)"""
        try:
            profile = ProfileService.get_profile_by_id(pk)
            serializer = AgentProfileSerializer(profile)
            return Response({
                'status': 'success',
                'data': {
                    'profile': serializer.data
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'PROFILE_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        """Update user profile (ownership validation)"""
        try:
            profile = ProfileService.validate_profile_ownership(request.user, pk)
            serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True)
            
            if serializer.is_valid():
                updated_profile = ProfileService.update_profile(request.user, serializer.validated_data)
                response_serializer = ProfileSerializer(updated_profile)
                return Response({
                    'status': 'success',
                    'message': 'Profile updated successfully',
                    'data': {
                        'profile': response_serializer.data
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
                'code': 'PROFILE_UPDATE_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def partial_update(self, request, pk=None):
        """Partially update user profile"""
        return self.update(request, pk)
    
    def destroy(self, request, pk=None):
        """Delete profile not allowed"""
        return Response({
            'status': 'error',
            'error': 'Profile deletion not allowed',
            'code': 'METHOD_NOT_ALLOWED'
        }, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        """Get current user's profile"""
        try:
            profile = ProfileService.get_user_profile(request.user)
            serializer = ProfileSerializer(profile)
            return Response({
                'status': 'success',
                'data': {
                    'profile': serializer.data
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'PROFILE_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def update_me(self, request):
        """Update current user's profile"""
        try:
            profile = ProfileService.get_user_profile(request.user)
            serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True)
            
            if serializer.is_valid():
                updated_profile = ProfileService.update_profile(request.user, serializer.validated_data)
                response_serializer = ProfileSerializer(updated_profile)
                return Response({
                    'status': 'success',
                    'message': 'Profile updated successfully',
                    'data': {
                        'profile': response_serializer.data
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
                'code': 'PROFILE_UPDATE_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def search_agents(self, request):
        """Search for agents with filters"""
        try:
            # Extract filters from query params
            filters = {}
            if 'city' in request.query_params:
                filters['city'] = request.query_params.get('city')
            if 'state' in request.query_params:
                filters['state'] = request.query_params.get('state')
            if 'min_rating' in request.query_params:
                try:
                    filters['min_rating'] = float(request.query_params.get('min_rating'))
                except ValueError:
                    pass
            
            # Pagination
            page = int(request.query_params.get('page', 1))
            page_size = min(int(request.query_params.get('page_size', 20)), 100)
            
            result = ProfileService.search_agents(filters, page, page_size)
            
            serializer = AgentSearchSerializer(result['results'], many=True)
            
            return Response({
                'status': 'success',
                'data': {
                    'agents': serializer.data,
                    'pagination': {
                        'total': result['total'],
                        'page': result['page'],
                        'page_size': result['page_size'],
                        'total_pages': result['total_pages']
                    }
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'SEARCH_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def properties(self, request, pk=None):
        """Get agent's properties"""
        try:
            profile = ProfileService.get_agent_profile(pk)
            status_filter = request.query_params.get('status')
            
            properties = ProfileService.get_agent_properties(profile.user_id, status_filter)
            
            # Use lightweight serializer for listing
            from apps.properties.serializers import PropertyListSerializer
            serializer = PropertyListSerializer(properties, many=True)
            
            return Response({
                'status': 'success',
                'data': {
                    'properties': serializer.data
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'PROPERTIES_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        """Get agent's reviews"""
        try:
            profile = ProfileService.get_agent_profile(pk)
            
            result = ProfileService.get_agent_reviews(profile.user_id)
            
            from apps.reviews.serializers import AgentReviewListSerializer
            serializer = AgentReviewListSerializer(result, many=True)
            
            return Response({
                'status': 'success',
                'data': {
                    'reviews': serializer.data
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'REVIEWS_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def toggle_agent(self, request):
        """Toggle agent status for current user"""
        try:
            profile = ProfileService.toggle_agent_status(request.user)
            serializer = ProfileSerializer(profile)
            return Response({
                'status': 'success',
                'message': f'Agent status {"enabled" if profile.is_agent else "disabled"}',
                'data': {
                    'profile': serializer.data
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'TOGGLE_AGENT_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
