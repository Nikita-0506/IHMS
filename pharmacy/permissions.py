from rest_framework.permissions import BasePermission


class IsPharmacyManager(BasePermission):

    def has_permission(self, request, view):

        return request.user.role in [
            'admin',
            'pharmacist',
        ]


class IsPharmacyReadableByRole(BasePermission):

    def has_permission(self, request, view):

        return request.user.role in [
            'admin',
            'pharmacist',
            'doctor',
            'receptionist',
        ]
