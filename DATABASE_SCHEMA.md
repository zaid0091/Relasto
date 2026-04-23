# DATABASE SCHEMA IMPLEMENTATION GUIDE

**Objective:** Step-by-step Django model implementation following the architecture

---

## 1. BASE MODEL (apps/common/models.py)

```python
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
```

---

## 2. USER MODEL (apps/accounts/models.py)

```python
from django.contrib.auth.models import AbstractUser
from django.db import models
from apps.common.models import BaseModel

class User(AbstractUser):
    """
    Extended Django User model.
    
    Use this instead of default User because:
    - Email login instead of username
    - Future extensibility
    - Team-aligned design
    """
    email = models.EmailField(unique=True, db_index=True)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Email as primary identifier
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['username']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.email} ({self.username})"
    
    def has_profile(self):
        """Check if profile exists"""
        return hasattr(self, 'profile')
    
    def is_agent(self):
        """Convenience method to check if user is agent"""
        if self.has_profile():
            return self.profile.is_agent
        return False
```

---

## 3. PROFILE MODEL (apps/profiles/models.py)

```python
from django.db import models
from django.core.validators import RegexValidator
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
from django.db.models.signals import post_save

post_save.connect(
    ProfileSignals.create_profile_on_user_creation,
    sender='accounts.User'
)
```

---

## 4. PROPERTY MODELS (apps/properties/models.py)

```python
from django.db import models
from django.utils.text import slugify
from apps.common.models import BaseModel

class PropertyQuerySet(models.QuerySet):
    """Custom queryset for properties with common filters"""
    def active(self):
        """Get only active (not sold/rented) properties"""
        return self.filter(status__in=['sale', 'rent'])
    
    def by_agent(self, agent_profile):
        """Get properties by specific agent"""
        return self.filter(agent=agent_profile)
    
    def by_type(self, property_type):
        """Filter by property type"""
        return self.filter(property_type=property_type)
    
    def in_price_range(self, min_price, max_price):
        """Filter by price range"""
        return self.filter(price__gte=min_price, price__lte=max_price)
    
    def in_location(self, city=None, state=None):
        """Filter by location"""
        qs = self
        if city:
            qs = qs.filter(city__icontains=city)
        if state:
            qs = qs.filter(state__icontains=state)
        return qs
    
    def with_images(self):
        """Optimize query with image prefetch"""
        return self.prefetch_related(
            'images',
            'features'
        ).select_related('agent__user')


class PropertyManager(models.Manager):
    def get_queryset(self):
        return PropertyQuerySet(self.model, using=self._db)
    
    def active(self):
        return self.get_queryset().active()


class Property(BaseModel):
    """
    Real estate property listing.
    OWNERSHIP RULE: Property belongs to agent, agent belongs to user.
    Only the owning agent (user) can modify.
    """
    
    PROPERTY_TYPE_CHOICES = [
        ('residential', 'Residential'),
        ('commercial', 'Commercial'),
        ('industrial', 'Industrial'),
        ('agricultural', 'Agricultural'),
    ]
    
    STATUS_CHOICES = [
        ('sale', 'For Sale'),
        ('rent', 'For Rent'),
        ('sold', 'Sold'),
        ('rented', 'Rented'),
    ]
    
    # Relationships
    agent = models.ForeignKey(
        'profiles.Profile',
        on_delete=models.CASCADE,
        related_name='properties',
        limit_choices_to={'is_agent': True}  # Only agents
    )
    
    # Identification
    slug = models.SlugField(
        unique=True,
        db_index=True,
        help_text='URL-friendly identifier'
    )
    
    # Core Information
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    # Real Estate Details
    price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text='Price in currency (currency-agnostic)'
    )
    property_type = models.CharField(
        max_length=50,
        choices=PROPERTY_TYPE_CHOICES
    )
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='sale'
    )
    
    # Location Information
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # Flexible Attributes (for extensibility)
    attributes = models.JSONField(
        default=dict,
        blank=True,
        help_text='Key-value pairs for flexible data (bedrooms, bathrooms, sqft, etc.)'
    )
    
    # Manager
    objects = PropertyManager()
    
    class Meta:
        db_table = 'properties'
        verbose_name = 'Property'
        verbose_name_plural = 'Properties'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['agent_id']),
            models.Index(fields=['slug']),
            models.Index(fields=['property_type']),
            models.Index(fields=['status']),
            models.Index(fields=['city']),
            models.Index(fields=['price']),
            models.Index(fields=['created_at']),
            models.Index(fields=['agent_id', 'status']),  # For agent's properties
        ]
    
    def __str__(self):
        return f"{self.title} ({self.slug})"
    
    def save(self, *args, **kwargs):
        """Generate slug if not provided"""
        if not self.slug:
            self.slug = self._generate_unique_slug()
        super().save(*args, **kwargs)
    
    def _generate_unique_slug(self):
        """Generate unique slug from title"""
        base_slug = slugify(self.title)
        slug = base_slug
        counter = 1
        
        while Property.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug
    
    @property
    def primary_image(self):
        """Get primary image for property"""
        return self.images.filter(is_primary=True).first()
    
    def get_summary(self):
        """Get summary dict for listings (lighter payload)"""
        return {
            'id': self.id,
            'slug': self.slug,
            'title': self.title,
            'price': self.price,
            'property_type': self.property_type,
            'city': self.city,
            'primary_image': self.primary_image.image_url if self.primary_image else None,
        }


class PropertyImage(BaseModel):
    """Images associated with a property"""
    
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='images'
    )
    
    image_url = models.URLField()
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    display_order = models.PositiveSmallIntegerField(default=0)
    
    class Meta:
        db_table = 'property_images'
        verbose_name = 'Property Image'
        verbose_name_plural = 'Property Images'
        ordering = ['display_order']
        constraints = [
            models.UniqueConstraint(
                fields=['property', 'is_primary'],
                condition=models.Q(is_primary=True),
                name='unique_primary_image_per_property'
            )
        ]
        indexes = [
            models.Index(fields=['property_id']),
            models.Index(fields=['property_id', 'is_primary']),
        ]
    
    def __str__(self):
        return f"Image for {self.property.title}"
    
    def save(self, *args, **kwargs):
        """Ensure only one primary image per property"""
        if self.is_primary:
            PropertyImage.objects.filter(
                property=self.property,
                is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)


class PropertyFeature(models.Model):
    """Flexible key-value features for properties"""
    
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='features'
    )
    
    feature_key = models.CharField(max_length=100)
    feature_value = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'property_features'
        verbose_name = 'Property Feature'
        verbose_name_plural = 'Property Features'
        unique_together = ('property', 'feature_key')
        indexes = [
            models.Index(fields=['property_id']),
            models.Index(fields=['feature_key']),
        ]
    
    def __str__(self):
        return f"{self.feature_key}: {self.feature_value}"
```

