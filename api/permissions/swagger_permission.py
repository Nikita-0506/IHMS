from rest_framework.permissions import BasePermission


class IsSwaggerAdmin(BasePermission):

    message = 'Swagger documentation is only available for admin users.'

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        return bool(
            getattr(user, 'role', None) == 'admin'
            or getattr(user, 'is_staff', False)
            or getattr(user, 'is_superuser', False)
        )
