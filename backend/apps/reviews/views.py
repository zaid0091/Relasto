from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Review
from .serializers import (
    ReviewSerializer,
    ReviewCreateSerializer,
    ReviewUpdateSerializer,
    AgentReviewListSerializer
)
from .services import ReviewService
from apps.common.permissions import IsReviewAuthor


class ReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for review management
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['comment']
    filterset_fields = ['rating', 'agent_profile']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReviewCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ReviewUpdateSerializer
        return ReviewSerializer
    
    def get_queryset(self):
        """Get reviews with optimizations"""
        return Review.objects.select_related(
            'reviewer',
            'agent_profile__user'
        )
    
    def list(self, request):
        """List reviews with filters (agent_id filter required for public access)"""
        try:
            # Require agent_id filter for public access
            agent_id = request.query_params.get('agent_id')
            if not agent_id:
                if not request.user.is_authenticated:
                    return Response({
                        'status': 'error',
                        'error': 'agent_id filter is required',
                        'code': 'MISSING_AGENT_ID'
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get reviews for specific agent
            if agent_id:
                page = int(request.query_params.get('page', 1))
                page_size = min(int(request.query_params.get('page_size', 20)), 100)
                
                result = ReviewService.get_agent_reviews(agent_id, page, page_size)
                serializer = AgentReviewListSerializer(result['results'], many=True)
                
                return Response({
                    'status': 'success',
                    'data': {
                        'reviews': serializer.data,
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
            
            # Authenticated users can see their own reviews
            if request.user.is_authenticated:
                page = int(request.query_params.get('page', 1))
                page_size = min(int(request.query_params.get('page_size', 20)), 100)
                
                result = ReviewService.get_user_reviews(request.user, page, page_size)
                serializer = ReviewSerializer(result['results'], many=True)
                
                return Response({
                    'status': 'success',
                    'data': {
                        'reviews': serializer.data,
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
                'code': 'REVIEWS_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def retrieve(self, request, pk=None):
        """Get review by ID"""
        try:
            review_obj = ReviewService.get_review_by_id(pk)
            
            # Check permissions
            if (request.user != review_obj.reviewer and 
                request.user != review_obj.agent_profile.user and 
                not request.user.is_staff):
                return Response({
                    'status': 'error',
                    'error': 'Review not found',
                    'code': 'NOT_FOUND'
                }, status=status.HTTP_404_NOT_FOUND)
            
            serializer = ReviewSerializer(review_obj)
            return Response({
                'status': 'success',
                'data': {
                    'review': serializer.data
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'REVIEW_NOT_FOUND'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def create(self, request):
        """Create new review"""
        try:
            serializer = ReviewCreateSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                review, created = ReviewService.create_or_update_review(
                    reviewer=request.user,
                    agent_profile=serializer.validated_data['agent_profile'],
                    rating=serializer.validated_data['rating'],
                    comment=serializer.validated_data.get('comment', '')
                )
                
                response_serializer = ReviewSerializer(review)
                message = 'Review created successfully' if created else 'Review updated successfully'
                
                return Response({
                    'status': 'success',
                    'message': message,
                    'data': {
                        'review': response_serializer.data
                    }
                }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
            
            return Response({
                'status': 'error',
                'error': serializer.errors,
                'code': 'VALIDATION_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'REVIEW_CREATE_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        """Update review (ownership validation)"""
        try:
            review_obj = ReviewService.validate_review_ownership(request.user, pk)
            serializer = ReviewUpdateSerializer(review_obj, data=request.data, partial=True)
            
            if serializer.is_valid():
                updated_review = ReviewService.update_review(review_obj, request.user, serializer.validated_data)
                response_serializer = ReviewSerializer(updated_review)
                return Response({
                    'status': 'success',
                    'message': 'Review updated successfully',
                    'data': {
                        'review': response_serializer.data
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
                'code': 'REVIEW_UPDATE_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def partial_update(self, request, pk=None):
        """Partially update review"""
        return self.update(request, pk)
    
    def destroy(self, request, pk=None):
        """Delete review (ownership validation)"""
        try:
            review_obj = ReviewService.validate_review_ownership(request.user, pk)
            ReviewService.delete_review(review_obj, request.user)
            return Response({
                'status': 'success',
                'message': 'Review deleted successfully'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'REVIEW_DELETE_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_reviews(self, request):
        """Get current user's reviews"""
        try:
            page = int(request.query_params.get('page', 1))
            page_size = min(int(request.query_params.get('page_size', 20)), 100)
            
            result = ReviewService.get_user_reviews(request.user, page, page_size)
            serializer = ReviewSerializer(result['results'], many=True)
            
            return Response({
                'status': 'success',
                'data': {
                    'reviews': serializer.data,
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
                'code': 'MY_REVIEWS_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def agent_summary(self, request):
        """Get review summary for an agent"""
        try:
            agent_id = request.query_params.get('agent_id')
            if not agent_id:
                return Response({
                    'status': 'error',
                    'error': 'agent_id parameter is required',
                    'code': 'MISSING_AGENT_ID'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            summary = ReviewService.get_review_summary(agent_id)
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
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def can_review(self, request):
        """Check if user can review an agent"""
        try:
            agent_id = request.query_params.get('agent_id')
            if not agent_id:
                return Response({
                    'status': 'error',
                    'error': 'agent_id parameter is required',
                    'code': 'MISSING_AGENT_ID'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            result = ReviewService.check_user_can_review(request.user, agent_id)
            
            return Response({
                'status': 'success',
                'data': {
                    'can_review': result['can_review'],
                    'reason': result.get('reason'),
                    'existing_review': result.get('existing_review')
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': 'error',
                'error': str(e),
                'code': 'CAN_REVIEW_ERROR'
            }, status=status.HTTP_400_BAD_REQUEST)
