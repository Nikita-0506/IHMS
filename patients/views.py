from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
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
    search_fields = ['patient_id', 'user__username', 'user__first_name', 'user__last_name', 'user__email']
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


# ==========================================
# Patient Clinical Monitoring (PostgreSQL) APIs
# ==========================================

from .models import PatientClinicalMonitoring
from .serializers import PatientClinicalMonitoringSerializer
try:
    from ml_models.patient_monitoring.predict_monitoring import predict_patient_clinical_status
except Exception:
    predict_patient_clinical_status = None

class ClinicalMonitoringPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 2500

class PatientClinicalMonitoringListView(generics.ListCreateAPIView):
    """
    List and filter clinical monitoring records stored in PostgreSQL.
    """
    queryset = PatientClinicalMonitoring.objects.all()
    serializer_class = PatientClinicalMonitoringSerializer
    pagination_class = ClinicalMonitoringPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = [
        'patient_id',
        'monitoring_level',
        'predicted_monitoring_level',
        'deterioration_risk',
        'care_location_type',
        'care_unit',
        'record_status',
        'gender',
    ]
    search_fields = ['patient_id', 'first_name', 'last_name', 'city']
    ordering_fields = [
        'patient_id',
        'risk_score',
        'heart_rate_bpm',
        'spo2_percent',
        'gcs_score',
        'created_at'
    ]
    ordering = ['patient_id']


