from django.db import models
from django.conf import settings
from apps.common.models import BaseModel
from django.utils.text import slugify
import os


def property_image_upload_path(instance, filename):
    """Generate upload path for property images"""
    ext = filename.split('.')[-1].lower() if '.' in filename else 'jpg'
    prop_id = getattr(instance.property_ref, 'id', None) if instance.property_ref else 'temp'
    unique_id = getattr(instance, 'id', 0)
    filename = f"property_{prop_id}_{unique_id}.{ext}"
    return os.path.join('properties/', filename)


class PropertyManager(models.Manager):
    """Custom manager for Property"""

    def get_queryset(self):
        return super().get_queryset()

    def for_agent(self, agent):
        """Get properties for a specific agent"""
        return self.filter(agent=agent)


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
        ('pending', 'Pending'),
    ]

    agent = models.ForeignKey(
        'profiles.Profile',
        on_delete=models.CASCADE,
        related_name='properties',
    )

    slug = models.SlugField(
        unique=True,
        db_index=True,
        help_text='URL-friendly identifier',
        max_length=255
    )

    title = models.CharField(max_length=255)
    description = models.TextField()

    price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
    )
    property_type = models.CharField(
        max_length=50,
        choices=PROPERTY_TYPE_CHOICES,
        default='residential'
    )
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='sale'
    )

    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100)
    zip_code = models.CharField(max_length=20)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    attributes = models.JSONField(
        default=dict,
        blank=True,
    )

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
        ]

    def __str__(self):
        return f"{self.title} ({self.slug})"

    def save(self, *args, **kwargs):
        """Generate slug if not provided"""
        if not self.slug:
            self.slug = self._generate_unique_slug()
            if len(self.slug) > 255:
                self.slug = self.slug[:255]
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
        """Get summary dict"""
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'price': str(self.price),
            'property_type': self.property_type,
            'status': self.status,
            'city': self.city,
            'state': self.state,
            'primary_image': self.primary_image.image_url if self.primary_image else None,
        }


class PropertyImage(BaseModel):
    """Images associated with a property"""

    property_ref = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='images'
    )

    image = models.ImageField(upload_to=property_image_upload_path, max_length=500, null=True, blank=True)
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
                fields=['property_ref', 'is_primary'],
                condition=models.Q(is_primary=True),
                name='unique_primary_image_per_property'
            )
        ]
        indexes = [
            models.Index(fields=['property_ref_id']),
            models.Index(fields=['property_ref_id', 'is_primary']),
        ]

    def __str__(self):
        return f"Image for {self.property_ref.title}"

    @property
    def image_url(self):
        """Return image URL"""
        if self.image:
            try:
                url = self.image.url
                if url and not url.startswith('http'):
                    return f"http://127.0.0.1:8000/{url.lstrip('/')}"
                return url
            except Exception:
                return None
        return None

    def save(self, *args, **kwargs):
        """Ensure only one primary image per property"""
        if self.is_primary:
            PropertyImage.objects.filter(
                property_ref=self.property_ref,
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