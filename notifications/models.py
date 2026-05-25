# notifications/models.py

from django.db import models
from django.conf import settings
import uuid


class Notification(models.Model):

    NOTIFICATION_TYPES = (
        ('appointment', 'Appointment'),
        ('billing', 'Billing'),
        ('laboratory', 'Laboratory'),
        ('prescription', 'Prescription'),
        ('emergency', 'Emergency'),
        ('ai_alert', 'AI Alert'),
        ('system', 'System'),
        ('medicine', 'Medicine'),
        ('payment', 'Payment'),
        ('doctor', 'Doctor'),
    )

    PRIORITY_LEVELS = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )

    DELIVERY_STATUS = (
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('read', 'Read'),
    )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    title = models.CharField(max_length=255)

    message = models.TextField()

    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES
    )

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_LEVELS,
        default='medium'
    )

    delivery_status = models.CharField(
        max_length=20,
        choices=DELIVERY_STATUS,
        default='pending'
    )

    is_read = models.BooleanField(default=False)

    sent_via_email = models.BooleanField(default=False)

    sent_via_sms = models.BooleanField(default=False)

    sent_via_push = models.BooleanField(default=False)

    redirect_url = models.URLField(
        blank=True,
        null=True
    )

    metadata = models.JSONField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    expires_at = models.DateTimeField(
        blank=True,
        null=True
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'

    def __str__(self):
        return f"{self.user.username} - {self.title}"