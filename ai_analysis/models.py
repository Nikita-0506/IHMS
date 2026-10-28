import uuid
from django.db import models
from patients.models import Patient

class AIAnalysis(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE
    )

    voice_stress_score = models.FloatField()

    disease_prediction = models.CharField(max_length=255)

    mental_health_result = models.CharField(max_length=255)

    confidence_score = models.FloatField()

    audio_file = models.FileField(upload_to='voice_analysis/')

    analysis_report = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient} - {self.disease_prediction} - {self.created_at}"


# =========================================================
# MEDICAL DOCUMENT & OCR PIPELINE MODEL
# =========================================================

class MedicalDocument(models.Model):

    DOC_TYPES = (
        ('prescription', 'Prescription'),
        ('lab_report', 'Laboratory Report'),
        ('referral_note', 'Referral / Transfer Note'),
        ('discharge_summary', 'Discharge Summary'),
        ('imaging_report', 'Imaging / X-Ray / MRI Report'),
        ('other', 'Other Medical Document'),
    )

    VERIFICATION_STATUS = (
        ('pending_verification', 'Pending Doctor Verification'),
        ('verified', 'Verified by Doctor'),
        ('flagged_conflict', 'Flagged with Conflicts'),
    )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    document_id = models.CharField(
        max_length=100,
        unique=True,
        db_index=True,
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='medical_documents',
        null=True,
        blank=True,
    )

    document_type = models.CharField(
        max_length=50,
        choices=DOC_TYPES,
        default='lab_report',
        db_index=True,
    )

    title = models.CharField(
        max_length=255,
        default='Uploaded Medical Record',
    )

    document_file = models.FileField(
        upload_to='medical_documents/',
        null=True,
        blank=True,
    )

    raw_text = models.TextField(
        blank=True,
        null=True,
        help_text="Extracted text from OCR engine",
    )

    ocr_confidence = models.FloatField(
        default=0.85,
        help_text="Extraction confidence score (0.0 to 1.0)",
    )

    verification_status = models.CharField(
        max_length=50,
        choices=VERIFICATION_STATUS,
        default='pending_verification',
        db_index=True,
    )

    verified_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_documents',
    )

    verified_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    extracted_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Structured data: tests, values, units, reference ranges, medicines, flags",
    )

    doctor_notes = models.TextField(
        blank=True,
        null=True,
        help_text="Doctor corrections or manual annotations",
    )

    is_duplicate = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Medical Document'
        verbose_name_plural = 'Medical Documents'

    def __str__(self):
        return f"{self.document_id} - {self.get_document_type_display()} ({self.get_verification_status_display()})"


# =========================================================
# 5-SECTION AI CLINICAL SUMMARY & INFERENCE MODEL
# =========================================================

class AIClinicalSummary(models.Model):

    SEVERITY_LEVELS = (
        ('emergency', 'Emergency / Critical — Immediate Escalation'),
        ('urgent', 'Urgent / High Concern — Prompt Review'),
        ('routine', 'Routine / Stable — Normal Workflow'),
    )

    TREND_CHOICES = (
        ('improved', 'Improved vs Previous Visit'),
        ('stable', 'Stable Condition'),
        ('worsened', 'Worsened Condition'),
        ('baseline', 'Initial Baseline Assessment'),
    )

    CASE_TYPES = (
        ('fever', 'Fever with Dehydration Concern'),
        ('trauma', 'Accident / Trauma'),
        ('diabetes_bp', 'Diabetes / Hypertension'),
        ('respiratory', 'Respiratory Problem'),
        ('post_surgery', 'Post-Surgery Patient'),
        ('chronic', 'Chronic Illness'),
        ('pregnancy', 'Pregnancy-Related Case'),
        ('pediatric', 'Child Patient'),
        ('transferred_critical', 'Transferred Critical Patient'),
        ('general', 'General Consultation'),
    )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='clinical_summaries',
    )

    doctor = models.ForeignKey(
        'doctors.Doctor',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='generated_summaries',
    )

    # 1. Current Condition: symptoms, observations, vitals
    current_condition = models.TextField(
        help_text="Section 1: Current symptoms, observations, and recorded vital signs",
    )

    # 2. Relevant History: previous diagnoses, meds, allergies, records
    relevant_history = models.TextField(
        help_text="Section 2: Previous diagnoses, medications, allergies, and relevant medical records",
    )

    # 3. Alerts: critical findings, abnormal readings, potential risks
    alerts = models.TextField(
        help_text="Section 3: Critical findings, abnormal readings, and potential risks requiring review",
    )

    # 4. Pending Actions: tests, treatments, follow-ups, required reviews
    pending_actions = models.TextField(
        help_text="Section 4: Pending tests, treatments, follow-up appointments, and reviews",
    )

    # 5. Source Documents: medical reports, referral notes, prescriptions
    source_documents = models.JSONField(
        default=list,
        blank=True,
        help_text="Section 5: Medical reports, referral notes, and prescriptions used",
    )

    case_type = models.CharField(
        max_length=50,
        choices=CASE_TYPES,
        default='general',
    )

    priority_level = models.CharField(
        max_length=30,
        choices=SEVERITY_LEVELS,
        default='routine',
        db_index=True,
    )

    trend_comparison = models.CharField(
        max_length=30,
        choices=TREND_CHOICES,
        default='stable',
    )

    vitals_snapshot = models.JSONField(
        default=dict,
        blank=True,
        help_text="Temperature, BP, Heart Rate, SpO2, Respiratory Rate, etc.",
    )

    risk_score = models.FloatField(
        default=50.0,
        help_text="Clinical risk score (0-100)",
    )

    ai_confidence = models.FloatField(
        default=0.88,
    )

    doctor_reviewed = models.BooleanField(
        default=False,
    )

    doctor_feedback = models.TextField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'AI Clinical Summary'
        verbose_name_plural = 'AI Clinical Summaries'

    def __str__(self):
        return f"{self.patient.patient_id} - {self.get_case_type_display()} [{self.get_priority_level_display()}]"


# =========================================================
# AUDIT & FEEDBACK LOG MODEL
# =========================================================

class ClinicalAuditLog(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='audit_logs',
    )

    model_name = models.CharField(
        max_length=100,
        default='IHMS-ClinicalInference-v2.1',
    )

    model_version = models.CharField(
        max_length=50,
        default='2.1.0',
    )

    input_features = models.JSONField(
        default=dict,
    )

    output_summary = models.JSONField(
        default=dict,
    )

    verification_status = models.CharField(
        max_length=50,
        default='auto_generated',
    )

    doctor_override = models.BooleanField(
        default=False,
    )

    doctor_notes = models.TextField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return f"{self.model_name} - {self.patient.patient_id} ({self.created_at})"