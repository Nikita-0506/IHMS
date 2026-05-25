from django.contrib import admin
from .models import Medicine


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):

    list_display = (
        'medicine_name',
        'price',
        'quantity',
        'manufacturer',
        'expiry_date',
        'created_at',
    )

    search_fields = (
        'medicine_name',
    )

    list_filter = (
        'expiry_date',
        'created_at',
    )

    ordering = ('medicine_name',)

    readonly_fields = (
        'id',
        'created_at',
    )