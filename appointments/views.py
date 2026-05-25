import logging

from django.db import transaction
from django.core.cache import cache
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter,OrderingFilter
from rest_framework.throttling import UserRateThrottle
from .models import Appointment,AppointmentStatusHistory
from .serializers import (AppointmentCreateSerializer,AppointmentListSerializer,AppointmentDetailSerializer,AppointmentUpdateSerializer)
from .pagination import AppointmentPagination
from .tasks import send_appointment_notification
from services.appointments.appointment_service import AppointmentService


# ==========================================
# LOGGER CONFIGURATION
# ==========================================

logger = logging.getLogger(__name__)


# ==========================================
# CUSTOM THROTTLE
# ==========================================

class AppointmentThrottle(UserRateThrottle):

    rate = '20/hour'


# ==========================================
# APPOINTMENT VIEWSET
# ==========================================

class AppointmentViewSet(viewsets.ModelViewSet):

    permission_classes = [IsAuthenticated]

    pagination_class = AppointmentPagination

    throttle_classes = [AppointmentThrottle]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        'status',
        'date',
        'doctor',
        'appointment_type',
    ]

    search_fields = [
        'patient__patient_id',
        'doctor__user__username',
        'symptoms',
    ]

    ordering_fields = [
        'date',
        'priority_level',
        'created_at',
    ]

    ordering = ['-date', '-time']

    def get_serializer_class(self):

     if self.action == 'list':

        return AppointmentListSerializer

     elif self.action == 'retrieve':

        return AppointmentDetailSerializer

     elif self.action == 'update' or self.action == 'partial_update':

        return AppointmentUpdateSerializer

     return AppointmentCreateSerializer

    # ==========================================
    # GET QUERYSET
    # ==========================================

    def get_queryset(self):

        cache_key = f'appointments_{self.request.user.id}'

        cached_queryset = cache.get(cache_key)

        if cached_queryset:

            return cached_queryset

        queryset = Appointment.objects.select_related(
            'patient',
            'doctor',
            'created_by',
            'updated_by'
        ).prefetch_related(
            'status_history'
        ).filter(
            is_deleted=False
        )

        user = self.request.user

        # ======================================
        # ADMIN ACCESS
        # ======================================

        if user.role == 'admin':

            final_queryset = queryset

        # ======================================
        # DOCTOR ACCESS
        # ======================================

        elif user.role == 'doctor':

            final_queryset = queryset.filter(
                doctor__user=user
            )

        # ======================================
        # PATIENT ACCESS
        # ======================================

        elif user.role == 'patient':

            final_queryset = queryset.filter(
                patient__user=user
            )

        # ======================================
        # NO ACCESS
        # ======================================

        else:

            final_queryset = queryset.none()

        # ======================================
        # CACHE QUERYSET
        # ======================================

        cache.set(
            cache_key,
            final_queryset,
            timeout=60
        )

        return final_queryset

    # ==========================================
    # CREATE APPOINTMENT
    # ==========================================

    @transaction.atomic
    def perform_create(self, serializer):

        appointment = serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user
        )
        # =====================================
        # SEND ASYNC EMAIL NOTIFICATION
        # =====================================

        send_appointment_notification.delay(
            appointment.patient.user.email
        )
        # ======================================
        # STATUS HISTORY TRACKING
        # ======================================

        AppointmentStatusHistory.objects.create(
            appointment=appointment,
            old_status='none',
            new_status=appointment.status,
            changed_by=self.request.user
        )

        # ======================================
        # LOGGER ENTRY
        # ======================================

        logger.info(
            f'Appointment created successfully '
            f'by {self.request.user.username}'
        )

        # ======================================
        # CLEAR CACHE
        # ======================================

        cache.clear()

        # ======================================
        # SEND EMAIL NOTIFICATION
        # ======================================

        send_appointment_notification.delay(
            appointment.patient.user.email
        )

    # ==========================================
    # UPDATE APPOINTMENT
    # ==========================================

    @transaction.atomic
    def perform_update(self, serializer):

        old_status = self.get_object().status

        appointment = serializer.save(
            updated_by=self.request.user
        )

        # ======================================
        # TRACK STATUS CHANGES
        # ======================================

        if old_status != appointment.status:

            AppointmentService.create_status_history(
                appointment=appointment,
                old_status=old_status,
                new_status=appointment.status,
                user=self.request.user
            )

            logger.info(
                f'Appointment status changed '
                f'from {old_status} '
                f'to {appointment.status}'
            )

        # ======================================
        # CLEAR CACHE
        # ======================================

        cache.clear()

    # ==========================================
    # SOFT DELETE APPOINTMENT
    # ==========================================

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):

        appointment = self.get_object()

        appointment.is_deleted = True

        appointment.updated_by = request.user

        appointment.save()

        # ======================================
        # SAVE DELETE HISTORY
        # ======================================

        AppointmentStatusHistory.objects.create(
            appointment=appointment,
            old_status=appointment.status,
            new_status='deleted',
            changed_by=request.user
        )

        # ======================================
        # LOGGER WARNING
        # ======================================

        logger.warning(
            f'Appointment soft deleted '
            f'by {request.user.username}'
        )

        # ======================================
        # CLEAR CACHE
        # ======================================

        cache.clear()

        return ResponseHandler.success(
            message='Appointment soft deleted successfully.',
            data={
                "appointment_id": str(appointment.id)
            },
            status_code=200
        )