import uuid

from django.db import models
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError

from accounts.models import User


# =====================================
# PDF File Validation
# =====================================

def validate_pdf(value):

    if not value.name.endswith('.pdf'):

        raise ValidationError(
            'Only PDF files are allowed.'
        )

    limit = 5 * 1024 * 1024

    if value.size > limit:

        raise ValidationError(
            'File size should not exceed 5MB.'
        )


# =====================================
# Custom Manager
# =====================================

class ActivePatientManager(models.Manager):

    def get_queryset(self):

        return super().get_queryset().filter(
            is_deleted=False
        )


# =====================================
# Patient Model
# =====================================

class Patient(models.Model):

    objects = models.Manager()

    active_objects = ActivePatientManager()

    # =====================================
    # Gender Choices
    # =====================================

    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    )

    # =====================================
    # Blood Group Choices
    # =====================================

    BLOOD_GROUP_CHOICES = (
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    )

    # =====================================
    # Patient Status Choices
    # =====================================

    PATIENT_STATUS = (
        ('admitted', 'Admitted'),
        ('discharged', 'Discharged'),
        ('critical', 'Critical'),
    )

    # =====================================
    # Primary Key
    # =====================================

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    # =====================================
    # User Relationship
    # =====================================

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='patient_profile'
    )

    # =====================================
    # Patient Information
    # =====================================

    patient_id = models.CharField(
        max_length=100,
        unique=True
    )

    blood_group = models.CharField(
        max_length=10,
        choices=BLOOD_GROUP_CHOICES
    )

    gender = models.CharField(
        max_length=20,
        choices=GENDER_CHOICES
    )

    date_of_birth = models.DateField()

    phone_regex = RegexValidator(
        regex=r'^[0-9]{10}$',
        message='Phone number must contain exactly 10 digits.'
    )

    phone_number = models.CharField(
        validators=[phone_regex],
        max_length=10,
        blank=True,
        null=True
    )

    emergency_contact = models.CharField(
        validators=[phone_regex],
        max_length=10
    )

    address = models.TextField()

    # =====================================
    # Medical Information
    # =====================================

    medical_history = models.TextField(
        blank=True,
        null=True
    )

    allergies = models.TextField(
        blank=True,
        null=True
    )

    insurance = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    # =====================================
    # Patient Status
    # =====================================

    status = models.CharField(
        max_length=20,
        choices=PATIENT_STATUS,
        default='admitted'
    )

    # =====================================
    # BMI Information
    # =====================================

    height = models.FloatField(
        blank=True,
        null=True
    )

    weight = models.FloatField(
        blank=True,
        null=True
    )

    bmi = models.FloatField(
        blank=True,
        null=True
    )

    # =====================================
    # AI Health Data
    # =====================================

    stress_level = models.FloatField(
        blank=True,
        null=True
    )

    health_risk_score = models.FloatField(
        blank=True,
        null=True
    )

    risk_category = models.CharField(
        max_length=50,
        blank=True,
        null=True
    )

    # =====================================
    # Status Flags
    # =====================================

    is_active = models.BooleanField(
        default=True
    )

    is_deleted = models.BooleanField(
        default=False
    )

    # =====================================
    # Timestamps
    # =====================================

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    # =====================================
    # Meta Class
    # =====================================

    class Meta:

        ordering = ['-created_at']

        verbose_name = 'Patient'

        verbose_name_plural = 'Patients'

        indexes = [
            models.Index(fields=['patient_id']),
            models.Index(fields=['created_at']),
        ]

    # =====================================
    # String Representation
    # =====================================

    def __str__(self):
        full_name = self.user.get_full_name().strip()
        display_name = full_name or self.user.username or self.user.email
        return f"{self.patient_id} - {display_name}"


# =====================================
# Patient Reports Model
# =====================================

class PatientReport(models.Model):

    REPORT_TYPES = (
        ('xray', 'X-Ray'),
        ('mri', 'MRI'),
        ('blood_test', 'Blood Test'),
        ('prescription', 'Prescription'),
        ('other', 'Other'),
    )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='patient_reports'
    )

    report_type = models.CharField(
        max_length=50,
        choices=REPORT_TYPES
    )

    report_file = models.FileField(
        upload_to='patient_reports/',
        validators=[validate_pdf]
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return f"{self.patient.patient_id} - {self.report_type}"
    
    # =====================================
# Patient Audit Log Model
# =====================================

class PatientAuditLog(models.Model):

    ACTION_CHOICES = (
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('deleted', 'Deleted'),
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE
    )

    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    action = models.CharField(
        max_length=20,
        choices=ACTION_CHOICES
    )

    description = models.TextField()

    timestamp = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return f"{self.patient.patient_id} - {self.action} - {self.updated_by.username if self.updated_by else 'Unknown'}"