from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_agent', 'phone', 'created_at')
    list_filter = ('is_agent',)
    search_fields = ('user__email', 'user__username', 'phone')
    readonly_fields = ('created_at', 'updated_at')