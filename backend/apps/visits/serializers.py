from rest_framework import serializers
from django.utils import timezone
from .models import VisitRequest


class VisitRequestSerializer(serializers.ModelSerializer):
    """Serializer for visit requests"""
    user = serializers.SerializerMethodField()
    property = serializers.SerializerMethodField()
    agent = serializers.SerializerMethodField()
    
    class Meta:
        model = VisitRequest
        fields = [
            'id', 'user', 'property', 'agent', 'preferred_date',
            'contact_phone', 'contact_email', 'message', 'status',
            'is_reviewed', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'property', 'agent', 'is_reviewed',
            'created_at', 'updated_at'
        ]
    
    def get_user(self, obj):
        """Get user information"""
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'email': obj.user.email,
        }
    
    def get_property(self, obj):
        """Get property information"""
        return {
            'id': obj.property.id,
            'title': obj.property.title,
            'slug': obj.property.slug,
            'address': obj.property.address,
            'city': obj.property.city,
            'state': obj.property.state,
            'price': obj.property.price,
        }
    
    def get_agent(self, obj):
        """Get agent information"""
        return {
            'id': obj.agent.user_id,
            'user': {
                'id': obj.agent.user.id,
                'username': obj.agent.user.username,
                'first_name': obj.agent.user.first_name,
                'last_name': obj.agent.user.last_name,
            },
            'phone': obj.agent.phone,
        }
    
    def validate_preferred_date(self, value):
        """Validate preferred date is in the future"""
        if value < timezone.now().date():
            raise serializers.ValidationError("Preferred date must be in the future")
        return value
    
    def validate_contact_phone(self, value):
        """Validate phone number format"""
        if not value or len(value) < 10:
            raise serializers.ValidationError("Please provide a valid phone number")
        return value
    
    def validate_contact_email(self, value):
        """Validate email format"""
        if not value:
            raise serializers.ValidationError("Email is required")
        return value


class VisitRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating visit requests"""
    
    class Meta:
        model = VisitRequest
        fields = [
            'property', 'agent', 'preferred_date',
            'contact_phone', 'contact_email', 'message'
        ]
    
    def validate_preferred_date(self, value):
        """Validate preferred date is in the future"""
        if value < timezone.now().date():
            raise serializers.ValidationError("Preferred date must be in the future")
        return value
    
    def validate_contact_phone(self, value):
        """Validate phone number format"""
        if not value or len(value) < 10:
            raise serializers.ValidationError("Please provide a valid phone number")
        return value
    
    def validate_contact_email(self, value):
        """Validate email format"""
        if not value:
            raise serializers.ValidationError("Email is required")
        return value
    
    def validate(self, data):
        """Validate property-agent relationship"""
        property_obj = data['property']
        agent_profile = data['agent']
        
        # CRITICAL: Verify property belongs to agent
        # Profile uses user as primary_key, so agent_profile.id is actually agent_profile.user.id
        if property_obj.agent_id != agent_profile.user.id:
            raise serializers.ValidationError(
                "Property does not belong to this agent"
            )
        
        # Check for duplicate requests
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            existing_request = VisitRequest.objects.filter(
                user=request.user,
                property=property_obj,
                agent=agent_profile,
                status='pending'
            ).first()
            
            if existing_request:
                raise serializers.ValidationError(
                    "You already have a pending visit request for this property"
                )
        
        return data


class VisitRequestUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating visit requests (status changes by agent)"""
    
    class Meta:
        model = VisitRequest
        fields = ['status', 'is_reviewed']
    
    def validate_status(self, value):
        """Validate status value"""
        valid_statuses = ['pending', 'reviewed', 'completed', 'cancelled']
        if value not in valid_statuses:
            raise serializers.ValidationError(f"Status must be one of: {', '.join(valid_statuses)}")
        return value


class UserVisitRequestListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for user's visit requests"""
    property = serializers.SerializerMethodField()
    agent = serializers.SerializerMethodField()
    
    class Meta:
        model = VisitRequest
        fields = [
            'id', 'property', 'agent', 'preferred_date', 'status',
            'is_reviewed', 'created_at'
        ]
    
    def get_property(self, obj):
        """Get basic property information"""
        return {
            'id': obj.property.id,
            'title': obj.property.title,
            'slug': obj.property.slug,
            'address': obj.property.address,
            'city': obj.property.city,
        }
    
    def get_agent(self, obj):
        """Get basic agent information"""
        return {
            'id': obj.agent.user_id,
            'user': {
                'id': obj.agent.user.id,
                'username': obj.agent.user.username,
                'first_name': obj.agent.user.first_name,
                'last_name': obj.agent.user.last_name,
            },
        }


class AgentVisitRequestListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for agent's received visit requests"""
    user = serializers.SerializerMethodField()
    property = serializers.SerializerMethodField()
    
    class Meta:
        model = VisitRequest
        fields = [
            'id', 'user', 'property', 'preferred_date', 'contact_phone',
            'contact_email', 'message', 'status', 'is_reviewed', 'created_at'
        ]
    
    def get_user(self, obj):
        """Get user information"""
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'email': obj.contact_email,
        }
    
    def get_property(self, obj):
        """Get basic property information"""
        return {
            'id': obj.property.id,
            'title': obj.property.title,
            'slug': obj.property.slug,
            'address': obj.property.address,
        }
