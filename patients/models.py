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

    PATIENT_TYPE_CHOICES = (
        ('new', 'New Patient'),
        ('existing', 'Existing Patient'),
    )

    CARE_STATUS_CHOICES = (
        ('ongoing', 'Ongoing Care'),
        ('initial_assessment', 'Initial Assessment'),
    )

    REFERRAL_STATUS_CHOICES = (
        ('referred', 'Referred'),
        ('not_referred', 'Not Referred'),
    )

    SEVERITY_CHOICES = (
        ('emergency', 'Emergency / Critical — Immediate Escalation'),
        ('urgent', 'Urgent / High Concern — Prompt Review'),
        ('routine', 'Routine / Stable — Normal Workflow'),
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

    patient_type = models.CharField(
        max_length=20,
        choices=PATIENT_TYPE_CHOICES,
        default='existing',
        db_index=True,
    )

    care_status = models.CharField(
        max_length=30,
        choices=CARE_STATUS_CHOICES,
        default='ongoing',
        db_index=True,
    )

    referral_status = models.CharField(
        max_length=20,
        choices=REFERRAL_STATUS_CHOICES,
        default='not_referred',
        db_index=True,
    )

    current_severity = models.CharField(
        max_length=20,
        choices=SEVERITY_CHOICES,
        default='routine',
        db_index=True,
    )

    current_condition = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Current symptoms or complaint",
    )

    referring_hospital = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    referring_doctor = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    transfer_reason = models.TextField(
        blank=True,
        null=True,
    )

    last_dose_taken = models.CharField(
        max_length=255,
        blank=True,
        null=True,
    )

    pending_actions = models.TextField(
        blank=True,
        null=True,
    )

    assigned_doctor = models.ForeignKey(
        'doctors.Doctor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_patients',
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

    @property
    def name(self):
        full_name = self.user.get_full_name().strip()
        return full_name or self.user.username or "Patient"

    @property
    def age(self):
        if not self.date_of_birth:
            return 0
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )

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


# =====================================
# Patient Clinical Monitoring & Vitals Model (PostgreSQL)
# =====================================

class PatientClinicalMonitoring(models.Model):
    """
    Stores comprehensive clinical patient monitoring vitals, location,
    triage monitoring level, and ML deterioration risk predictions.
    """
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    patient_id = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text="Unique Patient Identifier (e.g. PAT-000001)"
    )

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=20)
    phone = models.CharField(max_length=50, blank=True, null=True)
    email = models.CharField(max_length=150, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    patient_category = models.CharField(max_length=50, blank=True, null=True)
    allergy_status = models.CharField(max_length=100, blank=True, null=True)
    record_status = models.CharField(max_length=30, default='Active', db_index=True)

    # Ward / Location
    care_location_type = models.CharField(max_length=100, db_index=True)
    room_no = models.CharField(max_length=50, blank=True, null=True)
    bed_no = models.CharField(max_length=50, blank=True, null=True)
    care_unit = models.CharField(max_length=100, db_index=True)

    # Monitoring & Vital Signs
    monitoring_level = models.CharField(
        max_length=50,
        db_index=True,
        help_text="Routine / Enhanced / Continuous"
    )
    heart_rate_bpm = models.FloatField(help_text="Heart rate in beats per minute")
    systolic_bp_mmhg = models.FloatField(help_text="Systolic blood pressure in mmHg")
    diastolic_bp_mmhg = models.FloatField(help_text="Diastolic blood pressure in mmHg")
    respiratory_rate_bpm = models.FloatField(help_text="Respiratory rate in breaths per minute")
    spo2_percent = models.FloatField(help_text="Blood oxygen saturation percentage")
    temperature_c = models.FloatField(help_text="Body temperature in Celsius")
    blood_glucose_mg_dl = models.FloatField(help_text="Blood glucose level in mg/dL")
    gcs_score = models.IntegerField(help_text="Glasgow Coma Scale score (3-15)")
    pain_score = models.IntegerField(help_text="Pain score (0-10)")
    ecg_rhythm = models.CharField(max_length=100, default='Sinus Rhythm')
    urine_output_ml_hr = models.FloatField(help_text="Urine output in mL/hr")
    monitoring_frequency = models.CharField(max_length=100, blank=True, null=True)
    monitoring_last_updated = models.DateTimeField(null=True, blank=True)
    created_at_record = models.DateTimeField(null=True, blank=True)

    # ML Model Prediction Results
    predicted_monitoring_level = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    prediction_confidence = models.FloatField(blank=True, null=True)
    predicted_care_unit = models.CharField(max_length=100, blank=True, null=True)
    risk_score = models.FloatField(blank=True, null=True, help_text="Calculated clinical risk score (0-100)")
    deterioration_risk = models.CharField(max_length=30, blank=True, null=True, help_text="Low / Moderate / High")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['patient_id']
        verbose_name = 'Patient Clinical Monitoring'
        verbose_name_plural = 'Patient Clinical Monitorings'
        indexes = [
            models.Index(fields=['patient_id']),
            models.Index(fields=['monitoring_level']),
            models.Index(fields=['care_location_type']),
            models.Index(fields=['care_unit']),
            models.Index(fields=['record_status']),
            models.Index(fields=['predicted_monitoring_level']),
        ]

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def __str__(self):
        return f"{self.patient_id} - {self.full_name} ({self.monitoring_level})"