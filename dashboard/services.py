from django.db.models import Sum

from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment
from billing.models import Billing
from notifications.models import Notification
from ai_analysis.models import AIAnalysis


class DashboardMetricsService:

    @staticmethod
    def collect_global_metrics():

        total_revenue = Billing.objects.filter(
            is_deleted=False,
        ).aggregate(
            total=Sum('total_amount')
        )['total'] or 0

        return {
            'total_patients': Patient.active_objects.count(),
            'total_doctors': Doctor.objects.filter(is_deleted=False).count(),
            'total_appointments': Appointment.objects.filter(is_deleted=False).count(),
            'total_revenue': total_revenue,
            'emergency_cases': Appointment.objects.filter(
                is_deleted=False,
                status='emergency',
            ).count(),
            'ai_predictions': AIAnalysis.objects.count(),
            'active_users': Notification.objects.values('user_id').distinct().count(),
            'unread_notifications': Notification.objects.filter(is_read=False).count(),
        }
