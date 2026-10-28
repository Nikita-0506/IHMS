from django.urls import path

from .views import (
    AIAnalysisAPIView,
    AIAnalysisListCreateView,
    AIAnalysisDetailView,
    DoctorViewDashboardAPIView,
    OCRDocumentUploadAPIView,
    OCRVerifyAPIView,
    ClinicalInferenceAPIView,
    SmartPatientTimelineAPIView,
    ClinicalPriorityQueueAPIView,
)

urlpatterns = [

    path(
        'dashboard/',
        AIAnalysisAPIView.as_view(),
        name='ai-analysis-dashboard'
    ),

    path(
        'doctor-view-dashboard/',
        DoctorViewDashboardAPIView.as_view(),
        name='doctor-view-dashboard'
    ),

    path(
        'ocr/upload/',
        OCRDocumentUploadAPIView.as_view(),
        name='ocr-document-upload'
    ),

    path(
        'ocr/verify/<str:document_id>/',
        OCRVerifyAPIView.as_view(),
        name='ocr-document-verify'
    ),

    path(
        'inference/summary/',
        ClinicalInferenceAPIView.as_view(),
        name='clinical-inference-summary'
    ),

    path(
        'timeline/<str:patient_id>/',
        SmartPatientTimelineAPIView.as_view(),
        name='smart-patient-timeline'
    ),

    path(
        'priority-queue/',
        ClinicalPriorityQueueAPIView.as_view(),
        name='clinical-priority-queue'
    ),
    path(
        'clinical-priority/',
        ClinicalPriorityQueueAPIView.as_view(),
        name='clinical-priority-alias'
    ),
    path(
        'doctor-view/',
        DoctorViewDashboardAPIView.as_view(),
        name='doctor-view-alias'
    ),
    path(
        'smart-timeline/',
        SmartPatientTimelineAPIView.as_view(),
        name='smart-timeline-alias'
    ),

    path(
        '',
        AIAnalysisListCreateView.as_view(),
        name='ai-analysis-list-create'
    ),

    path(
        '<uuid:pk>/',
        AIAnalysisDetailView.as_view(),
        name='ai-analysis-detail'
    ),
]