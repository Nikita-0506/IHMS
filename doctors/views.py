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

    permission_classes = []

    def get(self, request):
        from .coordination_service import get_doctor_dashboard_kpis
        doctor = None
        if request.user.is_authenticated and hasattr(request.user, 'doctor_profile'):
            doctor = request.user.doctor_profile

        kpis = get_doctor_dashboard_kpis(doctor)

        return Response({
            "success": True,
            "message": "Doctor Workspace loaded successfully",
            "kpis": kpis,
            "metrics": {
                "today_patients": kpis['today_patients_count'],
                "waiting_for_review": kpis['waiting_review_count'],
                "pending_lab_results": kpis['pending_lab_count'],
                "upcoming_appointments": kpis['upcoming_appointments_count'],
            },
            "priority_queue": kpis['priority_queue'],
        }, status=status.HTTP_200_OK)


class DoctorCoordinationRosterAPIView(APIView):
    """View and update doctor availability, OPD shifts, and department capacity."""
    permission_classes = []

    def get(self, request):
        doctors = Doctor.objects.filter(is_deleted=False).select_related('user')
        dept_filter = request.GET.get('department')
        if dept_filter:
            doctors = doctors.filter(department__icontains=dept_filter)

        roster = []
        for d in doctors:
            roster.append({
                'id': str(d.id),
                'doctor_id': d.doctor_id or f"DOC-{str(d.id)[:4].upper()}",
                'name': f"Dr. {d.user.get_full_name() or d.user.username}",
                'specialization': d.specialization,
                'department': d.department,
                'qualification': d.qualification,
                'experience_years': d.experience_years,
                'availability': d.availability,
                'shift': d.get_shift_display() if hasattr(d, 'get_shift_display') else d.shift,
                'opd_timing': d.opd_timing,
                'room_number': d.room_number or "OPD",
                'current_queue_count': d.current_queue_count,
                'max_daily_patients': d.max_daily_patients,
                'utilization_percent': min(100, int((d.current_queue_count / max(1, d.max_daily_patients)) * 100)),
            })

        return Response({
            "success": True,
            "count": len(roster),
            "roster": roster,
        }, status=status.HTTP_200_OK)

    def post(self, request):
        doc_id = request.data.get('doctor_id')
        new_availability = request.data.get('availability')
        doctor = Doctor.objects.filter(Q(doctor_id=doc_id) | Q(id=doc_id)).first() if doc_id else None

        if not doctor:
            return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)

        if new_availability in ['available', 'busy', 'leave']:
            doctor.availability = new_availability
            doctor.save(update_fields=['availability', 'updated_at'])

        return Response({
            "success": True,
            "message": f"Availability updated to {doctor.availability} for Dr. {doctor.user.username}",
            "availability": doctor.availability,
        }, status=status.HTTP_200_OK)


class DoctorAssignmentRecommendAPIView(APIView):
    """
    AI Doctor Assignment Recommender:
    - Existing: continuity of care with previous doctor or covering doctor
    - New: triage & specialty matching
    - Transferred: receiving clinical intake team
    - Emergency: immediate bypass
    """
    permission_classes = []

    def get(self, request):
        return self._handle_recommend(request)

    def post(self, request):
        return self._handle_recommend(request)

    def _handle_recommend(self, request):
        from .coordination_service import recommend_doctor_for_patient
        from patients.models import Patient
        data = getattr(request, 'data', {}) or {}
        patient_id = data.get('patient_id') or request.GET.get('patient_id', 'P-10245')
        dept_hint = data.get('department') or request.GET.get('department')
        urgency = data.get('urgency') or request.GET.get('urgency', 'routine')

        patient = Patient.objects.filter(patient_id=patient_id).first()
        if not patient:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

        rec = recommend_doctor_for_patient(patient, dept_hint, urgency)
        doc = rec.get('recommended_doctor')

        doc_data = None
        if doc:
            doc_data = {
                'id': str(doc.id),
                'name': f"Dr. {doc.user.get_full_name() or doc.user.username}",
                'specialization': doc.specialization,
                'department': doc.department,
                'availability': doc.availability,
                'opd_timing': doc.opd_timing,
            }

        return Response({
            "patient_id": patient.patient_id,
            "patient_name": patient.user.get_full_name() or patient.user.username,
            "assignment_mode": rec['assignment_mode'],
            "recommended_doctor": doc_data,
            "department": rec['department'],
            "continuity_of_care": rec['continuity_of_care'],
            "reason": rec['reason'],
            "ai_confidence": rec['ai_confidence'],
            "requires_approval": rec['requires_approval'],
        }, status=status.HTTP_200_OK)


class ServiceRequestListCreateAPIView(APIView):
    """List or create coordinated service requests across Lab, Pharmacy, and Doctor consultation."""
    permission_classes = []

    def get(self, request):
        from .models import ServiceRequest
        from .serializers import ServiceRequestSerializer
        qs = ServiceRequest.objects.all().select_related('patient', 'patient__user', 'ordering_doctor', 'ordering_doctor__user')
        srv_type = request.GET.get('service_type')
        if srv_type:
            qs = qs.filter(service_type=srv_type)

        return Response({
            "count": qs.count(),
            "results": ServiceRequestSerializer(qs, many=True).data,
        }, status=status.HTTP_200_OK)

    def post(self, request):
        from .coordination_service import create_service_request
        from .serializers import ServiceRequestSerializer
        from patients.models import Patient

        patient_id = request.data.get('patient_id')
        patient = Patient.objects.filter(patient_id=patient_id).first()
        if not patient:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

        ordering_doctor = None
        doc_id = request.data.get('doctor_id')
        if doc_id:
            ordering_doctor = Doctor.objects.filter(Q(doctor_id=doc_id) | Q(id=doc_id)).first()

        service_type = request.data.get('service_type', 'consultation')
        department = request.data.get('department', 'General Medicine')
        details = request.data.get('details', 'Standard service request')
        priority = request.data.get('priority', 'routine')

        srv = create_service_request(
            patient=patient,
            ordering_doctor=ordering_doctor,
            service_type=service_type,
            department=department,
            details=details,
            priority=priority,
        )

        return Response({
            "message": f"Service request {srv.request_id} created successfully",
            "request": ServiceRequestSerializer(srv).data,
        }, status=status.HTTP_201_CREATED)


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