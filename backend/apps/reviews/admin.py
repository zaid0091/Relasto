from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'agent_profile', 'reviewer', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('agent_profile__user__email', 'reviewer__email', 'comment')
    readonly_fields = ('created_at', 'updated_at')