---

## 5. REVIEW MODEL (apps/reviews/models.py)

```python
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.common.models import BaseModel

class Review(BaseModel):
    """
    Reviews and ratings for agent profiles.
    BUSINESS RULE: One review per user per agent (enforced by database unique constraint)
    """
    
    reviewer = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='reviews_written'
    )
    
    agent_profile = models.ForeignKey(
        'profiles.Profile',
        on_delete=models.CASCADE,
        related_name='received_reviews',
        limit_choices_to={'is_agent': True}
    )
    
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    
    comment = models.TextField(blank=True, max_length=1000)
    
    class Meta:
        db_table = 'reviews'
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'
        unique_together = ('reviewer', 'agent_profile')  # ONE REVIEW PER USER PER AGENT
        indexes = [
            models.Index(fields=['agent_profile_id']),
            models.Index(fields=['reviewer_id']),
            models.Index(fields=['rating']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Review by {self.reviewer.username} on {self.agent_profile.full_name}"
    
    def save(self, *args, **kwargs):
        """Prevent users from reviewing themselves"""
        if self.reviewer == self.agent_profile.user:
            raise ValueError('Users cannot review themselves')
        super().save(*args, **kwargs)
    
    def get_rating_display(self):
        """Display rating as stars"""
        return '⭐' * self.rating


# Signal to update agent's average rating
from django.db.models.signals import post_save, post_delete

def update_agent_rating_on_review_change(sender, instance, **kwargs):
    """Update agent's average rating after review change"""
    instance.agent_profile.update_average_rating()

post_save.connect(update_agent_rating_on_review_change, sender=Review)
post_delete.connect(update_agent_rating_on_review_change, sender=Review)
```

---

## 6. VISIT REQUEST MODEL (apps/visits/models.py)

