from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserLoginActivity


@admin.register(User)
class UserAdmin(UserAdmin):

    list_display = (
        'username',
        'email',
        'role',
        'phone_number',
        'is_verified',
        'is_active',
        'created_at',
    )

    search_fields = (
        'username',
        'email',
        'role',
    )

    list_filter = (
        'role',
        'is_active',
        'is_verified',
    )

    ordering = ('-created_at',)

    readonly_fields = (
        'created_at',
        'updated_at',
        'last_login',
    )

    list_per_page = 20

    fieldsets = (

        ('Authentication Info', {
            'fields': (
                'username',
                'email',
                'password',
                'role',
            )
        }),

        ('Personal Information', {
            'fields': (
                'phone_number',
                'gender',
                'date_of_birth',
                'address',
                'profile_image',
            )
        }),

        ('Verification & Status', {
            'fields': (
                'is_verified',
                'is_active',
                'is_staff',
                'is_superuser',
            )
        }),

        ('Important Dates', {
            'fields': (
                'last_login',
                'created_at',
                'updated_at',
            )
        }),
    )

@admin.register(UserLoginActivity)
class UserLoginActivityAdmin(admin.ModelAdmin):

    list_display = (
        'user',
        'ip_address',
        'device',
        'browser',
        'login_time',
    )

    search_fields = (
        'user__email',
        'ip_address',
    )

    list_filter = (
        'login_time',
    )