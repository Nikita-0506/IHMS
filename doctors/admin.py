from django.contrib import admin

from .models import Doctor


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):

    list_display = (
        'user',
        'specialization',
        'department',
        'availability',
        'experience_years',
        'consultation_fee',
        'is_active',
    )

    search_fields = (
        'user__username',
        'specialization',
        'department',
    )

    list_filter = (
        'specialization',
        'department',
        'availability',
        'is_active',
    )

    ordering = ('user',)

    readonly_fields = (
        'created_at',
        'updated_at',
    )