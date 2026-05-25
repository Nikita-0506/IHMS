from rest_framework.permissions import BasePermission


class IsAdminOrReceptionistRole(BasePermission):

    message = "Admin or receptionist access required."

    def has_permission(self, request, view):

        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ["admin", "receptionist"]
        )


class IsClinicalStaffRole(BasePermission):

    message = "Clinical staff access required."

    def has_permission(self, request, view):

        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ["admin", "doctor", "lab_staff", "pharmacist"]
        )
