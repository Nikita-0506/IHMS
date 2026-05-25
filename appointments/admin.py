from django.contrib import admin
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):

    list_display = (
        'patient',
        'doctor',
        'appointment_type',
        'date',
        'time',
        'status',
        'priority_level',
        'created_at',
    )

    search_fields = (
        'patient__patient_id',
        'doctor__user__username',
        'status',
    )

    list_filter = (
        'status',
        'appointment_type',
        'date',
    )

    ordering = ('-date', '-time')

    readonly_fields = (
        'created_at',
        'updated_at',
    )

    list_per_page = 20