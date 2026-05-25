import uuid
from django.db import models
from accounts.models import User


class Doctor(models.Model):

    AVAILABILITY_CHOICES = (
        ('available', 'Available'),
        ('busy', 'Busy'),
        ('leave', 'On Leave'),
    )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='doctor_profile'
    )

    specialization = models.CharField(
        max_length=255,
        db_index=True
    )

    availability = models.CharField(
        max_length=20,
        choices=AVAILABILITY_CHOICES,
        default='available',
        db_index=True
    )

    department = models.CharField(
        max_length=255,
        db_index=True
    )

    qualification = models.CharField(
        max_length=255,
        db_index=True
    )

    experience_years = models.PositiveIntegerField()

    consultation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    license_number = models.CharField(
        max_length=100,
        unique=True
    )

    is_active = models.BooleanField(
        default=True
    )

    is_deleted = models.BooleanField(
        default=False
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='doctor_created_by'
    )

    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='doctor_updated_by'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ['user']
        verbose_name = 'Doctor'
        verbose_name_plural = 'Doctors'

        indexes = [
            models.Index(fields=['specialization']),
            models.Index(fields=['department']),
            models.Index(fields=['availability']),
        ]

    def __str__(self):
        return self.user.username