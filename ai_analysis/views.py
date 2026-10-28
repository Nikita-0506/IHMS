import logging

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import AIAnalysis, MedicalDocument, AIClinicalSummary, ClinicalAuditLog
from .serializers import (
    AIAnalysisSerializer,
    MedicalDocumentSerializer,
    AIClinicalSummarySerializer,
    ClinicalAuditLogSerializer,
)
from .permissions import IsAIAnalysisStaff, IsPatientOrAIAnalysisStaff
from patients.models import Patient
from doctors.models import Doctor
from .ocr_scanner.document_ocr import ClinicalDocumentOCRScanner
from .inference.clinical_inference import ClinicalInferenceEngine


logger = logging.getLogger(__name__)

class AIAnalysisAPIView(APIView):

    permission_classes = [IsAuthenticated, IsAIAnalysisStaff]

    def get(self, request):

        total_analyses = AIAnalysis.objects.count()

        return Response({
            "message": "AI Analysis dashboard loaded successfully",
            "user": request.user.username,
            "total_analyses": total_analyses,
        }, status=status.HTTP_200_OK)


class AIAnalysisListCreateView(generics.ListCreateAPIView):

    serializer_class = AIAnalysisSerializer

    permission_classes = [IsAuthenticated, IsPatientOrAIAnalysisStaff]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        'patient',
        'disease_prediction',
        'mental_health_result',
    ]

    search_fields = [
        'patient__patient_id',
        'patient__user__username',
        'disease_prediction',
        'mental_health_result',
    ]

    ordering_fields = [
        'confidence_score',
        'voice_stress_score',
        'created_at',
    ]

    ordering = ['-created_at']

    def get_queryset(self):

        queryset = AIAnalysis.objects.select_related(
            'patient',
            'patient__user',
        )

        if self.request.user.role == 'patient':

            patient_profile = getattr(
                self.request.user,
                'patient_profile',
                None,
            )

            if not patient_profile:

                return queryset.none()

            return queryset.filter(patient=patient_profile)

        return queryset

    def perform_create(self, serializer):

        if self.request.user.role == 'patient':

            patient_profile = getattr(
                self.request.user,
                'patient_profile',
                None,
            )

            if not patient_profile:

                raise PermissionDenied(
                    'Patient profile not found for current user.'
                )

            serializer.save(patient=patient_profile)

            logger.info(
                'AI analysis created by patient user %s',
                self.request.user.username,
            )

            return

        serializer.save()

        logger.info(
            'AI analysis created by staff user %s',
            self.request.user.username,
        )


class AIAnalysisDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = AIAnalysisSerializer

    permission_classes = [IsAuthenticated, IsPatientOrAIAnalysisStaff]

    def get_queryset(self):

        queryset = AIAnalysis.objects.select_related(
            'patient',
            'patient__user',
        )

        if self.request.user.role == 'patient':

            patient_profile = getattr(
                self.request.user,
                'patient_profile',
                None,
            )

            if not patient_profile:

                return queryset.none()

            return queryset.filter(patient=patient_profile)

        return queryset


class AIAnalysisView(AIAnalysisListCreateView):
    """Backward-compatible alias used in existing URL imports."""


# =========================================================
# 1. DOCTOR VIEW DASHBOARD (With Rahul Patil & Priority Queue)
# =========================================================

class DoctorViewDashboardAPIView(APIView):
    """
    Doctor View Dashboard:
    Example Patient: Rahul Patil (P-10245, Age: 42, Male)
    Priority: High Priority (Urgent)
    Current Condition: Fever with dehydration concern
    Previous Treatment: Available — 3 visits
    Next Action: Doctor review required
    AI Clinical Summary & 3 Tabs: 1. History, 2. OCR Reports, 3. Vitals
    """
    permission_classes = []  # Allow flexible access for UI and API clients

    def get(self, request):
        pid = request.GET.get('patient_id', 'P-10245')
        patient = Patient.objects.filter(patient_id=pid, is_deleted=False).select_related('user', 'assigned_doctor', 'assigned_doctor__user').first()

        if not patient:
            patient = Patient.objects.filter(is_deleted=False).select_related('user', 'assigned_doctor', 'assigned_doctor__user').first()

        if not patient:
            return Response({"error": "No patient records found."}, status=status.HTTP_404_NOT_FOUND)

        # Assigned Doctor details
        assigned_doc_name = 'Dr. Amit Sharma'
        assigned_doc_dept = 'General Medicine (Room 102)'
        if patient.assigned_doctor and patient.assigned_doctor.user:
            assigned_doc_name = f"Dr. {patient.assigned_doctor.user.get_full_name()}"
            assigned_doc_dept = f"{patient.assigned_doctor.department} ({patient.assigned_doctor.specialization})"

        # Patient profiles mapping
        patient_profiles = {
            'P-10245': {
                'age': 42,
                'previous_treatment': 'Available — 3 visits',
                'next_action': 'Doctor review required (Hydration & antipyretic protocol)',
                'ai_clinical_summary_lead': 'Patient has a previous treatment record. Review the current symptoms, recorded vital signs, allergies and medication history before deciding the next step.',
                'history_diagnoses': [
                    'Visit 1 (14-May-2024): Acute viral bronchitis with fever. Treated with Azithromycin. Resolved completely.',
                    'Visit 2 (08-Nov-2025): Dyspepsia / Epigastric distress. Started on Pantoprazole 40mg. Follow-up stable.',
                    'Visit 3 (Today): Acute febrile illness (3 days) with chills, nausea, and marked dehydration concern.',
                ],
                'allergies': 'Penicillin (Severe cutaneous urticaria / anaphylaxis risk)',
                'medications': [
                    {'name': 'Pantoprazole 40mg', 'dose': '1 Tablet OD (Before breakfast)', 'status': 'Active'},
                    {'name': 'Oral Rehydration Solution (ORS)', 'dose': '500ml oral sips as tolerated', 'status': 'Active'},
                    {'name': 'Paracetamol 650mg', 'dose': '1 Tablet SOS (Temp > 100°F)', 'status': 'Active'},
                ],
                'trend': 'worsened',
                'trend_display': 'Worsened from baseline afebrile state to 102.4°F with dehydration and sinus tachycardia.',
                'vitals': {
                    'temperature': {'value': '102.4 °F', 'status': 'Febrile High', 'flag': 'urgent'},
                    'blood_pressure': {'value': '118/76 mmHg', 'status': 'Normotensive', 'flag': 'stable'},
                    'heart_rate': {'value': '104 bpm', 'status': 'Sinus Tachycardia', 'flag': 'urgent'},
                    'spo2': {'value': '97%', 'status': 'Adequate Saturation', 'flag': 'stable'},
                    'respiratory_rate': {'value': '20 /min', 'status': 'Mildly Elevated', 'flag': 'stable'},
                    'secondary_metric': {'label': 'HYDRATION STATUS', 'value': 'Dry Mucosa', 'status': 'Dehydration Risk', 'flag': 'urgent'},
                },
            },
            'P-10246': {
                'age': 29,
                'previous_treatment': 'Available — 1 visit (External referral)',
                'next_action': 'Cardiology consult & Serial Troponin-I rule-out',
                'ai_clinical_summary_lead': 'Referred patient with acute retrosternal chest heaviness. Prioritize serial cardiac enzymes, ECG changes, and avoid Aspirin due to recorded allergy.',
                'history_diagnoses': [
                    'Childhood Mild Bronchial Asthma (Managed on intermittent inhaler)',
                    '12-Oct-2026: Referred urgently from Ruby Hall Clinic for evaluation of exertional retrosternal discomfort',
                    'Today: Borderline Troponin-I elevation (0.04 ng/mL) with subtle ST depression in V4-V6',
                ],
                'allergies': 'Sulfa Drugs (Erythema multiforme), Aspirin / NSAIDs (Triggers bronchospasm)',
                'medications': [
                    {'name': 'Budesonide/Formoterol Inhaler', 'dose': '200/6 mcg 1-2 puffs PRN', 'status': 'Active'},
                    {'name': 'Clopidogrel 75mg', 'dose': '1 Tablet OD (Antiplatelet alternative)', 'status': 'Active'},
                    {'name': 'Atorvastatin 40mg', 'dose': '1 Tablet HS (Cardioprotective)', 'status': 'Active'},
                ],
                'trend': 'urgent',
                'trend_display': 'Acute retrosternal heaviness lasting 45 mins; Troponin borderline (0.04 ng/mL).',
                'vitals': {
                    'temperature': {'value': '98.6 °F', 'status': 'Afebrile (Normal)', 'flag': 'stable'},
                    'blood_pressure': {'value': '136/88 mmHg', 'status': 'Stage 1 Hypertension', 'flag': 'warning'},
                    'heart_rate': {'value': '92 bpm', 'status': 'High Normal', 'flag': 'warning'},
                    'spo2': {'value': '96%', 'status': 'Normal Saturation', 'flag': 'stable'},
                    'respiratory_rate': {'value': '18 /min', 'status': 'Normal Eupneic', 'flag': 'stable'},
                    'secondary_metric': {'label': 'CARDIAC STATUS', 'value': 'ST Changes V4-V6', 'status': 'Ischemia Alert', 'flag': 'urgent'},
                },
            },
            'P-10247': {
                'age': 55,
                'previous_treatment': 'Available — 6 regular visits',
                'next_action': 'Routine prescription renewal & lifestyle reinforcement',
                'ai_clinical_summary_lead': 'Routine chronic care follow-up for Hypertension and Dyslipidemia. Vital signs and glycemic targets stable. No acute interventions required.',
                'history_diagnoses': [
                    '2021: Essential Hypertension diagnosed; stabilized on Telmisartan 40mg',
                    '2023: Mixed Dyslipidemia; LDL target achieved with Atorvastatin 10mg',
                    'Today: Routine quarterly health review; asymptomatic, optimal blood pressure control',
                ],
                'allergies': 'No Known Drug Allergies (NKDA)',
                'medications': [
                    {'name': 'Telmisartan 40mg', 'dose': '1 Tablet OD (Morning)', 'status': 'Active'},
                    {'name': 'Metformin 500mg', 'dose': '1 Tablet BD (After meals)', 'status': 'Active'},
                    {'name': 'Atorvastatin 10mg', 'dose': '1 Tablet HS (Night)', 'status': 'Active'},
                ],
                'trend': 'stable',
                'trend_display': 'Chronic parameters well-controlled; blood pressure 132/84 mmHg, HbA1c 6.8% at target.',
                'vitals': {
                    'temperature': {'value': '98.4 °F', 'status': 'Normothermic', 'flag': 'stable'},
                    'blood_pressure': {'value': '132/84 mmHg', 'status': 'Controlled on Regimen', 'flag': 'stable'},
                    'heart_rate': {'value': '72 bpm', 'status': 'Normal Sinus Rhythm', 'flag': 'stable'},
                    'spo2': {'value': '99%', 'status': 'Optimal Saturation', 'flag': 'stable'},
                    'respiratory_rate': {'value': '16 /min', 'status': 'Normal Eupneic', 'flag': 'stable'},
                    'secondary_metric': {'label': 'GLYCEMIC CONTROL', 'value': 'HbA1c 6.8%', 'status': 'Target Achieved', 'flag': 'stable'},
                },
            },
            'P-10248': {
                'age': 34,
                'previous_treatment': 'None (Emergency trauma arrival)',
                'next_action': 'Immediate Chest Tube Insertion (32 Fr) & Emergency OT Transfer',
                'ai_clinical_summary_lead': 'CRITICAL TRAUMA ALERT: Severe hypoxia and acute hemothorax post-collision. Immediate resuscitation, chest decompression, and blood transfusion mandated.',
                'history_diagnoses': [
                    'No previous hospital records available on file',
                    'Today: High-impact motor vehicle collision with blunt thoracic trauma',
                    'EMS 108 Transfer: Severe respiratory distress, hypoxia, right hemothorax on bedside ultrasound',
                ],
                'allergies': 'Unknown (Emergency Trauma protocol — assume anaphylaxis precaution)',
                'medications': [
                    {'name': 'Normal Saline 0.9%', 'dose': 'Rapid IV Infusion (Wide bore 14G cannula)', 'status': 'STAT Active'},
                    {'name': 'Tranexamic Acid (TXA)', 'dose': '1g IV over 10 mins (Antifibrinolytic)', 'status': 'STAT Active'},
                    {'name': 'Fentanyl', 'dose': '50 mcg IV (Analgesia for tube thoracostomy)', 'status': 'STAT Active'},
                ],
                'trend': 'critical',
                'trend_display': 'Acute trauma decompensation post-collision; impending shock with SpO2 88% and BP 90/60.',
                'vitals': {
                    'temperature': {'value': '97.8 °F', 'status': 'Hypothermia Precaution', 'flag': 'warning'},
                    'blood_pressure': {'value': '90/60 mmHg', 'status': 'Hypotension (Shock Risk)', 'flag': 'urgent'},
                    'heart_rate': {'value': '128 bpm', 'status': 'Severe Tachycardia', 'flag': 'urgent'},
                    'spo2': {'value': '88%', 'status': 'CRITICAL HYPOXIA', 'flag': 'critical'},
                    'respiratory_rate': {'value': '28 /min', 'status': 'Tachypnea (Distress)', 'flag': 'critical'},
                    'secondary_metric': {'label': 'SHOCK INDEX', 'value': '1.42 (Critical)', 'status': 'Impending Shock', 'flag': 'critical'},
                },
            },
        }

        profile = patient_profiles.get(patient.patient_id, patient_profiles['P-10245'])

        # 1. History tab data
        history_data = {
            'patient_type': patient.get_patient_type_display(),
            'care_status': patient.get_care_status_display(),
            'referral_status': patient.get_referral_status_display(),
            'previous_visits_count': 3 if patient.patient_id == 'P-10245' else (1 if patient.patient_id == 'P-10246' else (6 if patient.patient_id == 'P-10247' else 0)),
            'previous_diagnoses': profile['history_diagnoses'],
            'allergies': profile['allergies'],
            'current_medications': profile['medications'],
            'trend': profile['trend'],
            'trend_display': profile['trend_display'],
            'previous_treatment_plan': profile.get('previous_treatment', 'Standard clinical management.'),
            'pending_follow_ups': profile.get('next_action', 'Doctor review scheduled.'),
        }

        # 2. OCR Reports tab data
        ocr_docs = MedicalDocument.objects.filter(patient=patient).order_by('-created_at')
        ocr_reports_list = []
        for doc in ocr_docs:
            ocr_reports_list.append({
                'id': str(doc.id),
                'document_id': doc.document_id,
                'title': doc.title,
                'document_type': doc.get_document_type_display(),
                'confidence': f"{int(doc.ocr_confidence * 100)}%",
                'verification_status': doc.get_verification_status_display(),
                'tests': doc.extracted_data.get('tests', []),
                'medications': doc.extracted_data.get('medications', []),
                'flags': doc.extracted_data.get('flags', []),
                'missing_fields': doc.extracted_data.get('missing_fields', []),
                'doctor_notes': doc.doctor_notes or f"Verified by {assigned_doc_name}.",
                'date': doc.created_at.strftime('%d %b %Y'),
            })

        if not ocr_reports_list:
            ocr_reports_list = [{
                'id': 'mock-cbc',
                'document_id': f'DOC-OCR-{patient.patient_id}-01',
                'title': f'Complete Blood Count & Panel - {patient.user.get_full_name()}',
                'document_type': 'Laboratory Report',
                'confidence': '96%',
                'verification_status': 'Verified by Doctor',
                'tests': [
                    {'test_name': 'WBC Count', 'result_value': 12400 if patient.patient_id == 'P-10245' else 7800, 'unit': '/cumm', 'reference_range': '4000 - 11000 /cumm', 'status': 'Elevated' if patient.patient_id == 'P-10245' else 'Normal', 'is_abnormal': patient.patient_id == 'P-10245'},
                    {'test_name': 'Hemoglobin', 'result_value': 13.8, 'unit': 'g/dL', 'reference_range': '12.0 - 17.5 g/dL', 'status': 'Normal', 'is_abnormal': False},
                    {'test_name': 'Platelet Count', 'result_value': 210000, 'unit': '/cumm', 'reference_range': '150000 - 450000 /cumm', 'status': 'Normal', 'is_abnormal': False},
                    {'test_name': 'Serum Creatinine', 'result_value': 1.0, 'unit': 'mg/dL', 'reference_range': '0.6 - 1.2 mg/dL', 'status': 'Normal', 'is_abnormal': False},
                ],
                'flags': ['Clinical verification completed.'],
                'date': 'Today',
            }]

        # 3. Vitals tab data
        vitals_data = profile['vitals']

        # AI Clinical Summary (5 structured sections)
        summary_record = AIClinicalSummary.objects.filter(patient=patient).first()
        if summary_record:
            summary_sections = {
                '1_current_condition': summary_record.current_condition,
                '2_relevant_history': summary_record.relevant_history,
                '3_alerts': summary_record.alerts,
                '4_pending_actions': summary_record.pending_actions,
                '5_source_documents': summary_record.source_documents,
            }
        else:
            summary_sections = {
                '1_current_condition': f"Presenting with {patient.current_condition or 'reported symptoms'}.",
                '2_relevant_history': f"Patient category: {patient.get_patient_type_display()}. History on file.",
                '3_alerts': f"• Clinical alert for {patient.user.get_full_name()}.\n• Check vital signs and allergies before intervention.",
                '4_pending_actions': "1. Review laboratory tests.\n2. Prescribe appropriate care regimen.\n3. Arrange follow-up.",
                '5_source_documents': [
                    {'title': 'Verified Clinical Documentation', 'doc_type': 'clinical_notes', 'date': 'Today', 'status': 'Verified'},
                ],
            }

        return Response({
            'patient_card': {
                'name': patient.user.get_full_name() or patient.user.username,
                'patient_id': patient.patient_id,
                'age': profile['age'],
                'gender': patient.get_gender_display(),
                'priority': 'Emergency / Critical' if patient.current_severity == 'emergency' else (
                    'High Priority' if patient.current_severity == 'urgent' else 'Routine / Stable'
                ),
                'priority_level': patient.current_severity,
                'current_condition': patient.current_condition or 'Clinical review underway',
                'patient_category': patient.get_patient_type_display(),
                'previous_treatment': profile['previous_treatment'],
                'next_action': profile['next_action'],
                'ai_clinical_summary_lead': profile['ai_clinical_summary_lead'],
                'patient_type': patient.get_patient_type_display(),
                'care_status': patient.get_care_status_display(),
                'referral_status': patient.get_referral_status_display(),
                'current_severity': patient.get_current_severity_display(),
                'assigned_doctor_name': assigned_doc_name,
                'assigned_doctor_dept': assigned_doc_dept,
            },
            'tabs': {
                'history': history_data,
                'ocr_reports': ocr_reports_list,
                'vitals': vitals_data,
            },
            'ai_summary_5_sections': summary_sections,
        }, status=status.HTTP_200_OK)


