from rest_framework.permissions import BasePermission


class IsDoctorRole(BasePermission):

    message = "Doctor access required."

    def has_permission(self, request, view):

        return bool(request.user and request.user.is_authenticated and request.user.role == "doctor")
