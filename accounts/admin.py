from django.contrib import admin
from django.contrib import messages
from django.contrib.auth.admin import UserAdmin
from django.http import HttpResponseRedirect
from django.urls import reverse
from .models import User, UserLoginActivity


@admin.register(User)
class UserAdmin(UserAdmin):

    actions = ('edit_selected_user',)

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

    @admin.action(description='Edit selected user details')
    def edit_selected_user(self, request, queryset):
        selected_count = queryset.count()

        if selected_count != 1:
            self.message_user(
                request,
                'Please select exactly one user to open the edit page.',
                level=messages.WARNING,
            )
            return None

        selected_user = queryset.first()
        change_url = reverse('admin:accounts_user_change', args=[selected_user.pk])
        return HttpResponseRedirect(change_url)

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