import uuid

from django.db import models
from django.conf import settings

from patients.models import Patient
from doctors.models import Doctor


# =========================================================
# APPOINTMENT STATUS CHOICES
# =========================================================

class StatusChoices(models.TextChoices):

    PENDING = 'pending', 'Pending'
    CONFIRMED = 'confirmed', 'Confirmed'
    COMPLETED = 'completed', 'Completed'
    CANCELLED = 'cancelled', 'Cancelled'
    EMERGENCY = 'emergency', 'Emergency'


# =========================================================
# APPOINTMENT MODEL
# =========================================================

class Appointment(models.Model):

    APPOINTMENT_TYPES = (
        ('online', 'Online'),
        ('offline', 'Offline'),
    )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='appointments'
    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='appointments'
    )

    appointment_type = models.CharField(
        max_length=20,
        choices=APPOINTMENT_TYPES,
        default='offline'
    )

    date = models.DateField()

    time = models.TimeField()

    symptoms = models.TextField()

    notes = models.TextField(
        blank=True,
        null=True
    )

    meeting_link = models.URLField(
        blank=True,
        null=True
    )

    status = models.CharField(
        max_length=50,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING
    )

    priority_level = models.IntegerField(default=0)

    is_deleted = models.BooleanField(default=False)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_appointments'
    )

    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='updated_appointments'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:

        ordering = ['-date', '-time']

        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['status']),
            models.Index(fields=['priority_level']),
        ]

        constraints = [

            models.UniqueConstraint(
                fields=['doctor', 'date', 'time'],
                name='unique_doctor_schedule'
            ),
        ]

    def __str__(self):

        return (
            f"{self.patient} - "
            f"{self.doctor} - "
            f"{self.date} {self.time}"
        )


# =========================================================
# APPOINTMENT STATUS HISTORY MODEL
# =========================================================

class AppointmentStatusHistory(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    appointment = models.ForeignKey(
        'Appointment',
        on_delete=models.CASCADE,
        related_name='status_history'
    )

    old_status = models.CharField(
        max_length=50
    )

    new_status = models.CharField(
        max_length=50
    )

    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )

    changed_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        ordering = ['-changed_at']

    def __str__(self):

        return (
            f'{self.appointment.id} | '
            f'{self.old_status} -> {self.new_status}'
        )