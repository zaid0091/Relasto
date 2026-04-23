from django.contrib import admin
from .models import Property, PropertyImage, PropertyFeature

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'agent', 'price', 'status', 'property_type', 'city', 'created_at')
    list_filter = ('status', 'property_type', 'city', 'state')
    search_fields = ('title', 'description', 'address', 'city')
    readonly_fields = ('created_at', 'updated_at', 'slug')

@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ('id', 'property_ref', 'is_primary', 'display_order')
    list_filter = ('is_primary',)

@admin.register(PropertyFeature)
class PropertyFeatureAdmin(admin.ModelAdmin):
    list_display = ('property', 'feature_key', 'feature_value')
    search_fields = ('feature_key', 'feature_value')