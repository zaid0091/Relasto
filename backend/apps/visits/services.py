from django.core.exceptions import ValidationError, PermissionDenied
from django.utils import timezone
from django.db.models import Q
from .models import VisitRequest


class VisitRequestService:
    """Service for handling visit request business logic"""
    
    @staticmethod
    def create_visit_request(user, property_id, agent_id, preferred_date, contact_details, message=None):
        """
        Create a visit request with validation
        
        Args:
            user: User making the request
            property_id: Property ID
            agent_id: Agent profile ID
            preferred_date: Preferred visit date
            contact_details: Dict with contact information
            message: Optional message
            
        Returns:
            VisitRequest instance
            
        Raises:
            ValidationError: If validation fails
            PermissionDenied: If business rules violated
        """
        from apps.properties.models import Property
        from apps.profiles.models import Profile
        
        try:
            property_obj = Property.objects.get(id=property_id)
            # agent_id here is actually the user_id, so we get profile by user_id
            agent_profile = Profile.objects.get(user_id=agent_id, is_agent=True)
        except (Property.DoesNotExist, Profile.DoesNotExist):
            raise ValidationError('Invalid property or agent')
        
        # CRITICAL: Verify property belongs to agent
        # Profile uses user as primary_key
        if property_obj.agent_id != agent_profile.user.id:
            raise ValidationError('Property does not belong to this agent')
        
        # Validate preferred date
        if preferred_date < timezone.now().date():
            raise ValidationError('Preferred date must be in the future')
        
        # Check for duplicate pending requests
        existing_request = VisitRequest.objects.filter(
            user=user,
            property=property_obj,
            agent=agent_profile,
            status='pending'
        ).first()
        
        if existing_request:
            raise ValidationError('You already have a pending visit request for this property')
        
        # Create visit request
        visit_request = VisitRequest.objects.create(
            user=user,
            property=property_obj,
            agent=agent_profile,
            preferred_date=preferred_date,
            contact_phone=contact_details.get('phone', ''),
            contact_email=contact_details.get('email', ''),
            message=message or '',
            status='pending',
            is_reviewed=False
        )
        
        return visit_request
    
    @staticmethod
    def update_visit_request(visit_request_obj, user, data):
        """
        Update visit request (status changes by agent only)
        
        Args:
            visit_request_obj: VisitRequest instance
            user: User making the update
            data: Update data
            
        Returns:
            Updated VisitRequest instance
            
        Raises:
            PermissionDenied: If user is not the assigned agent
            ValidationError: If validation fails
        """
        # Check permission - only assigned agent can update
        if visit_request_obj.agent.user != user:
            raise PermissionDenied('Only the assigned agent can update this request')
        
        # Update allowed fields
        allowed_fields = ['status', 'is_reviewed']
        
        for field in allowed_fields:
            if field in data:
                setattr(visit_request_obj, field, data[field])
        
        # Auto-set is_reviewed when status changes from pending
        if 'status' in data and data['status'] != 'pending' and visit_request_obj.status == 'pending':
            visit_request_obj.is_reviewed = True
        
        visit_request_obj.save()
        return visit_request_obj
    
    @staticmethod
    def cancel_visit_request(visit_request_obj, user):
        """
        Cancel visit request (user can cancel their own requests)
        
        Args:
            visit_request_obj: VisitRequest instance
            user: User making the cancellation
            
        Returns:
            Updated VisitRequest instance
            
        Raises:
            PermissionDenied: If user is not the request creator
        """
        # Check permission - only request creator can cancel
        if visit_request_obj.user != user:
            raise PermissionDenied('You can only cancel your own visit requests')
        
        # Can only cancel pending requests
        if visit_request_obj.status != 'pending':
            raise ValidationError('Can only cancel pending requests')
        
        visit_request_obj.status = 'cancelled'
        visit_request_obj.save()
        
        return visit_request_obj
    
    @staticmethod
    def get_user_visit_requests(user, status_filter=None, page=1, page_size=20):
        """
        Get visit requests made by a user
        
        Args:
            user: User instance
            status_filter: Optional status filter
            page: Page number
            page_size: Items per page
            
        Returns:
            Dictionary with paginated results
        """
        queryset = VisitRequest.objects.filter(user=user)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        queryset = queryset.order_by('-created_at')
        
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
    def get_agent_visit_requests(agent_id, status_filter=None, page=1, page_size=20):
        """
        Get visit requests for an agent
        
        Args:
            agent_id: Agent user ID
            status_filter: Optional status filter
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
        
        queryset = VisitRequest.objects.filter(agent=agent_profile)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        queryset = queryset.order_by('-created_at')
        
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
    def get_visit_request_by_id(request_id):
        """
        Get visit request by ID
        
        Args:
            request_id: VisitRequest ID
            
        Returns:
            VisitRequest instance
            
        Raises:
            ValidationError: If request doesn't exist
        """
        try:
            return VisitRequest.objects.select_related(
                'user',
                'property__agent__user',
                'agent__user'
            ).get(id=request_id)
        except VisitRequest.DoesNotExist:
            raise ValidationError('Visit request not found')
    
    @staticmethod
    def validate_visit_request_access(user, request_id, require_ownership=False):
        """
        Validate user access to visit request
        
        Args:
            user: User instance
            request_id: VisitRequest ID
            require_ownership: If True, user must be request creator or assigned agent
            
        Returns:
            VisitRequest instance
            
        Raises:
            PermissionDenied: If access denied
            ValidationError: If request doesn't exist
        """
        try:
            visit_request = VisitRequest.objects.get(id=request_id)
            
            if require_ownership:
                # Check if user is request creator or assigned agent
                if visit_request.user != user and visit_request.agent.user != user:
                    raise PermissionDenied('You can only access your own requests or requests assigned to you')
            
            return visit_request
        except VisitRequest.DoesNotExist:
            raise ValidationError('Visit request not found')
    
    @staticmethod
    def validate_agent_access(user, request_id):
        """
        Validate that user is the assigned agent for the request
        
        Args:
            user: User instance
            request_id: VisitRequest ID
            
        Returns:
            VisitRequest instance
            
        Raises:
            PermissionDenied: If user is not the assigned agent
            ValidationError: If request doesn't exist
        """
        try:
            visit_request = VisitRequest.objects.get(id=request_id)
            
            if visit_request.agent.user != user:
                raise PermissionDenied('Only the assigned agent can access this request')
            
            return visit_request
        except VisitRequest.DoesNotExist:
            raise ValidationError('Visit request not found')
    
    @staticmethod
    def get_property_visit_requests(property_id, status_filter=None, page=1, page_size=20):
        """
        Get visit requests for a specific property
        
        Args:
            property_id: Property ID
            status_filter: Optional status filter
            page: Page number
            page_size: Items per page
            
        Returns:
            Dictionary with paginated results
        """
        queryset = VisitRequest.objects.filter(property_id=property_id)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        queryset = queryset.order_by('-created_at')
        
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
    def get_visit_request_summary(agent_id):
        """
        Get visit request summary for an agent
        
        Args:
            agent_id: Agent user ID
            
        Returns:
            dict: Visit request statistics
            
        Raises:
            ValidationError: If agent profile doesn't exist
        """
        from apps.profiles.models import Profile
        
        try:
            agent_profile = Profile.objects.get(user_id=agent_id, is_agent=True)
        except Profile.DoesNotExist:
            raise ValidationError('Agent profile not found')
        
        requests = agent_profile.received_visit_requests.all()
        
        # Count by status
        status_counts = {}
        for status in ['pending', 'reviewed', 'completed', 'cancelled']:
            status_counts[status] = requests.filter(status=status).count()
        
        return {
            'total_requests': requests.count(),
            'pending_requests': status_counts['pending'],
            'reviewed_requests': status_counts['reviewed'],
            'completed_requests': status_counts['completed'],
            'cancelled_requests': status_counts['cancelled'],
            'status_distribution': status_counts
        }
