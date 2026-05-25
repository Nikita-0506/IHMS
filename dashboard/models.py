import uuid
from django.db import models
from accounts.models import User


# =========================================
# Dashboard Analytics Model
# =========================================

class DashboardAnalytics(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='dashboard_analytics'
    )

    total_patients = models.IntegerField(default=0)

    total_doctors = models.IntegerField(default=0)

    total_appointments = models.IntegerField(default=0)

    total_revenue = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0.00
    )

    emergency_cases = models.IntegerField(default=0)

    ai_predictions = models.IntegerField(default=0)

    active_users = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):

        return f"{self.user.username} Dashboard Analytics"