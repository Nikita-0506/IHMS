from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import LaboratoryReport
from .pagination import LaboratoryReportPagination
from .permissions import IsLaboratoryReadableByRole, IsLabStaffOrAdmin
from .serializers import LaboratoryReportSerializer

class LaboratoryAPIView(APIView):

    permission_classes = [IsAuthenticated, IsLaboratoryReadableByRole]

    def get(self, request):

        queryset = LaboratoryReport.objects.all()

        if request.user.role == 'patient':

            patient_profile = getattr(request.user, 'patient_profile', None)

            if patient_profile:

                queryset = queryset.filter(patient=patient_profile)

            else:

                queryset = queryset.none()

        elif request.user.role == 'doctor':

            doctor_profile = getattr(request.user, 'doctor_profile', None)

            if doctor_profile:

                queryset = queryset.filter(doctor=doctor_profile)

            else:

                queryset = queryset.none()

        elif request.user.role == 'lab_staff':

            queryset = queryset.filter(lab_staff=request.user)

        return Response({
            "message": "Laboratory dashboard loaded successfully",
            "total_reports": queryset.count(),
        }, status=status.HTTP_200_OK)


class LaboratoryReportListCreateView(generics.ListCreateAPIView):

    serializer_class = LaboratoryReportSerializer

    pagination_class = LaboratoryReportPagination

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        'report_status',
        'patient',
        'doctor',
        'lab_staff',
    ]

    search_fields = [
        'test_name',
        'patient__patient_id',
        'patient__user__username',
    ]

    ordering_fields = [
        'created_at',
        'updated_at',
    ]

    ordering = ['-created_at']

    def get_permissions(self):

        if self.request.method == 'POST':

            return [IsAuthenticated(), IsLabStaffOrAdmin()]

        return [IsAuthenticated(), IsLaboratoryReadableByRole()]

    def get_queryset(self):

        queryset = LaboratoryReport.objects.select_related(
            'patient',
            'patient__user',
            'doctor',
            'doctor__user',
            'lab_staff',
        )

        if self.request.user.role == 'patient':

            patient_profile = getattr(self.request.user, 'patient_profile', None)

            if not patient_profile:

                return queryset.none()

            return queryset.filter(patient=patient_profile)

        if self.request.user.role == 'doctor':

            doctor_profile = getattr(self.request.user, 'doctor_profile', None)

            if not doctor_profile:

                return queryset.none()

            return queryset.filter(doctor=doctor_profile)

        if self.request.user.role == 'lab_staff':

            return queryset.filter(lab_staff=self.request.user)

        return queryset

    def perform_create(self, serializer):

        if self.request.user.role == 'lab_staff':

            serializer.save(lab_staff=self.request.user)

            return

        serializer.save()


class LaboratoryReportDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = LaboratoryReportSerializer

    def get_permissions(self):

        if self.request.method in ['PUT', 'PATCH', 'DELETE']:

            return [IsAuthenticated(), IsLabStaffOrAdmin()]

        return [IsAuthenticated(), IsLaboratoryReadableByRole()]

    def get_queryset(self):

        queryset = LaboratoryReport.objects.select_related(
            'patient',
            'patient__user',
            'doctor',
            'doctor__user',
            'lab_staff',
        )

        if self.request.user.role == 'patient':

            patient_profile = getattr(self.request.user, 'patient_profile', None)

            if not patient_profile:

                return queryset.none()

            return queryset.filter(patient=patient_profile)

        if self.request.user.role == 'doctor':

            doctor_profile = getattr(self.request.user, 'doctor_profile', None)

            if not doctor_profile:

                return queryset.none()

            return queryset.filter(doctor=doctor_profile)

        if self.request.user.role == 'lab_staff':

            return queryset.filter(lab_staff=self.request.user)

        return queryset