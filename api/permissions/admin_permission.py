from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):

    message = "Administrator access required."

    def has_permission(self, request, view):

        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")
