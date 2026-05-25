import uuid
from django.db import models

from accounts.models import User
from patients.models import Patient
from doctors.models import Doctor


# =========================================
# Laboratory Report Model
# =========================================

class LaboratoryReport(models.Model):

    REPORT_STATUS = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
    )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='lab_reports'
    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='doctor_lab_reports'
    )

    lab_staff = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'lab_staff'}
    )

    test_name = models.CharField(
        max_length=255
    )

    test_description = models.TextField(
        blank=True,
        null=True
    )

    report_file = models.FileField(
        upload_to='laboratory_reports/'
    )

    test_result = models.TextField(
        blank=True,
        null=True
    )

    ai_analysis_result = models.TextField(
        blank=True,
        null=True
    )

    report_status = models.CharField(
        max_length=50,
        choices=REPORT_STATUS,
        default='pending'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):

        return f"{self.patient} - {self.test_name}"