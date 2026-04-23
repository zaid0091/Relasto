from rest_framework import serializers
from django.core.validators import RegexValidator
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profiles"""
    full_name = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    id = serializers.IntegerField(source='user_id', read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'id', 'user_id', 'bio', 'phone', 'address', 'city', 'state', 'zip_code',
            'is_agent', 'average_rating', 'review_count', 'full_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user_id', 'average_rating', 'review_count', 'full_name',
            'created_at', 'updated_at'
        ]
    
    def to_representation(self, instance):
        """Add user data to representation"""
        data = super().to_representation(instance)
        data['user'] = {
            'id': instance.user.id,
            'email': instance.user.email,
            'username': instance.user.username,
            'first_name': instance.user.first_name,
            'last_name': instance.user.last_name,
        }
        return data


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profiles"""
    
    class Meta:
        model = Profile
        fields = [
            'bio', 'phone', 'address', 'city', 'state', 'zip_code', 'is_agent'
        ]
    
    def validate_phone(self, value):
        """Validate phone number format"""
        if value:
            phone_regex = RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message='Phone number must be in valid format'
            )
            phone_regex(value)
        return value


class AgentProfileSerializer(serializers.ModelSerializer):
    """Serializer for agent profiles (includes additional agent-specific fields)"""
    full_name = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    properties_count = serializers.SerializerMethodField()
    id = serializers.IntegerField(source='user_id', read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'id', 'user_id', 'bio', 'phone', 'address', 'city', 'state', 'zip_code',
            'is_agent', 'average_rating', 'review_count', 'properties_count',
            'full_name', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user_id', 'average_rating', 'review_count', 'properties_count',
            'full_name', 'created_at', 'updated_at'
        ]
    
    def to_representation(self, instance):
        """Add user data to representation"""
        data = super().to_representation(instance)
        data['user'] = {
            'id': instance.user.id,
            'email': instance.user.email,
            'username': instance.user.username,
            'first_name': instance.user.first_name,
            'last_name': instance.user.last_name,
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
    review_count = serializers.ReadOnlyField()
    properties_count = serializers.SerializerMethodField()
    id = serializers.IntegerField(source='user_id', read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'id', 'user_id', 'bio', 'city', 'state', 'average_rating',
            'review_count', 'properties_count', 'full_name'
        ]
    
    def to_representation(self, instance):
        """Add user data to representation"""
        data = super().to_representation(instance)
        data['user'] = {
            'id': instance.user.id,
            'email': instance.user.email,
            'username': instance.user.username,
            'first_name': instance.user.first_name,
            'last_name': instance.user.last_name,
        }
        return data
    
    def get_properties_count(self, obj):
        """Get count of properties for this agent"""
        if obj.is_agent:
            return obj.properties.filter(status__in=['sale', 'rent']).count()
        return 0