```python
from django.db import models
from django.utils import timezone
from apps.common.models import BaseModel

class VisitRequest(BaseModel):
    """
    Visit requests from users to agents for specific properties.
    BUSINESS RULE: Property must belong to the specified agent.
    This is enforced at the service layer, but also checked at creation.
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Relationships
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='visit_requests'
    )
    
    property = models.ForeignKey(
        'properties.Property',
        on_delete=models.CASCADE,
        related_name='visit_requests'
    )
    
    agent = models.ForeignKey(
        'profiles.Profile',
        on_delete=models.CASCADE,
        related_name='received_visit_requests',
        limit_choices_to={'is_agent': True}
    )
    
    # Request Details
    preferred_date = models.DateField()
    contact_phone = models.CharField(max_length=20)
    contact_email = models.EmailField()
    message = models.TextField(blank=True, max_length=1000)
    
    # Status Tracking
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='pending'
    )
    is_reviewed = models.BooleanField(
        default=False,
        help_text='Agent has reviewed this request'
    )
    
    class Meta:
        db_table = 'visit_requests'
        verbose_name = 'Visit Request'
        verbose_name_plural = 'Visit Requests'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['agent_id']),
            models.Index(fields=['user_id']),
            models.Index(fields=['property_id']),
            models.Index(fields=['status']),
            models.Index(fields=['agent_id', 'status']),  # For agent filtering
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"Visit request by {self.user.username} for {self.property.title}"
    
    def clean(self):
        """
        CRITICAL: Validate that property belongs to agent.
        This must be checked here and in the service layer.
        """
        from django.core.exceptions import ValidationError
        if self.property.agent_id != self.agent.id:
            raise ValidationError('Property does not belong to this agent')
        
        if self.preferred_date < timezone.now().date():
            raise ValidationError('Preferred date must be in the future')
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
```

---

## 7. MIGRATION COMMANDS

```bash
# Step 1: Create initial migrations
python manage.py makemigrations accounts
python manage.py makemigrations profiles
python manage.py makemigrations properties
python manage.py makemigrations reviews
python manage.py makemigrations visits
python manage.py makemigrations common

# Step 2: Review migration files
cat backend/apps/accounts/migrations/0001_initial.py

# Step 3: Run migrations
python manage.py migrate accounts
python manage.py migrate profiles
python manage.py migrate properties
python manage.py migrate reviews
python manage.py migrate visits
python manage.py migrate common

# Step 4: Verify
python manage.py showmigrations

# Step 5: Create superuser
python manage.py createsuperuser

# Step 6: Test shell
python manage.py shell
>>> from apps.accounts.models import User
>>> User.objects.all()
```

---

## 8. DATA VALIDATION RULES

| Model | Field | Validation |
|-------|-------|-----------|
| User | email | Email format, unique |
| User | username | 3-150 chars, unique |
| User | password | Min 8 chars, uppercase, lowercase, number |
| Profile | phone | Valid international format if provided |
| Profile | is_agent | Boolean, default False |
| Property | title | 5-255 chars, required |
| Property | price | Positive decimal |
| Property | property_type | One of allowed types |
| Property | slug | Unique, generated from title |
| PropertyImage | is_primary | Only one per property |
| Review | rating | 1-5 only |
| Review | unique together | (reviewer, agent) |
| VisitRequest | preferred_date | Must be future date |
| VisitRequest | property & agent | Property must belong to agent |

---

## 9. INDEX STRATEGY EXPLANATION

**Why These Indexes?**

```
users(email)
  └─ Every login query: SELECT * FROM users WHERE email = ?
     
profiles(is_agent)
  └─ Agent search queries: SELECT * FROM profiles WHERE is_agent = true
     
properties(agent_id)
  └─ Get agent's properties: SELECT * FROM properties WHERE agent_id = ?
     
properties(city)
  └─ Location-based search: SELECT * FROM properties WHERE city LIKE ?
     
properties(price)
  └─ Price range filters: SELECT * FROM properties WHERE price BETWEEN ? AND ?
     
visit_requests(agent_id, status)
  └─ Agent's pending requests: SELECT * FROM visit_requests WHERE agent_id = ? AND status = 'pending'
     
reviews(agent_profile_id)
  └─ Get agent's reviews: SELECT * FROM reviews WHERE agent_profile_id = ?
```

---

## 10. DENORMALIZATION DECISIONS

| Field | Location | Trigger | Purpose |
|-------|----------|---------|---------|
| `average_rating` | Profile | Review save/delete | Fast agent display without calculation |
| `is_reviewed` | VisitRequest | Manual update | Track agent engagement |

**Note:** Only denormalize fields that are:
1. Frequently queried
2. Expensive to calculate
3. Not mission-critical (OK if slightly stale)

