from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
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
        return ' ' * self.rating


# Signal to update agent's average rating
@receiver(post_save, sender=Review)
def update_agent_rating_on_review_save(sender, instance, created, **kwargs):
    """Update agent's average rating when review is created or updated"""
    try:
        instance.agent_profile.update_average_rating()
    except Exception as e:
        # Don't re-raise - don't block the signal
        pass


@receiver(post_delete, sender=Review)
def update_agent_rating_on_review_delete(sender, instance, **kwargs):
    """Update agent's average rating when review is deleted"""
    try:
        instance.agent_profile.update_average_rating()
    except Exception as e:
        # Don't re-raise - don't block the signal
        pass
