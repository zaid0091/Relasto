from django.db import models
from django.utils import timezone


class BaseModel(models.Model):
    """Abstract base model providing timestamp fields for all models"""
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True, db_index=True)
    
    class Meta:
        abstract = True
        ordering = ['-created_at']


class SoftDeleteManager(models.Manager):
    """Manager that excludes soft-deleted records"""
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)


class BlacklistedToken(models.Model):
    """Simple token blacklist model for logout functionality"""
    jti = models.CharField(unique=True, max_length=255)
    token_type = models.CharField(max_length=20)  # 'access' or 'refresh'
    blacklisted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'blacklisted_tokens'
        indexes = [
            models.Index(fields=['jti']),
            models.Index(fields=['expires_at']),
        ]
    
    @classmethod
    def is_blacklisted(cls, jti):
        """Check if a token is blacklisted"""
        return cls.objects.filter(jti=jti).exists()
    
    @classmethod
    def blacklist_token(cls, jti, token_type, expires_at):
        """Add a token to the blacklist"""
        cls.objects.get_or_create(
            jti=jti,
            defaults={
                'token_type': token_type,
                'expires_at': expires_at
            }
        )
    
    @classmethod
    def cleanup_expired(cls):
        """Remove expired tokens from blacklist"""
        cls.objects.filter(expires_at__lt=timezone.now()).delete()
