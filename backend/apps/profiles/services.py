from django.core.exceptions import ValidationError, PermissionDenied
from .models import Profile


class ProfileService:
    """Service for handling profile business logic"""

    @staticmethod
    def get_user_profile(user):
        """
        Get user's own profile

        Args:
            user: User instance

        Returns:
            Profile instance

        Raises:
            ValidationError: If profile doesn't exist
        """
        try:
            return user.profile
        except Profile.DoesNotExist:
            raise ValidationError("Profile not found")

    @staticmethod
    def get_profile_by_id(profile_id):
        """
        Get profile by ID

        Args:
            profile_id: Profile ID

        Returns:
            Profile instance

        Raises:
            ValidationError: If profile doesn't exist
        """
        try:
            return Profile.objects.get(user_id=profile_id)
        except Profile.DoesNotExist:
            raise ValidationError("Profile not found")

    @staticmethod
    def update_profile(user, data):
        """
        Update user's profile

        Args:
            user: User instance
            data: Dictionary of fields to update

        Returns:
            Updated Profile instance

        Raises:
            ValidationError: If validation fails
            PermissionDenied: If user doesn't own the profile
        """
        try:
            profile = user.profile
        except Profile.DoesNotExist:
            raise ValidationError("Profile not found")

        # Update allowed fields
        allowed_fields = [
            "bio",
            "phone",
            "address",
            "city",
            "state",
            "zip_code",
            "is_agent",
            "experience",
            "property_types",
            "area",
            "license_no",
            "profile_image",
        ]

        for field in allowed_fields:
            if field in data:
                if (
                    data[field] is not None
                    and data[field] != ""
                    and data[field] != "null"
                ):
                    setattr(profile, field, data[field])

        profile.save()
        return profile

    @staticmethod
    def search_agents(filters, page=1, page_size=20, ordering="-average_rating"):
        """
        Search for agents with filters and pagination

        Args:
            filters: Dictionary with search parameters
            page: Page number (1-indexed)
            page_size: Items per page
            ordering: Ordering parameter

        Returns:
            Dictionary with paginated results
        """
        queryset = Profile.objects.filter(is_agent=True)

        # Apply text search (search by name, bio, city, state)
        if "search" in filters and filters["search"]:
            from django.db.models import Q
            search_term = filters["search"]
            queryset = queryset.filter(
                Q(user__first_name__icontains=search_term) |
                Q(user__last_name__icontains=search_term) |
                Q(user__username__icontains=search_term) |
                Q(bio__icontains=search_term) |
                Q(city__icontains=search_term) |
                Q(state__icontains=search_term)
            )

        # Apply specific filters
        if "city" in filters and filters["city"]:
            queryset = queryset.filter(city__icontains=filters["city"])

        if "state" in filters and filters["state"]:
            queryset = queryset.filter(state__icontains=filters["state"])

        if "min_rating" in filters:
            queryset = queryset.filter(average_rating__gte=filters["min_rating"])

        # Apply ordering - handle special cases for properties
        if ordering in ['review_count', '-review_count']:
            from django.db.models import Count
            queryset = queryset.annotate(review_count_annotation=Count('received_reviews'))
            if ordering == 'review_count':
                queryset = queryset.order_by('review_count_annotation')
            else:
                queryset = queryset.order_by('-review_count_annotation')
        else:
            queryset = queryset.order_by(ordering)

        # Pagination
        from django.core.paginator import Paginator

        paginator = Paginator(queryset, page_size)
        page_obj = paginator.get_page(page)

        return {
            "total": paginator.count,
            "page": page,
            "page_size": page_size,
            "total_pages": paginator.num_pages,
            "results": page_obj.object_list,
        }

    @staticmethod
    def get_agent_profile(agent_id):
        """
        Get agent profile for public view

        Args:
            agent_id: Agent user ID

        Returns:
            Profile instance

        Raises:
            ValidationError: If agent profile doesn't exist or user is not an agent
        """
        try:
            profile = Profile.objects.get(user_id=agent_id, is_agent=True)
            return profile
        except Profile.DoesNotExist:
            raise ValidationError("Agent profile not found")

    @staticmethod
    def get_agent_properties(agent_id, status_filter=None):
        """
        Get agent's properties

        Args:
            agent_id: Agent user ID
            status_filter: Optional status filter ('sale', 'rent', 'sold', 'rented')

        Returns:
            QuerySet of properties
        """
        try:
            profile = Profile.objects.get(user_id=agent_id, is_agent=True)
            queryset = profile.properties.all()

            if status_filter:
                queryset = queryset.filter(status=status_filter)

            return queryset.order_by("-created_at")
        except Profile.DoesNotExist:
            raise ValidationError("Agent profile not found")

    @staticmethod
    def get_agent_reviews(agent_id):
        """
        Get agent's reviews

        Args:
            agent_id: Agent user ID

        Returns:
            QuerySet of reviews
        """
        try:
            profile = Profile.objects.get(user_id=agent_id, is_agent=True)
            return profile.received_reviews.order_by("-created_at")
        except Profile.DoesNotExist:
            raise ValidationError("Agent profile not found")

    @staticmethod
    def toggle_agent_status(user):
        """
        Toggle agent status for a user

        Args:
            user: User instance

        Returns:
            Updated Profile instance

        Raises:
            ValidationError: If profile doesn't exist
        """
        try:
            profile = user.profile
            profile.is_agent = not profile.is_agent
            profile.save()
            return profile
        except Profile.DoesNotExist:
            raise ValidationError("Profile not found")

    @staticmethod
    def validate_profile_ownership(user, profile_id):
        """
        Validate that user owns the profile

        Args:
            user: User instance
            profile_id: Profile ID to validate

        Returns:
            Profile instance

        Raises:
            PermissionDenied: If user doesn't own the profile
            ValidationError: If profile doesn't exist
        """
        try:
            profile = Profile.objects.get(user_id=profile_id)
            if profile.user != user:
                raise PermissionDenied("You can only access your own profile")
            return profile
        except Profile.DoesNotExist:
            raise ValidationError("Profile not found")
