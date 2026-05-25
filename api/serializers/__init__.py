from .ai_analysis_serializer import AIAnalysisSerializer
from .appointment_serializer import (
    AppointmentCreateSerializer,
    AppointmentDetailSerializer,
    AppointmentListSerializer,
    AppointmentUpdateSerializer,
)
from .auth_serializer import AuthRegisterSerializer
from .billing_serializer import BillingSerializer
from .dashboard_serializer import DashboardAnalyticsSerializer
from .doctor_serializer import DoctorSerializer
from .laboratory_serializer import LaboratoryReportSerializer
from .notification_serializer import NotificationSerializer
from .patient_serializer import PatientSerializer
from .pharmacy_serializer import MedicineSerializer

__all__ = [
    "AIAnalysisSerializer",
    "AppointmentCreateSerializer",
    "AppointmentDetailSerializer",
    "AppointmentListSerializer",
    "AppointmentUpdateSerializer",
    "AuthRegisterSerializer",
    "BillingSerializer",
    "DashboardAnalyticsSerializer",
    "DoctorSerializer",
    "LaboratoryReportSerializer",
    "MedicineSerializer",
    "NotificationSerializer",
    "PatientSerializer",
]
