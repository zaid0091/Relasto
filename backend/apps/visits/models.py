from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
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
        if self.property.agent_id != self.agent.user.id:
            raise ValidationError('Property does not belong to this agent')
        
        if self.preferred_date < timezone.now().date():
            raise ValidationError('Preferred date must be in the future')
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
