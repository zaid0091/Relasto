from django.contrib import admin
from .models import VisitRequest

@admin.register(VisitRequest)
class VisitRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'property', 'user', 'agent', 'preferred_date', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('property__title', 'user__email', 'agent__user__email')
    readonly_fields = ('created_at', 'updated_at')