# =========================================================
# 2. OCR DOCUMENT UPLOAD & PARSING ENDPOINT
# =========================================================

class OCRDocumentUploadAPIView(APIView):
    """Upload PDF/image, extract structured medical data, validate reference ranges."""
    permission_classes = []

    def post(self, request):
        from .ocr_scanner.document_ocr import extract_raw_text, process_ocr_pipeline
        file_obj = request.FILES.get('document_file')
        raw_text_input = request.data.get('raw_text', '')
        patient_id = request.data.get('patient_id')
        doc_type = request.data.get('document_type', 'lab_report')
        title = request.data.get('title', 'Uploaded Clinical Record')

        patient = None
        if patient_id:
            patient = Patient.objects.filter(patient_id=patient_id).first()

        raw_text = raw_text_input
        if file_obj:
            extracted_text = extract_raw_text(file_obj, file_obj.name)
            if extracted_text:
                raw_text = extracted_text

        if not raw_text:
            return Response({
                "error": "No readable text extracted. Please provide a document file or raw text."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Run full OCR pipeline
        parsed_result = process_ocr_pipeline(raw_text, doc_type, patient)

        import uuid
        doc_num = f"DOC-OCR-{uuid.uuid4().hex[:6].upper()}"
        med_doc = MedicalDocument.objects.create(
            document_id=doc_num,
            patient=patient,
            document_type=doc_type,
            title=title,
            document_file=file_obj if file_obj else None,
            raw_text=raw_text,
            ocr_confidence=parsed_result['ocr_confidence'],
            verification_status=parsed_result['verification_status'],
            extracted_data=parsed_result,
        )

        from .serializers import MedicalDocumentSerializer
        return Response({
            "message": "Document processed through OCR pipeline successfully",
            "document": MedicalDocumentSerializer(med_doc).data,
            "pipeline_analysis": parsed_result,
        }, status=status.HTTP_201_CREATED)


# =========================================================
# 3. OCR DOCTOR VERIFICATION WORKSPACE ENDPOINT
# =========================================================

class OCRVerifyAPIView(APIView):
    """Doctor verifies or corrects extracted OCR values and integrates them into EMR."""
    permission_classes = []

    def post(self, request, document_id):
        med_doc = MedicalDocument.objects.filter(document_id=document_id).first()
        if not med_doc:
            return Response({"error": "Document not found"}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action', 'verify')
        doctor_notes = request.data.get('doctor_notes', '')
        corrected_tests = request.data.get('tests')

        if corrected_tests:
            extracted_data = med_doc.extracted_data or {}
            extracted_data['tests'] = corrected_tests
            med_doc.extracted_data = extracted_data

        if action == 'verify':
            med_doc.verification_status = 'verified'
        elif action == 'flag':
            med_doc.verification_status = 'flagged_conflict'

        med_doc.doctor_notes = doctor_notes
        from django.utils import timezone
        med_doc.verified_at = timezone.now()
        med_doc.save()

        return Response({
            "message": f"Document {document_id} status updated to {med_doc.verification_status}",
            "verification_status": med_doc.verification_status,
            "doctor_notes": med_doc.doctor_notes,
        }, status=status.HTTP_200_OK)


# =========================================================
# 4. CLINICAL INFERENCE & 5-SECTION SUMMARY GENERATOR
# =========================================================

class ClinicalInferenceAPIView(APIView):
    """
    Evaluates patient features, triage priority (Emergency immediate escalation / Urgent / Routine),
    and generates the 5-section AI clinical summary.
    """
    permission_classes = []

    def post(self, request):
        from .inference.clinical_inference import generate_structured_ai_summary
        patient_id = request.data.get('patient_id', 'P-10245')
        patient = Patient.objects.filter(patient_id=patient_id).first()
        if not patient:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

        vitals = request.data.get('vitals', {
            'temperature': 101.8,
            'systolic_bp': 124,
            'diastolic_bp': 82,
            'heart_rate': 104,
            'spo2': 97,
            'respiratory_rate': 20,
            'hydration': 'Mild dehydration concern',
        })
        symptoms = request.data.get('symptoms', ['High fever for 4 days', 'Dehydration', 'Body ache'])
        case_type = request.data.get('case_type', 'fever')
        additional_notes = request.data.get('notes', '')

        # Fetch OCR documents
        docs_data = [d.extracted_data for d in MedicalDocument.objects.filter(patient=patient)[:3]]

        summary = generate_structured_ai_summary(
            patient=patient,
            current_vitals=vitals,
            current_symptoms=symptoms,
            case_type=case_type,
            ocr_reports_data=docs_data,
            previous_visit_count=3 if patient.patient_id == 'P-10245' else 1,
            additional_notes=additional_notes,
        )

        # Persist summary
        from .models import AIClinicalSummary, ClinicalAuditLog
        sum_obj, _ = AIClinicalSummary.objects.update_or_create(
            patient=patient,
            defaults={
                'case_type': case_type,
                'priority_level': summary['priority'],
                'trend_comparison': summary['trend_comparison'],
                'current_condition': summary['summary_sections']['1_current_condition'],
                'relevant_history': summary['summary_sections']['2_relevant_history'],
                'alerts': summary['summary_sections']['3_alerts'],
                'pending_actions': summary['summary_sections']['4_pending_actions'],
                'source_documents': summary['summary_sections']['5_source_documents'],
                'vitals_snapshot': vitals,
                'risk_score': summary['risk_score'],
                'ai_confidence': summary['confidence'],
            }
        )

        ClinicalAuditLog.objects.create(
            patient=patient,
            model_name='IHMS-ClinicalInference-v2.1',
            model_version='2.1.0',
            input_features={'vitals': vitals, 'symptoms': symptoms, 'case_type': case_type},
            output_summary={'priority': summary['priority'], 'risk_score': summary['risk_score']},
        )

        return Response({
            "message": "AI Clinical Summary generated successfully",
            "summary": summary,
        }, status=status.HTTP_200_OK)


# =========================================================
# 5. SMART PATIENT TIMELINE ENDPOINT
# =========================================================

class SmartPatientTimelineAPIView(APIView):
    """
    Unified longitudinal patient history for Existing, New, and Transferred patients:
    Chronological timeline of visits, lab results, prescriptions, and symptom change trends.
    """
    permission_classes = []

    def get(self, request, patient_id):
        patient = Patient.objects.filter(patient_id=patient_id, is_deleted=False).select_related('user', 'assigned_doctor').first()
        if not patient:
            return Response({"error": "Patient not found"}, status=status.HTTP_404_NOT_FOUND)

        timeline_events = []

        # 1. Registration / Intake Event
        timeline_events.append({
            'date': patient.created_at.strftime('%d %b %Y, %I:%M %p'),
            'type': 'admission',
            'title': f"Patient Intake ({patient.get_patient_type_display()})",
            'badge': patient.get_care_status_display(),
            'description': f"Registered with ID {patient.patient_id}. Condition: {patient.current_condition or 'General Intake'}.",
            'doctor': str(patient.assigned_doctor) if patient.assigned_doctor else 'Admission Cell',
        })

        # 2. Appointments / Visits
        appts = Appointment.objects.filter(patient=patient, is_deleted=False).order_by('-date', '-time')
        for a in appts:
            timeline_events.append({
                'date': f"{a.date.strftime('%d %b %Y')} at {a.time.strftime('%I:%M %p')}",
                'type': 'consultation',
                'title': f"Consultation with Dr. {a.doctor.user.get_full_name() or a.doctor.user.username}",
                'badge': a.get_status_display(),
                'description': f"Symptoms: {a.symptoms}. Priority: {a.priority_level}.",
                'doctor': f"Dr. {a.doctor.user.get_full_name() or a.doctor.user.username}",
            })

        # 3. Medical Documents / OCR Reports
        docs = MedicalDocument.objects.filter(patient=patient).order_by('-created_at')
        for d in docs:
            timeline_events.append({
                'date': d.created_at.strftime('%d %b %Y, %I:%M %p'),
                'type': 'report',
                'title': f"OCR Report: {d.title}",
                'badge': d.get_verification_status_display(),
                'description': f"Extracted {d.extracted_data.get('total_tests_extracted', 0)} tests with {int(d.ocr_confidence * 100)}% confidence.",
                'doctor': str(d.verified_by) if d.verified_by else 'Automated OCR Pipeline',
            })

        # 4. Service Requests (Lab, Pharmacy)
        srvs = ServiceRequest.objects.filter(patient=patient).order_by('-created_at')
        for s in srvs:
            timeline_events.append({
                'date': s.created_at.strftime('%d %b %Y, %I:%M %p'),
                'type': 'service',
                'title': f"Service Request ({s.get_service_type_display()})",
                'badge': s.get_status_display(),
                'description': f"{s.details}. Result: {s.result_summary or 'In progress'}",
                'doctor': str(s.ordering_doctor) if s.ordering_doctor else 'Clinical Team',
            })

        # Continuity and Trend Analysis
        continuity_summary = {
            'patient_type': patient.get_patient_type_display(),
            'care_status': patient.get_care_status_display(),
            'referral_status': patient.get_referral_status_display(),
            'current_severity': patient.get_current_severity_display(),
            'assigned_doctor': str(patient.assigned_doctor) if patient.assigned_doctor else 'Dr. Amit Sharma',
            'trend': 'Worsening fever on Day 4; dehydration management in progress' if patient.current_severity == 'urgent' else 'Stable',
        }

        return Response({
            'patient_id': patient.patient_id,
            'name': patient.user.get_full_name() or patient.user.username,
            'continuity': continuity_summary,
            'timeline_events': timeline_events,
        }, status=status.HTTP_200_OK)


# =========================================================
# 6. CLINICAL PRIORITY VIEW QUEUE
# =========================================================

class ClinicalPriorityQueueAPIView(APIView):
    """
    Clinical Priority View:
    Triage-ordered queue separated into:
    1. Emergency / Critical — Immediate Escalation
    2. Urgent / High Concern — Prompt Review
    3. Routine / Stable — Normal Workflow
    """
    permission_classes = []

    def get(self, request):
        from doctors.coordination_service import get_doctor_dashboard_kpis
        data = get_doctor_dashboard_kpis()

        # Categorize patients
        emergency_list = [p for p in data['priority_queue'] if p['priority'] == 'emergency']
        urgent_list = [p for p in data['priority_queue'] if p['priority'] == 'urgent']
        routine_list = [p for p in data['priority_queue'] if p['priority'] == 'routine']

        return Response({
            'emergency_critical': emergency_list,
            'urgent_high_concern': urgent_list,
            'routine_stable': routine_list,
            'total_in_queue': len(data['priority_queue']),
            'emergency_count': len(emergency_list),
            'urgent_count': len(urgent_list),
            'routine_count': len(routine_list),
        }, status=status.HTTP_200_OK)