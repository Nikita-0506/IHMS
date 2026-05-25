from django.contrib import admin
from .models import Patient, PatientReport, PatientAuditLog


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):

    list_display = (
        'patient_id',
        'user',
        'blood_group',
        'gender',
        'created_at'
    )

    search_fields = (
        'patient_id',
        'user__username',
        'blood_group'
    )

    list_filter = (
        'gender',
        'blood_group'
    )

    ordering = ('-created_at',)


@admin.register(PatientReport)
class PatientReportAdmin(admin.ModelAdmin):

    list_display = (
        'patient',
        'report_type',
        'uploaded_at'
    )

@admin.register(PatientAuditLog)
class PatientAuditLogAdmin(admin.ModelAdmin):

    list_display = (
        'patient',
        'updated_by',
        'action',
        'timestamp'
    )

    list_filter = (
        'action',
    )

    search_fields = (
        'patient__patient_id',
        'updated_by__username',
    )