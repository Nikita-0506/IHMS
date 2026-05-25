from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):

    list_display = (
        'title',
        'user',
        'notification_type',
        'priority',
        'delivery_status',
        'is_read',
        'created_at',
    )

    search_fields = (
        'title',
        'user__username',
        'user__email',
        'message',
    )

    list_filter = (
        'notification_type',
        'priority',
        'delivery_status',
        'is_read',
        'created_at',
    )

    ordering = ('-created_at',)

    list_select_related = ('user',)

    readonly_fields = (
        'id',
        'created_at',
        'updated_at',
    )