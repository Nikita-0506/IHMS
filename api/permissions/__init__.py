from .admin_permission import IsAdminRole
from .custom_permissions import IsAdminOrReceptionistRole, IsClinicalStaffRole
from .doctor_permission import IsDoctorRole
from .patient_permission import IsPatientRole
from .receptionist_permission import IsReceptionistRole

__all__ = [
    "IsAdminRole",
    "IsAdminOrReceptionistRole",
    "IsClinicalStaffRole",
    "IsDoctorRole",
    "IsPatientRole",
    "IsReceptionistRole",
]
