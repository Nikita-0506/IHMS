from rest_framework.permissions import BasePermission


class IsAIAnalysisStaff(BasePermission):

    def has_permission(self, request, view):

        return request.user.role in [
            'admin',
            'doctor',
            'lab_staff',
        ]


class IsPatientOrAIAnalysisStaff(BasePermission):

    def has_permission(self, request, view):

        return request.user.role in [
            'admin',
            'doctor',
            'lab_staff',
            'patient',
        ]
