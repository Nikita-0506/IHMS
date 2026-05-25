from .models import Doctor


class DoctorDashboardService:

    @staticmethod
    def get_dashboard_data(user):

        return {
            "message": "Welcome Doctor Dashboard",
            "doctor_name": user.username,
            "doctor_role": user.role,
        }


class DoctorService:

    @staticmethod
    def get_all_doctors():

        return Doctor.objects.filter(
            is_deleted=False
        )