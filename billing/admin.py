from django.contrib import admin
from .models import Billing


@admin.register(Billing)
class BillingAdmin(admin.ModelAdmin):

    list_display = (
        'invoice',
        'patient',
        'total_amount',
        'payment_status',
        'payment_method',
        'generated_at',
    )

    search_fields = (
        'invoice',
        'patient__patient_id',
    )

    list_filter = (
        'payment_status',
        'payment_method',
        'generated_at',
    )

    readonly_fields = (
        'generated_at',
        'updated_at',
    )

    ordering = ('-generated_at',)

    list_per_page = 20

    date_hierarchy = 'generated_at'