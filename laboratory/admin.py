from django.contrib import admin
from .models import LaboratoryReport


@admin.register(LaboratoryReport)
class LaboratoryReportAdmin(admin.ModelAdmin):

    list_display = (
        'id',
        'patient',
        'doctor',
        'lab_staff',
        'test_name',
        'report_status',
        'created_at',
    )

    search_fields = (
        'id',
        'patient__patient_id',
        'patient__user__username',
        'test_name',
    )

    list_filter = (
        'report_status',
        'created_at',
    )

    ordering = ('-created_at',)

    list_select_related = (
        'patient',
        'patient__user',
        'doctor',
        'doctor__user',
        'lab_staff',
    )

    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )