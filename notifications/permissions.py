from rest_framework.permissions import BasePermission


class IsNotificationManager(BasePermission):

    def has_permission(self, request, view):

        return request.user.role == 'admin'


class IsNotificationReader(BasePermission):

    def has_permission(self, request, view):

        return request.user.role in [
            'admin',
            'doctor',
            'patient',
            'receptionist',
            'pharmacist',
            'lab_staff',
        ]


class IsNotificationOwnerOrAdmin(BasePermission):

    def has_object_permission(self, request, view, obj):

        return request.user.role == 'admin' or obj.user_id == request.user.id
