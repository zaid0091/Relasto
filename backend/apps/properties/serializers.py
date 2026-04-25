from rest_framework import serializers
from .models import Property, PropertyImage, PropertyFeature


class PropertyFeatureSerializer(serializers.ModelSerializer):
    """Serializer for property features"""

    class Meta:
        model = PropertyFeature
        fields = ["feature_key", "feature_value"]


class PropertyImageSerializer(serializers.ModelSerializer):
    """Serializer for property images"""

    image = serializers.ImageField(use_url=True, required=False, allow_null=True)

    class Meta:
        model = PropertyImage
        fields = ["id", "image", "image_url", "alt_text", "is_primary", "display_order"]
        read_only_fields = ["id"]

    def to_representation(self, instance):
        """Return image URL in response"""
        data = super().to_representation(instance)
        img_url = None
        try:
            if instance.image:
                img_url = instance.image.url
        except Exception:
            img_url = None

        # If URL is relative, make it absolute
        if img_url and not img_url.startswith("http"):
            from django.conf import settings

            base_url = "http://127.0.0.1:8000"
            img_url = f"{base_url}/{img_url.lstrip('/')}"

        data["image_url"] = img_url
        data["image"] = img_url
        return data

    def validate(self, data):
        """Ensure only one primary image per property"""
        if data.get("is_primary", False):
            try:
                property_obj = (
                    self.instance.property_ref
                    if self.instance
                    else self.context.get("property")
                )
                if property_obj:
                    existing_primary = PropertyImage.objects.filter(
                        property_ref=property_obj, is_primary=True
                    ).exclude(pk=self.instance.pk if self.instance else None)

                    if existing_primary.exists():
                        raise serializers.ValidationError(
                            "Property already has a primary image."
                        )
            except Exception:
                pass
        return data


class PropertySerializer(serializers.ModelSerializer):
    """Serializer for properties"""

    agent = serializers.SerializerMethodField()
    images = PropertyImageSerializer(many=True, read_only=True)
    features = PropertyFeatureSerializer(many=True, read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            "id",
            "slug",
            "title",
            "description",
            "price",
            "property_type",
            "status",
            "address",
            "city",
            "state",
            "zip_code",
            "latitude",
            "longitude",
            "attributes",
            "agent",
            "images",
            "features",
            "primary_image",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "slug", "agent", "created_at", "updated_at"]

    def get_agent(self, obj):
        """Get agent information"""
        if not obj.agent:
            return None
        try:
            profile_image = None
            if obj.agent.profile_image:
                profile_image = obj.agent.profile_image.url
            
            return {
                "id": obj.agent.user_id,
                "user": {
                    "id": obj.agent.user.id,
                    "email": obj.agent.user.email,
                    "username": obj.agent.user.username,
                    "first_name": obj.agent.user.first_name,
                    "last_name": obj.agent.user.last_name,
                },
                "bio": obj.agent.bio,
                "phone": obj.agent.phone,
                "average_rating": obj.agent.average_rating,
                "profile_image": profile_image,
                "review_count": obj.agent.received_reviews.count()
                if hasattr(obj.agent, "received_reviews")
                else 0,
            }
        except Exception as e:
            return {
                "id": obj.agent.user_id,
                "bio": obj.agent.bio,
                "phone": obj.agent.phone,
            }

    def get_primary_image(self, obj):
        """Get primary image URL"""
        try:
            primary_image = obj.primary_image
            if primary_image:
                serializer = PropertyImageSerializer(primary_image)
                return serializer.data
        except Exception:
            pass
        return None


class PropertyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating properties (agents only)"""

    features = serializers.JSONField(
        required=False, help_text="List of feature objects with 'key' and 'value'"
    )

    class Meta:
        model = Property
        fields = [
            "title",
            "description",
            "price",
            "property_type",
            "status",
            "address",
            "city",
            "state",
            "zip_code",
            "latitude",
            "longitude",
            "attributes",
            "features",
        ]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be a positive number")
        return value

    def validate_attributes(self, value):
        import json

        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError(
                    "Attributes must be a valid JSON object"
                )
        if value and not isinstance(value, dict):
            raise serializers.ValidationError("Attributes must be a dictionary")
        return value

    def create(self, validated_data):
        features_data = validated_data.pop("features", [])

        # Create property with agent from request context
        request = self.context.get("request")
        agent_profile = request.user.profile

        property_obj = Property.objects.create(
            agent=agent_profile,
            title=validated_data["title"],
            description=validated_data["description"],
            price=validated_data["price"],
            property_type=validated_data.get("property_type", "residential"),
            status=validated_data.get("status", "for_sale"),
            address=validated_data.get("address", ""),
            city=validated_data.get("city", ""),
            state=validated_data.get("state", ""),
            zip_code=validated_data.get("zip_code", ""),
            latitude=validated_data.get("latitude"),
            longitude=validated_data.get("longitude"),
            attributes=validated_data.get("attributes", {}),
        )

        # Create features from key-value list
        for feature in features_data:
            if isinstance(feature, dict) and "key" in feature:
                PropertyFeature.objects.create(
                    property=property_obj,
                    feature_key=feature.get("key", ""),
                    feature_value=feature.get("value", ""),
                )
            elif isinstance(feature, str):
                PropertyFeature.objects.create(
                    property=property_obj, feature_key=feature, feature_value="true"
                )

        return property_obj


class PropertyUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating properties (ownership validated in view)"""

    features = serializers.JSONField(
        required=False, help_text="List of feature objects with 'key' and 'value'"
    )
    property_type = serializers.CharField(required=False)

    class Meta:
        model = Property
        fields = [
            "title",
            "description",
            "price",
            "property_type",
            "status",
            "address",
            "city",
            "state",
            "zip_code",
            "latitude",
            "longitude",
            "attributes",
            "features",
        ]

    def validate_price(self, value):
        """Validate price is positive"""
        if value <= 0:
            raise serializers.ValidationError("Price must be a positive number")
        return value

    def validate_attributes(self, value):
        """Validate attributes is a dictionary"""
        import json

        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError(
                    "Attributes must be a valid JSON object"
                )
        if value and not isinstance(value, dict):
            raise serializers.ValidationError("Attributes must be a dictionary")
        return value

    def validate_features(self, value):
        import json

        if isinstance(value, str):
            try:
                value = json.loads(value)
            except json.JSONDecodeError:
                raise serializers.ValidationError("Features must be a valid JSON array")
        return value

    def update(self, instance, validated_data):
        """Update property with features"""
        features_data = validated_data.pop("features", None)
        attributes_data = validated_data.pop("attributes", None)

        # Update property fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Update attributes if provided
        if attributes_data is not None:
            current_attrs = instance.attributes or {}
            for key, val in attributes_data.items():
                if val is not None:
                    current_attrs[key] = val
            instance.attributes = current_attrs

        instance.save()

        # Update features if provided and is a list
        if features_data is not None and isinstance(features_data, list):
            # Remove existing features
            instance.features.all().delete()

            # Create new features from key-value list or string list
            for feature in features_data:
                if isinstance(feature, dict) and "key" in feature and feature["key"]:
                    PropertyFeature.objects.create(
                        property=instance,
                        feature_key=feature.get("key", ""),
                        feature_value=feature.get("value", ""),
                    )
                elif isinstance(feature, str):
                    PropertyFeature.objects.create(
                        property=instance, feature_key=feature, feature_value="true"
                    )

        return instance


class PropertyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for property listings"""

    agent = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            "id",
            "slug",
            "title",
            "price",
            "property_type",
            "status",
            "city",
            "state",
            "agent",
            "primary_image",
            "attributes",
            "created_at",
        ]

    def get_agent(self, obj):
        """Get basic agent information"""
        return {
            "id": obj.agent.user_id,
            "user": {
                "id": obj.agent.user.id,
                "username": obj.agent.user.username,
                "first_name": obj.agent.user.first_name,
                "last_name": obj.agent.user.last_name,
            },
            "average_rating": obj.agent.average_rating,
            "review_count": obj.agent.received_reviews.count()
            if hasattr(obj.agent, "received_reviews")
            else 0,
        }

    def get_primary_image(self, obj):
        """Get primary image URL"""
        try:
            primary_image = obj.primary_image
            if primary_image:
                return {
                    "id": primary_image.id,
                    "image_url": primary_image.image_url,
                    "alt_text": primary_image.alt_text,
                }
        except Exception:
            pass
        return None
