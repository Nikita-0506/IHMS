import logging

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, filters, status

from django_filters.rest_framework import DjangoFilterBackend

from .models import Doctor
from .serializers import DoctorSerializer
from .permissions import (
    IsDoctor,
    IsAdminOrDoctor
)
from .services import (
    DoctorDashboardService,
    DoctorService
)

logger = logging.getLogger(__name__)


class DoctorDashboardAPIView(APIView):

    permission_classes = [IsDoctor]

    def get(self, request):

        logger.info(
            f'Doctor Dashboard Accessed By: {request.user.username}'
        )

        data = DoctorDashboardService.get_dashboard_data(
            request.user
        )

        return Response({
            "success": True,
            "data": data
        })


class DoctorListCreateView(generics.ListCreateAPIView):

    serializer_class = DoctorSerializer

    permission_classes = [IsAdminOrDoctor]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        'department',
        'specialization',
        'availability',
    ]

    search_fields = [
        'user__username',
        'specialization',
        'department',
    ]

    ordering_fields = [
        'experience_years',
        'consultation_fee',
        'created_at',
    ]

    def get_queryset(self):

        return DoctorService.get_all_doctors()

    def list(self, request, *args, **kwargs):

        queryset = self.filter_queryset(
            self.get_queryset()
        )

        serializer = self.get_serializer(
            queryset,
            many=True
        )

        return Response({
            "success": True,
            "message": "Doctors fetched successfully",
            "count": queryset.count(),
            "data": serializer.data
        })

    def perform_create(self, serializer):

        logger.info(
            f'Doctor Created By: {self.request.user.username}'
        )

        serializer.save(
            created_by=self.request.user,
            updated_by=self.request.user
        )