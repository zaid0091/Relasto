from rest_framework import serializers
from django.core.validators import MinValueValidator, MaxValueValidator
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for reviews"""
    reviewer = serializers.SerializerMethodField()
    agent_profile = serializers.SerializerMethodField()
    rating_display = serializers.ReadOnlyField()
    
    class Meta:
        model = Review
        fields = [
            'id', 'reviewer', 'agent_profile', 'rating', 'rating_display',
            'comment', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'reviewer', 'created_at', 'updated_at'
        ]
    
    def get_reviewer(self, obj):
        """Get reviewer information"""
        return {
            'id': obj.reviewer.id,
            'username': obj.reviewer.username,
            'first_name': obj.reviewer.first_name,
            'last_name': obj.reviewer.last_name,
        }
    
    def get_agent_profile(self, obj):
        """Get agent profile information"""
        return {
            'id': obj.agent_profile.user_id,
            'user': {
                'id': obj.agent_profile.user.id,
                'username': obj.agent_profile.user.username,
                'first_name': obj.agent_profile.user.first_name,
                'last_name': obj.agent_profile.user.last_name,
            },
            'average_rating': obj.agent_profile.average_rating,
        }
    
    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
    
    def validate(self, data):
        """Validate user cannot review themselves"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            agent_profile_id = data.get('agent_profile', self.instance.agent_profile if self.instance else None)
            if hasattr(agent_profile_id, 'user_id'):
                if agent_profile_id.user_id == request.user.id:
                    raise serializers.ValidationError("You cannot review yourself")
        return data


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reviews"""
    
    class Meta:
        model = Review
        fields = ['agent_profile', 'rating', 'comment']
    
    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value
    
    def validate_agent_profile(self, value):
        """Validate agent profile is actually an agent"""
        if not value.is_agent:
            raise serializers.ValidationError("You can only review agent profiles")
        return value
    
    def validate(self, data):
        """Validate user cannot review themselves"""
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            if data['agent_profile'].user_id == request.user.id:
                raise serializers.ValidationError("You cannot review yourself")
        return data


class ReviewUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating reviews"""
    
    class Meta:
        model = Review
        fields = ['rating', 'comment']
    
    def validate_rating(self, value):
        """Validate rating is between 1 and 5"""
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value


class AgentReviewListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for agent's reviews"""
    reviewer = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = ['id', 'reviewer', 'rating', 'comment', 'created_at']
    
    def get_reviewer(self, obj):
        """Get reviewer information"""
        return {
            'id': obj.reviewer.id,
            'username': obj.reviewer.username,
            'first_name': obj.reviewer.first_name,
            'last_name': obj.reviewer.last_name,
        }
