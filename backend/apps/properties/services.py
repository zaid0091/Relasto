from django.core.paginator import Paginator
from django.db import transaction
from django.core.exceptions import ValidationError, PermissionDenied
from django.db.models import Q
from .models import Property, PropertyImage, PropertyFeature


class PropertyService:
    """Service for handling property business logic"""

    @staticmethod
    def create_property(user, data):
        """
        Create a new property

        Args:
            user: Authenticated user object
            data: Validated serializer data

        Returns:
            Property instance

        Raises:
            PermissionDenied: If user is not an agent
            ValidationError: If data invalid
        """
        # Check authorization
        if not hasattr(user, "profile") or not user.profile.is_agent:
            raise PermissionDenied("Only agents can create properties")

        # Validate business rules
        if data.get("price", 0) <= 0:
            raise ValidationError({"price": "Price must be positive"})

        with transaction.atomic():
            property_obj = Property.objects.create(
                agent=user.profile,
                title=data["title"],
                description=data["description"],
                price=data["price"],
                property_type=data["property_type"],
                status=data.get("status", "sale"),
                address=data["address"],
                city=data["city"],
                state=data["state"],
                zip_code=data["zip_code"],
                latitude=data.get("latitude"),
                longitude=data.get("longitude"),
                attributes=data.get("attributes", {}),
            )

            # Handle features if provided
            if "features" in data:
                for feature_data in data["features"]:
                    PropertyFeature.objects.create(
                        property=property_obj, **feature_data
                    )

        return property_obj

    @staticmethod
    def update_property(property_obj, user, data):
        """
        Update property with ownership validation

        Args:
            property_obj: Property instance
            user: Authenticated user
            data: Validated data

        Returns:
            Updated Property instance

        Raises:
            PermissionDenied: If user doesn't own the property
            ValidationError: If data invalid
        """
        # Check ownership
        if property_obj.agent.user != user:
            raise PermissionDenied("You cannot modify this property")

        # Validate business rules
        if "price" in data and data["price"] <= 0:
            raise ValidationError({"price": "Price must be positive"})

        with transaction.atomic():
            # Update allowed fields (exclude features - handled by serializer)
            allowed_fields = [
                "title",
                "description",
                "price",
                "status",
                "address",
                "city",
                "state",
                "zip_code",
                "latitude",
                "longitude",
                "attributes",
            ]

            for field in allowed_fields:
                if field in data:
                    setattr(property_obj, field, data[field])

            property_obj.save()

        return property_obj

    @staticmethod
    def delete_property(property_obj, user):
        """
        Delete property with ownership validation

        Args:
            property_obj: Property instance
            user: Authenticated user

        Raises:
            PermissionDenied: If user doesn't own the property
        """
        # Check ownership
        if property_obj.agent.user != user:
            raise PermissionDenied("You cannot delete this property")

        property_obj.delete()

    @staticmethod
    def search_properties(filters, page=1, page_size=20):
        """
        Search properties with filters and pagination

        Args:
            filters: Dict with query parameters
            page: Page number (1-indexed)
            page_size: Items per page

        Returns:
            Dict with paginated results
        """
        queryset = Property.objects.all()

        # Apply filters
        if "property_type" in filters:
            queryset = queryset.filter(property_type=filters["property_type"])

        if "status" in filters:
            queryset = queryset.filter(status=filters["status"])

        if "price_min" in filters and "price_max" in filters:
            queryset = queryset.filter(
                price__gte=filters["price_min"], price__lte=filters["price_max"]
            )
        elif "price_min" in filters:
            queryset = queryset.filter(price__gte=filters["price_min"])
        elif "price_max" in filters:
            queryset = queryset.filter(price__lte=filters["price_max"])

        if "city" in filters:
            queryset = queryset.filter(city__icontains=filters["city"])

        if "state" in filters:
            queryset = queryset.filter(state__icontains=filters["state"])

        if "search" in filters:
            search_term = filters["search"]
            queryset = queryset.filter(
                Q(title__icontains=search_term)
                | Q(description__icontains=search_term)
                | Q(address__icontains=search_term)
            )

        # Agent filter
        if "agent_id" in filters:
            queryset = queryset.filter(agent_id=filters["agent_id"])

        # Bedrooms filter
        if "bedrooms" in filters:
            min_beds = filters["bedrooms"]
            queryset = queryset.filter(attributes__contains={"bedrooms": min_beds})

        # Optimize queries
        queryset = queryset.select_related("agent__user").prefetch_related(
            "images", "features"
        )

        # Ordering
        ordering = filters.get("ordering", "-created_at")
        if ordering:
            queryset = queryset.order_by(ordering)

        # Pagination
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
    def get_property_by_slug(slug):
        """
        Get property by slug

        Args:
            slug: Property slug

        Returns:
            Property instance or None

        Raises:
            ValidationError: If property doesn't exist
        """
        # Don't try to get by slug if it looks like a pure number
        if slug and str(slug).isdigit():
            return None

        try:
            return (
                Property.objects.select_related("agent__user")
                .prefetch_related("images", "features")
                .get(slug=slug)
            )
        except Property.DoesNotExist:
            return None

    @staticmethod
    def get_property_by_id(property_id):
        """
        Get property by ID

        Args:
            property_id: Property ID (int or string)

        Returns:
            Property instance

        Raises:
            ValidationError: If property doesn't exist
        """
        try:
            # Try to convert to int if string
            if isinstance(property_id, str):
                try:
                    property_id = int(property_id)
                except ValueError:
                    raise ValidationError("Property not found")

            return (
                Property.objects.select_related("agent__user")
                .prefetch_related("images", "features")
                .get(id=property_id)
            )
        except Property.DoesNotExist:
            raise ValidationError("Property not found")

    @staticmethod
    def get_agent_properties(agent_id, status_filter=None):
        """
        Get properties by agent

        Args:
            agent_id: Agent user ID
            status_filter: Optional status filter

        Returns:
            QuerySet of properties
        """
        queryset = Property.objects.filter(agent_id=agent_id)

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset.order_by("-created_at")

    @staticmethod
    def add_property_image(property_obj, image_data):
        """
        Add image to property

        Args:
            property_obj: Property instance
            image_data: Image data

        Returns:
            PropertyImage instance

        Raises:
            PermissionDenied: If user doesn't own the property
        """
        image = PropertyImage.objects.create(property_ref=property_obj, **image_data)

        return image

    @staticmethod
    def update_property_image(image_obj, user, data):
        """
        Update property image

        Args:
            image_obj: PropertyImage instance
            user: Authenticated user
            data: Update data

        Returns:
            Updated PropertyImage instance

        Raises:
            PermissionDenied: If user doesn't own the property
        """
        # Check ownership
        if image_obj.property_ref.agent.user != user:
            raise PermissionDenied("You cannot modify this image")

        for field, value in data.items():
            setattr(image_obj, field, value)

        image_obj.save()
        return image_obj

    @staticmethod
    def delete_property_image(image_obj, user):
        """
        Delete property image

        Args:
            image_obj: PropertyImage instance
            user: Authenticated user

        Raises:
            PermissionDenied: If user doesn't own the property
        """
        # Check ownership
        if image_obj.property_ref.agent.user != user:
            raise PermissionDenied("You cannot delete this image")

        image_obj.delete()

    @staticmethod
    def validate_property_ownership(user, property_id):
        """
        Validate that user owns the property

        Args:
            user: Authenticated user
            property_id: Property ID or slug

        Returns:
            Property instance

        Raises:
            PermissionDenied: If user doesn't own the property
            ValidationError: If property doesn't exist
        """
        # Try by slug first, then by ID
        property_obj = PropertyService.get_property_by_slug(property_id)
        if not property_obj:
            property_obj = PropertyService.get_property_by_id(property_id)

        if not property_obj:
            raise ValidationError("Property not found")

        if property_obj.agent.user != user:
            raise PermissionDenied("You cannot access this property")
        return property_obj


class PropertySlugService:
    """Service for handling property slug operations"""

    @staticmethod
    def generate_unique_slug(title):
        """
        Generate unique slug from title

        Args:
            title: Property title

        Returns:
            Unique slug string
        """
        from django.utils.text import slugify

        base_slug = slugify(title)
        slug = base_slug
        counter = 1

        while Property.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        return slug
