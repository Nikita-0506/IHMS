import logging

from django.db import transaction
from django.utils import timezone

from appointments.models import (
    Appointment,
    AppointmentStatusHistory
)

logger = logging.getLogger(__name__)


class AppointmentService:
    """
    Enterprise-level Appointment Service Layer

    Handles:
    - Appointment business logic
    - Status tracking
    - Audit logging
    - Scheduling operations
    - Notification integration
    - Transaction management
    """

    @staticmethod
    @transaction.atomic
    def create_status_history(
        appointment: Appointment,
        old_status: str,
        new_status: str,
        user
    ) -> AppointmentStatusHistory:
        """
        Create appointment status history record.

        Args:
            appointment (Appointment):
                Appointment instance

            old_status (str):
                Previous appointment status

            new_status (str):
                Updated appointment status

            user:
                User who changed the status

        Returns:
            AppointmentStatusHistory
        """

        try:

            status_history = (
                AppointmentStatusHistory.objects.create(

                    appointment=appointment,

                    old_status=old_status,

                    new_status=new_status,

                    changed_by=user,

                    changed_at=timezone.now()
                )
            )

            logger.info(

                'Appointment status updated | '
                f'Appointment ID: {appointment.id} | '
                f'Old Status: {old_status} | '
                f'New Status: {new_status} | '
                f'Updated By: {user.username}'
            )

            return status_history

        except Exception as error:

            logger.error(

                'Failed to create appointment '
                f'status history | Error: {str(error)}'
            )

            raise error

    @staticmethod
    @transaction.atomic
    def soft_delete_appointment(
        appointment: Appointment,
        user
    ) -> Appointment:
        """
        Soft delete appointment.

        Args:
            appointment (Appointment):
                Appointment instance

            user:
                User performing delete

        Returns:
            Appointment
        """

        try:

            appointment.is_deleted = True

            appointment.updated_by = user

            appointment.save()

            logger.warning(

                'Appointment soft deleted | '
                f'Appointment ID: {appointment.id} | '
                f'Deleted By: {user.username}'
            )

            return appointment

        except Exception as error:

            logger.error(

                'Appointment deletion failed | '
                f'Appointment ID: {appointment.id} | '
                f'Error: {str(error)}'
            )

            raise error

    @staticmethod
    def validate_appointment_slot(
        doctor,
        appointment_date,
        appointment_time,
        appointment_id=None
    ) -> bool:
        """
        Validate doctor appointment slot.

        Prevents duplicate scheduling.
        """

        queryset = Appointment.objects.filter(

            doctor=doctor,

            date=appointment_date,

            time=appointment_time,

            is_deleted=False
        )

        if appointment_id:

            queryset = queryset.exclude(
                id=appointment_id
            )

        return not queryset.exists()