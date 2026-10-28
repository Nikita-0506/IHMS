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

    doctor_id = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        unique=True,
    )

    shift = models.CharField(
        max_length=20,
        choices=(
            ('morning', 'Morning (08:00 - 14:00)'),
            ('evening', 'Evening (14:00 - 20:00)'),
            ('night', 'Night (20:00 - 08:00)'),
        ),
        default='morning',
    )

    opd_timing = models.CharField(
        max_length=100,
        default='09:00 AM - 05:00 PM',
    )

    max_daily_patients = models.PositiveIntegerField(
        default=25,
    )

    current_queue_count = models.PositiveIntegerField(
        default=0,
    )

    room_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
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
        full_name = self.user.get_full_name().strip()
        display_name = full_name or self.user.username or self.user.email
        return f"Dr. {display_name}"


# =========================================================
# SERVICE COORDINATION MODEL
# =========================================================

class ServiceRequest(models.Model):

    SERVICE_TYPES = (
        ('consultation', 'Doctor Consultation'),
        ('laboratory', 'Laboratory Investigation'),
        ('pharmacy', 'Pharmacy Dispensing'),
        ('emergency', 'Emergency Escalation'),
        ('department_referral', 'Department Referral'),
    )

    PRIORITY_CHOICES = (
        ('emergency', 'Emergency / Critical — Immediate Escalation'),
        ('urgent', 'Urgent / High Concern — Prompt Review'),
        ('routine', 'Routine / Stable — Normal Workflow'),
    )

    STATUS_CHOICES = (
        ('requested', 'Requested'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('dispensed', 'Dispensed'),
        ('cancelled', 'Cancelled'),
    )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    request_id = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
    )

    patient = models.ForeignKey(
        'patients.Patient',
        on_delete=models.CASCADE,
        related_name='service_requests',
    )

    ordering_doctor = models.ForeignKey(
        Doctor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ordered_services',
    )

    service_type = models.CharField(
        max_length=50,
        choices=SERVICE_TYPES,
        default='consultation',
        db_index=True,
    )

    department = models.CharField(
        max_length=150,
        default='General Medicine',
        db_index=True,
    )

    priority = models.CharField(
        max_length=30,
        choices=PRIORITY_CHOICES,
        default='routine',
        db_index=True,
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default='requested',
        db_index=True,
    )

    details = models.TextField(
        help_text="Details of ordered tests, medications, or referral purpose",
    )

    result_summary = models.TextField(
        blank=True,
        null=True,
        help_text="Results, dispensing records, or clinical notes",
    )

    responsible_team = models.CharField(
        max_length=150,
        blank=True,
        null=True,
    )

    assigned_staff = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_service_tasks',
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    closed_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Service Request'
        verbose_name_plural = 'Service Requests'
        indexes = [
            models.Index(fields=['request_id']),
            models.Index(fields=['service_type']),
            models.Index(fields=['priority']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.request_id} - {self.service_type} ({self.get_status_display()})"