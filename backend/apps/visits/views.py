from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import VisitRequest
from .serializers import (
    VisitRequestSerializer,
    VisitRequestCreateSerializer,
    VisitRequestUpdateSerializer,
    UserVisitRequestListSerializer,
    AgentVisitRequestListSerializer
)
from .services import VisitRequestService
from apps.common.permissions import IsAgentForRequest


class VisitRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for visit request management
    """
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['message', 'property__title']
    filterset_fields = ['status', 'property', 'agent']
    ordering_fields = ['created_at', 'preferred_date']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return VisitRequestCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return VisitRequestUpdateSerializer
        return VisitRequestSerializer
    
    def get_queryset(self):
        """Get visit requests with optimizations"""
        return VisitRequest.objects.select_related(
            'user',
            'property__agent__user',
            'agent__user'
        )
    
    def list(self, request):
        """List visit requests (user-specific based on role)"""
        try:
            # Filter based on user role
            if hasattr(request.user, 'profile') and request.user.profile.is_agent:
                # Agent sees their received requests
                agent_id = request.user.id
                status_filter = request.query_params.get('status')
                page = int(request.query_params.get('page', 1))
                page_size = min(int(request.query_params.get('page_size', 20)), 100)
                
                result = VisitRequestService.get_agent_visit_requests(agent_id, status_filter, page, page_size)
                serializer = AgentVisitRequestListSerializer(result['results'], many=True)
                
                return Response({
                    'status': 'success',
                    'data': {
                        'visit_requests': serializer.data,
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
            else:
                # Regular users see their own requests
                status_filter = request.query_params.get('status')
                page = int(request.query_params.get('page', 1))
                page_size = min(int(request.query_params.get('page_size', 20)), 100)
                
                result = VisitRequestService.get_user_visit_requests(request.user, status_filter, page, page_size)
                serializer = UserVisitRequestListSerializer(result['results'], many=True)
                
                return Response({
                    'status': 'success',
                    'data': {
                        'visit_requests': serializer.data,
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
                'code': 'VISIT_REQUESTS_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, pk=None):
        """Get visit request by ID (access validation)"""
        try:
            visit_request = VisitRequestService.validate_visit_request_access(
                request.user, pk, require_ownership=True
            )
            
            # Use appropriate serializer based on user role
            if hasattr(request.user, 'profile') and request.user.profile.is_agent:
                if visit_request.agent.user == request.user:
                    serializer = AgentVisitRequestListSerializer(visit_request)
                else:
                    serializer = UserVisitRequestListSerializer(visit_request)
            else:
                serializer = UserVisitRequestListSerializer(visit_request)
            
            return Response({
                'status': 'success',
                'data': {
                    'visit_request': serializer.data
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'VISIT_REQUEST_NOT_FOUND'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def create(self, request):
        """Create new visit request"""
        try:
            # Check if user is authenticated
            if not request.user.is_authenticated:
                # For guest users, require email and create/update user
                from apps.accounts.models import User
                email = request.data.get('contact_email')
                if not email:
                    return Response({
                        'status': 'error',
                        'error': 'Email is required for guest users',
                        'code': 'VALIDATION_ERROR'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Try to get or create user by email
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={'username': email.split('@')[0]}
                )
                if created:
                    user.set_unusable_password()
                    user.save()
                request.user = user
            
            serializer = VisitRequestCreateSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                agent_profile = serializer.validated_data['agent']
                visit_request = VisitRequestService.create_visit_request(
                    user=request.user,
                    property_id=serializer.validated_data['property'].id,
                    agent_id=agent_profile.user.id,
                    preferred_date=serializer.validated_data['preferred_date'],
                    contact_details={
                        'phone': serializer.validated_data['contact_phone'],
                        'email': serializer.validated_data['contact_email']
                    },
                    message=serializer.validated_data.get('message', '')
                )
                
                response_serializer = VisitRequestSerializer(visit_request)
                return Response({
                    'status': 'success',
                    'message': 'Visit request created successfully',
                    'data': {
                        'visit_request': response_serializer.data
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
                'code': 'VISIT_REQUEST_CREATE_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        """Update visit request (agent only)"""
        try:
            visit_request = VisitRequestService.validate_agent_access(request.user, pk)
            serializer = VisitRequestUpdateSerializer(visit_request, data=request.data, partial=True)
            
            if serializer.is_valid():
                updated_request = VisitRequestService.update_visit_request(visit_request, request.user, serializer.validated_data)
                response_serializer = VisitRequestSerializer(updated_request)
                return Response({
                    'status': 'success',
                    'message': 'Visit request updated successfully',
                    'data': {
                        'visit_request': response_serializer.data
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
                'code': 'VISIT_REQUEST_UPDATE_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def partial_update(self, request, pk=None):
        """Partially update visit request"""
        return self.update(request, pk)
    
    def destroy(self, request, pk=None):
        """Delete visit request (not allowed - use cancel instead)"""
        return Response({
            'status': 'error',
            'error': 'Visit request deletion not allowed. Use cancel action instead.',
            'code': 'METHOD_NOT_ALLOWED'
        }, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel visit request (request creator only)"""
        try:
            visit_request = VisitRequestService.get_visit_request_by_id(pk)
            VisitRequestService.cancel_visit_request(visit_request, request.user)
            
            return Response({
                'status': 'success',
                'message': 'Visit request cancelled successfully'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'CANCEL_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_requests(self, request):
        """Get current user's visit requests"""
        try:
            status_filter = request.query_params.get('status')
            page = int(request.query_params.get('page', 1))
            page_size = min(int(request.query_params.get('page_size', 20)), 100)
            
            result = VisitRequestService.get_user_visit_requests(request.user, status_filter, page, page_size)
            serializer = UserVisitRequestListSerializer(result['results'], many=True)
            
            return Response({
                'status': 'success',
                'data': {
                    'visit_requests': serializer.data,
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
                'code': 'MY_REQUESTS_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def agent_requests(self, request):
        """Get visit requests for current agent"""
        if not hasattr(request.user, 'profile') or not request.user.profile.is_agent:
            return Response({
                'status': 'error',
                'error': 'Only agents can view their received requests',
                'code': 'PERMISSION_DENIED'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            status_filter = request.query_params.get('status')
            page = int(request.query_params.get('page', 1))
            page_size = min(int(request.query_params.get('page_size', 20)), 100)
            
            result = VisitRequestService.get_agent_visit_requests(request.user.id, status_filter, page, page_size)
            serializer = AgentVisitRequestListSerializer(result['results'], many=True)
            
            return Response({
                'status': 'success',
                'data': {
                    'visit_requests': serializer.data,
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
                'code': 'AGENT_REQUESTS_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def property_requests(self, request):
        """Get visit requests for a specific property"""
        try:
            property_id = request.query_params.get('property_id')
            if not property_id:
                return Response({
                    'status': 'error',
                    'error': 'property_id parameter is required',
                    'code': 'MISSING_PROPERTY_ID'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            status_filter = request.query_params.get('status')
            page = int(request.query_params.get('page', 1))
            page_size = min(int(request.query_params.get('page_size', 20)), 100)
            
            result = VisitRequestService.get_property_visit_requests(property_id, status_filter, page, page_size)
            
            # Use appropriate serializer based on user role
            if hasattr(request.user, 'profile') and request.user.profile.is_agent:
                serializer = AgentVisitRequestListSerializer(result['results'], many=True)
            else:
                serializer = UserVisitRequestListSerializer(result['results'], many=True)
            
            return Response({
                'status': 'success',
                'data': {
                    'visit_requests': serializer.data,
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
                'code': 'PROPERTY_REQUESTS_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get visit request summary for an agent"""
        try:
            agent_id = request.query_params.get('agent_id')
            if not agent_id:
                return Response({
                    'status': 'error',
                    'error': 'agent_id parameter is required',
                    'code': 'MISSING_AGENT_ID'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            summary = VisitRequestService.get_visit_request_summary(agent_id)
            return Response({
                'status': 'success',
                'data': {
                    'summary': summary
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'SUMMARY_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
