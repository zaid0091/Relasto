from django.core.exceptions import ValidationError, PermissionDenied
from django.db.models import Avg
from .models import Review


class ReviewService:
    """Service for handling review business logic"""
    
    @staticmethod
    def create_or_update_review(reviewer, agent_profile, rating, comment=None):
        """
        Create or update a review (enforces one review per user per agent)
        
        Args:
            reviewer: User instance writing the review
            agent_profile: Profile instance being reviewed
            rating: Rating (1-5)
            comment: Optional comment
            
        Returns:
            tuple: (Review instance, created boolean)
            
        Raises:
            ValidationError: If validation fails
            PermissionDenied: If user tries to review themselves
        """
        # Prevent self-review
        if reviewer == agent_profile.user:
            raise PermissionDenied('Users cannot review themselves')
        
        # Validate agent profile
        if not agent_profile.is_agent:
            raise ValidationError('You can only review agent profiles')
        
        # Validate rating
        if not 1 <= rating <= 5:
            raise ValidationError('Rating must be between 1 and 5')
        
        # Create or update review
        review, created = Review.objects.update_or_create(
            reviewer=reviewer,
            agent_profile=agent_profile,
            defaults={
                'rating': rating,
                'comment': comment or ''
            }
        )
        
        # Update agent's average rating
        ReviewService.update_agent_average_rating(agent_profile)
        
        return review, created
    
    @staticmethod
    def update_review(review_obj, user, data):
        """
        Update existing review
        
        Args:
            review_obj: Review instance
            user: User making the update
            data: Update data
            
        Returns:
            Updated Review instance
            
        Raises:
            PermissionDenied: If user is not the review author
            ValidationError: If validation fails
        """
        # Check ownership
        if review_obj.reviewer != user:
            raise PermissionDenied('You can only modify your own reviews')
        
        # Validate rating if provided
        if 'rating' in data and not 1 <= data['rating'] <= 5:
            raise ValidationError('Rating must be between 1 and 5')
        
        # Update fields
        for field, value in data.items():
            setattr(review_obj, field, value)
        
        review_obj.save()
        
        # Update agent's average rating
        ReviewService.update_agent_average_rating(review_obj.agent_profile)
        
        return review_obj
    
    @staticmethod
    def delete_review(review_obj, user):
        """
        Delete a review
        
        Args:
            review_obj: Review instance
            user: User making the deletion
            
        Raises:
            PermissionDenied: If user is not the review author
        """
        # Check ownership
        if review_obj.reviewer != user:
            raise PermissionDenied('You can only delete your own reviews')
        
        agent_profile = review_obj.agent_profile
        review_obj.delete()
        
        # Update agent's average rating
        ReviewService.update_agent_average_rating(agent_profile)
    
    @staticmethod
    def get_user_reviews(user, page=1, page_size=20):
        """
        Get reviews written by a user
        
        Args:
            user: User instance
            page: Page number
            page_size: Items per page
            
        Returns:
            Dictionary with paginated results
        """
        queryset = Review.objects.filter(reviewer=user).order_by('-created_at')
        
        from django.core.paginator import Paginator
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        return {
            'total': paginator.count,
            'page': page,
            'page_size': page_size,
            'total_pages': paginator.num_pages,
            'results': page_obj.object_list
        }
    
    @staticmethod
    def get_agent_reviews(agent_id, page=1, page_size=20):
        """
        Get reviews for an agent
        
        Args:
            agent_id: Agent user ID
            page: Page number
            page_size: Items per page
            
        Returns:
            Dictionary with paginated results
            
        Raises:
            ValidationError: If agent profile doesn't exist
        """
        from apps.profiles.models import Profile
        
        try:
            agent_profile = Profile.objects.get(user_id=agent_id, is_agent=True)
        except Profile.DoesNotExist:
            raise ValidationError('Agent profile not found')
        
        queryset = Review.objects.filter(agent_profile=agent_profile).order_by('-created_at')
        
        from django.core.paginator import Paginator
        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)
        
        return {
            'total': paginator.count,
            'page': page,
            'page_size': page_size,
            'total_pages': paginator.num_pages,
            'results': page_obj.object_list
        }
    
    @staticmethod
    def get_review_by_id(review_id):
        """
        Get review by ID
        
        Args:
            review_id: Review ID
            
        Returns:
            Review instance
            
        Raises:
            ValidationError: If review doesn't exist
        """
        try:
            return Review.objects.select_related(
                'reviewer',
                'agent_profile__user'
            ).get(id=review_id)
        except Review.DoesNotExist:
            raise ValidationError('Review not found')
    
    @staticmethod
    def check_user_can_review(user, agent_id):
        """
        Check if user can review an agent
        
        Args:
            user: User instance
            agent_id: Agent user ID
            
        Returns:
            dict: {'can_review': bool, 'existing_review': Review or None}
        """
        from apps.profiles.models import Profile
        
        try:
            agent_profile = Profile.objects.get(user_id=agent_id, is_agent=True)
        except Profile.DoesNotExist:
            return {'can_review': False, 'reason': 'Agent not found'}
        
        # Prevent self-review
        if user == agent_profile.user:
            return {'can_review': False, 'reason': 'Cannot review yourself'}
        
        # Check for existing review
        existing_review = Review.objects.filter(
            reviewer=user,
            agent_profile=agent_profile
        ).first()
        
        if existing_review:
            return {
                'can_review': False,
                'reason': 'Review already exists',
                'existing_review': existing_review
            }
        
        return {'can_review': True}
    
    @staticmethod
    def update_agent_average_rating(agent_profile):
        """
        Recalculate and store average rating for agent
        
        Args:
            agent_profile: Profile instance
        """
        avg_rating = agent_profile.received_reviews.aggregate(
            avg=Avg('rating')
        )['avg'] or 0
        agent_profile.average_rating = round(avg_rating, 2)
        agent_profile.save(update_fields=['average_rating', 'updated_at'])
    
    @staticmethod
    def validate_review_ownership(user, review_id):
        """
        Validate that user owns the review
        
        Args:
            user: User instance
            review_id: Review ID
            
        Returns:
            Review instance
            
        Raises:
            PermissionDenied: If user doesn't own the review
            ValidationError: If review doesn't exist
        """
        try:
            review_obj = Review.objects.get(id=review_id)
            if review_obj.reviewer != user:
                raise PermissionDenied('You can only access your own reviews')
            return review_obj
        except Review.DoesNotExist:
            raise ValidationError('Review not found')
    
    @staticmethod
    def get_review_summary(agent_id):
        """
        Get review summary for an agent
        
        Args:
            agent_id: Agent user ID
            
        Returns:
            dict: Review summary statistics
            
        Raises:
            ValidationError: If agent profile doesn't exist
        """
        from apps.profiles.models import Profile
        
        try:
            agent_profile = Profile.objects.get(user_id=agent_id, is_agent=True)
        except Profile.DoesNotExist:
            raise ValidationError('Agent profile not found')
        
        reviews = agent_profile.received_reviews.all()
        
        # Calculate rating distribution
        rating_counts = {}
        for rating in range(1, 6):
            rating_counts[str(rating)] = reviews.filter(rating=rating).count()
        
        return {
            'total_reviews': reviews.count(),
            'average_rating': agent_profile.average_rating,
            'rating_distribution': rating_counts
        }