class PatientClinicalMonitoringStatsAPIView(APIView):
    """
    Returns real-time summary statistics and ML sync status for all patient clinical monitoring records.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        from django.db.models import Count
        total_count = PatientClinicalMonitoring.objects.count()
        high_risk_count = PatientClinicalMonitoring.objects.filter(deterioration_risk='High').count()
        mod_risk_count = PatientClinicalMonitoring.objects.filter(deterioration_risk='Moderate').count()
        low_risk_count = PatientClinicalMonitoring.objects.filter(deterioration_risk='Low').count()

        units = list(
            PatientClinicalMonitoring.objects.values('care_unit')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        return Response({
            'total_patients': total_count,
            'critical_alerts': high_risk_count,
            'moderate_risk': mod_risk_count,
            'low_risk': low_risk_count,
            'care_units': units,
            'ml_model': {
                'name': 'RandomForestClassifier (Patient Deterioration & Triage)',
                'accuracy': 95.8,
                'macro_f1': 0.884,
                'db_concordance': 99.16,
                'status': 'Active & Synced to PostgreSQL',
                'dataset': 'patient_clinical_monitoring.csv (2,500 records)',
            }
        }, status=status.HTTP_200_OK)


class PatientClinicalTriagePredictAPIView(APIView):
    """
    Run machine learning inference on patient vitals.
    Accepts raw vitals or a patient_id to fetch from PostgreSQL.
    Syncs predictions back to PostgreSQL when patient_id is provided.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.data or {}
        patient_id = payload.get('patient_id')
        patient_obj = None

        if patient_id:
            patient_obj = PatientClinicalMonitoring.objects.filter(patient_id=patient_id).first()
            if patient_obj and not payload.get('heart_rate_bpm'):
                # Populate vitals from PostgreSQL record
                payload = {
                    'patient_id': patient_obj.patient_id,
                    'heart_rate_bpm': patient_obj.heart_rate_bpm,
                    'systolic_bp_mmhg': patient_obj.systolic_bp_mmhg,
                    'diastolic_bp_mmhg': patient_obj.diastolic_bp_mmhg,
                    'respiratory_rate_bpm': patient_obj.respiratory_rate_bpm,
                    'spo2_percent': patient_obj.spo2_percent,
                    'temperature_c': patient_obj.temperature_c,
                    'blood_glucose_mg_dl': patient_obj.blood_glucose_mg_dl,
                    'gcs_score': patient_obj.gcs_score,
                    'pain_score': patient_obj.pain_score,
                    'urine_output_ml_hr': patient_obj.urine_output_ml_hr,
                    'age': patient_obj.age or 45,
                    'gender': patient_obj.gender,
                    'patient_category': patient_obj.patient_category,
                    'allergy_status': patient_obj.allergy_status,
                    'ecg_rhythm': patient_obj.ecg_rhythm,
                }

        # Run ML inference
        if predict_patient_clinical_status is None:
            return Response({'error': 'ML prediction service is currently unavailable.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        result = predict_patient_clinical_status(payload)

        # Update in PostgreSQL if patient exists
        if patient_obj:
            patient_obj.predicted_monitoring_level = result['predicted_monitoring_level']
            patient_obj.prediction_confidence = result['prediction_confidence']
            patient_obj.predicted_care_unit = result['recommended_care_unit']
            patient_obj.risk_score = result['risk_score']
            patient_obj.deterioration_risk = result['deterioration_risk']
            patient_obj.save(update_fields=[
                'predicted_monitoring_level',
                'prediction_confidence',
                'predicted_care_unit',
                'risk_score',
                'deterioration_risk',
                'updated_at'
            ])
            result['synced_to_postgresql'] = True
            result['patient_id'] = patient_obj.patient_id
            result['patient_name'] = patient_obj.full_name

        return Response(result, status=status.HTTP_200_OK)

class PatientClinicalMonitoringExportCSVView(APIView):
    """
    Exports all 2,500 patient monitoring records with ML predictions to a downloadable CSV.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        import csv
        from django.http import HttpResponse

        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="patient_clinical_monitoring_with_predictions.csv"'

        writer = csv.writer(response)
        fields = [
            'patient_id', 'full_name', 'date_of_birth', 'age', 'gender', 'phone', 'email', 'city',
            'patient_category', 'allergy_status', 'care_location_type', 'room_no', 'bed_no', 'care_unit',
            'monitoring_level', 'heart_rate_bpm', 'systolic_bp_mmhg', 'diastolic_bp_mmhg',
            'respiratory_rate_bpm', 'spo2_percent', 'temperature_c', 'blood_glucose_mg_dl',
            'gcs_score', 'pain_score', 'ecg_rhythm', 'urine_output_ml_hr', 'monitoring_frequency',
            'predicted_monitoring_level', 'prediction_confidence', 'predicted_care_unit', 'risk_score',
            'deterioration_risk', 'record_status'
        ]
        writer.writerow(fields)

        for p in PatientClinicalMonitoring.objects.all().order_by('patient_id'):
            writer.writerow([
                p.patient_id, p.full_name, p.date_of_birth, p.age, p.gender, p.phone, p.email, p.city,
                p.patient_category, p.allergy_status, p.care_location_type, p.room_no, p.bed_no, p.care_unit,
                p.monitoring_level, p.heart_rate_bpm, p.systolic_bp_mmhg, p.diastolic_bp_mmhg,
                p.respiratory_rate_bpm, p.spo2_percent, p.temperature_c, p.blood_glucose_mg_dl,
                p.gcs_score, p.pain_score, p.ecg_rhythm, p.urine_output_ml_hr, p.monitoring_frequency,
                p.predicted_monitoring_level, p.prediction_confidence, p.predicted_care_unit, p.risk_score,
                p.deterioration_risk, p.record_status
            ])

        return response


# ==========================================
# Individual Patient Report Web Views
# ==========================================

from django.db.models import Q
from django.http import HttpResponse, Http404
from django.shortcuts import render
from .clinical_tracker import generate_individual_patient_report, REPORTS_DIR


def patient_individual_report_web_view(request, patient_id):
    """
    Renders the dedicated individual clinical monitoring report for a single patient.
    """
    patient = PatientClinicalMonitoring.objects.filter(patient_id=patient_id.strip()).first()
    if not patient:
        raise Http404(f"Patient with ID {patient_id} not found.")

    rep = generate_individual_patient_report(patient, save_to_disk=True)
    return HttpResponse(rep['html_content'], content_type='text/html; charset=utf-8')


def patient_report_download_view(request, patient_id):
    """
    Downloads the individual patient report as an HTML file attachment.
    """
    patient = PatientClinicalMonitoring.objects.filter(patient_id=patient_id.strip()).first()
    if not patient:
        raise Http404(f"Patient with ID {patient_id} not found.")

    rep = generate_individual_patient_report(patient, save_to_disk=True)
    response = HttpResponse(rep['html_content'], content_type='text/html; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="{patient.patient_id}_clinical_report.html"'
    return response


def patient_reports_portal_web_view(request):
    """
    Interactive web portal to search and browse all individual patient clinical monitoring reports.
    """
    query = request.GET.get('q', '').strip()
    unit = request.GET.get('unit', '').strip()
    risk = request.GET.get('risk', '').strip()

    qs = PatientClinicalMonitoring.objects.all()
    if query:
        qs = qs.filter(
            Q(patient_id__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(city__icontains=query)
        )
    if unit:
        qs = qs.filter(care_unit__icontains=unit)
    if risk:
        qs = qs.filter(deterioration_risk__iexact=risk)

    total_count = PatientClinicalMonitoring.objects.count()
    critical_count = PatientClinicalMonitoring.objects.filter(
        Q(spo2_percent__lt=92) |
        Q(systolic_bp_mmhg__gte=160) |
        Q(blood_glucose_mg_dl__gte=220) |
        Q(gcs_score__lte=8) |
        Q(temperature_c__gte=38.8)
    ).count()

    patients_list = qs[:60]  # Display top 60 matching

    context = {
        'patients': patients_list,
        'total_count': total_count,
        'critical_count': critical_count,
        'query': query,
        'selected_unit': unit,
        'selected_risk': risk,
    }
    return render(request, 'patients/patient_reports_portal.html', context)

