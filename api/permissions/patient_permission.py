from rest_framework.permissions import BasePermission


class IsPatientRole(BasePermission):

    message = "Patient access required."

    def has_permission(self, request, view):

        return bool(request.user and request.user.is_authenticated and request.user.role == "patient")
