from django.db import models
from django.core.validators import RegexValidator
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.common.models import BaseModel


class Profile(BaseModel):
    """
    User profile: One-to-one relationship with User.
    Separates user authentication from user profile data.
    Supports both regular users and agents.
    """
    user = models.OneToOneField(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='profile',
        primary_key=True
    )
    
    # Personal Information
    bio = models.TextField(blank=True, max_length=500)
    
    # Contact Information
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message='Phone number must be in valid format'
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        validators=[phone_regex]
    )
    
    # Address Information (for location-based search)
    address = models.CharField(max_length=255, blank=True, db_index=True)
    city = models.CharField(max_length=100, blank=True, db_index=True)
    state = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    
    # Agent-specific fields
    is_agent = models.BooleanField(
        default=False,
        db_index=True,
        help_text='Indicates if this user can list properties'
    )
    average_rating = models.FloatField(
        default=0.0,
        help_text='Denormalized average rating from reviews'
    )
    
    class Meta:
        db_table = 'profiles'
        verbose_name = 'Profile'
        verbose_name_plural = 'Profiles'
        indexes = [
            models.Index(fields=['is_agent']),
            models.Index(fields=['city', 'is_agent']),  # For agent search
            models.Index(fields=['state', 'is_agent']),
        ]
    
    def __str__(self):
        return f"Profile of {self.user.username}"
    
    @property
    def full_name(self):
        """Get full name from user"""
        return self.user.get_full_name() or self.user.username
    
    @property
    def review_count(self):
        """Get count of reviews on this profile"""
        if self.is_agent:
            return self.received_reviews.count()
        return 0
    
    def update_average_rating(self):
        """Recalculate average rating from reviews"""
        from django.db.models import Avg
        avg = self.received_reviews.aggregate(avg=Avg('rating'))['avg'] or 0.0
        self.average_rating = round(avg, 2)
        self.save(update_fields=['average_rating', 'updated_at'])


class ProfileSignals:
    """Handle profile creation signals"""
    @staticmethod
    def create_profile_on_user_creation(sender, instance, created, **kwargs):
        """Auto-create profile when user is created"""
        if created:
            Profile.objects.get_or_create(user=instance)


# In models.py, after Profile class:
from django.db.models import Avg

post_save.connect(
    ProfileSignals.create_profile_on_user_creation,
    sender='accounts.User'
)
