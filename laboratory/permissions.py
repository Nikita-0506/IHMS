from rest_framework.permissions import BasePermission


class IsLabStaffOrAdmin(BasePermission):

    def has_permission(self, request, view):

        return request.user.role in [
            'admin',
            'lab_staff',
        ]


class IsLaboratoryReadableByRole(BasePermission):

    def has_permission(self, request, view):

        return request.user.role in [
            'admin',
            'lab_staff',
            'doctor',
            'patient',
        ]
