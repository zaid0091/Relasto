from rest_framework import serializers
from django.core.validators import RegexValidator
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profiles"""

    full_name = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    id = serializers.IntegerField(source="user_id", read_only=True)
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            "id",
            "user_id",
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
            "average_rating",
            "review_count",
            "full_name",
            "profile_image",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user_id",
            "average_rating",
            "review_count",
            "full_name",
            "created_at",
            "updated_at",
        ]

    def to_representation(self, instance):
        """Add user data to representation"""
        data = super().to_representation(instance)
        data["user"] = {
            "id": instance.user.id,
            "email": instance.user.email,
            "username": instance.user.username,
            "first_name": instance.user.first_name,
            "last_name": instance.user.last_name,
        }
        return data

    def get_profile_image(self, obj):
        """Get profile image URL"""
        if obj.profile_image:
            return obj.profile_image.url
        return None


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profiles"""

    profile_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Profile
        fields = [
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
        read_only_fields = [
            "id",
            "user_id",
            "average_rating",
            "review_count",
            "properties_count",
            "full_name",
            "created_at",
            "updated_at",
        ]

    def to_representation(self, instance):
        """Add user data to representation"""
        data = super().to_representation(instance)
        data["user"] = {
            "id": instance.user.id,
            "email": instance.user.email,
            "username": instance.user.username,
            "first_name": instance.user.first_name,
            "last_name": instance.user.last_name,
        }
        return data

    def get_properties_count(self, obj):
        """Get count of properties for this agent"""
        if obj.is_agent:
            return obj.properties.count()
        return 0


class AgentSearchSerializer(serializers.ModelSerializer):
    """Lightweight serializer for agent search results"""

    full_name = serializers.ReadOnlyField()
    review_count = serializers.SerializerMethodField()
    properties_count = serializers.SerializerMethodField()
    id = serializers.IntegerField(source="user_id", read_only=True)
    profile_image = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            "id",
            "user_id",
            "bio",
            "city",
            "state",
            "average_rating",
            "review_count",
            "properties_count",
            "full_name",
            "profile_image",
        ]

    def get_review_count(self, obj):
        """Get review count - handle both property and annotated field"""
        if hasattr(obj, 'review_count_annotation'):
            return obj.review_count_annotation
        return obj.review_count if hasattr(obj, 'review_count') else 0

    def get_properties_count(self, obj):
        """Get properties count"""
        return obj.properties.count() if hasattr(obj, "properties") else 0

    def get_profile_image(self, obj):
        """Get profile image URL"""
        if obj.profile_image:
            return obj.profile_image.url
        return None

    def to_representation(self, instance):
        """Add user data to representation"""
        data = super().to_representation(instance)
        data["user"] = {
            "id": instance.user.id,
            "email": instance.user.email,
            "username": instance.user.username,
            "first_name": instance.user.first_name,
            "last_name": instance.user.last_name,
        }
        return data

    def get_properties_count(self, obj):
        """Get count of properties for this agent"""
        if obj.is_agent:
            return obj.properties.filter(status__in=["sale", "rent"]).count()
        return 0
