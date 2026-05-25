from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from .permissions import IsDoctorOrAdmin
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import (SearchFilter,OrderingFilter)
from rest_framework.pagination import PageNumberPagination

from .models import Patient
from .serializers import PatientSerializer


# ==========================================
# Patient Dashboard API
# ==========================================

class PatientDashboardAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != 'patient':

            return Response({
                "error": "Only Patients Can Access This Page"
            }, status=status.HTTP_403_FORBIDDEN)

        return Response({
            "message": "Welcome To Patient Dashboard",
            "patient_name": request.user.username,
            "role": request.user.role
        })


# ==========================================
# Patient List + Create API
# ==========================================

class PatientPagination(PageNumberPagination):

    page_size = 10

    page_size_query_param = 'page_size'

    max_page_size = 100

class PatientListCreateView(generics.ListCreateAPIView):

    queryset = Patient.active_objects.select_related('user')
    serializer_class = PatientSerializer
    pagination_class = PatientPagination
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['gender', 'blood_group']
    search_fields = ['patient_id', 'user__username']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

# ==========================================
# Patient Detail API
# Retrieve + Update + Delete
# ==========================================

class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Patient.active_objects.select_related('user')

    serializer_class = PatientSerializer

    permission_classes = [IsAuthenticated, IsDoctorOrAdmin]

    def perform_destroy(self, instance):

        instance.is_deleted = True
        instance.save()