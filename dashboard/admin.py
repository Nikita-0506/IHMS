from django.contrib import admin
from .models import DashboardAnalytics


@admin.register(DashboardAnalytics)
class DashboardAnalyticsAdmin(admin.ModelAdmin):

    list_display = (
        'user',
        'total_patients',
        'total_doctors',
        'total_appointments',
        'total_revenue',
        'updated_at',
    )

    search_fields = (
        'user__email',
        'user__username',
    )

    list_filter = (
        'created_at',
        'updated_at',
    )

    ordering = ('-updated_at',)

    list_select_related = ('user',)

    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )