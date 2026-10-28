from django.urls import path

from .views import (
    PatientDashboardAPIView,
    PatientListCreateView,
    PatientDetailView,
    PatientClinicalMonitoringListView,
    PatientClinicalMonitoringStatsAPIView,
    PatientClinicalMonitoringExportCSVView,
    PatientClinicalTriagePredictAPIView,
    patient_reports_portal_web_view,
    patient_individual_report_web_view,
    patient_report_download_view,
)

urlpatterns = [

    # Clinical Monitoring Records (PostgreSQL)
    path(
        'monitoring/',
        PatientClinicalMonitoringListView.as_view(),
        name='patient-monitoring-list'
    ),
    path(
        'monitoring/stats/',
        PatientClinicalMonitoringStatsAPIView.as_view(),
        name='patient-monitoring-stats'
    ),
    path(
        'monitoring/export-csv/',
        PatientClinicalMonitoringExportCSVView.as_view(),
        name='patient-monitoring-export-csv'
    ),

    # Clinical Triage ML Inference & Sync
    path(
        'monitoring/triage-predict/',
        PatientClinicalTriagePredictAPIView.as_view(),
        name='patient-monitoring-triage-predict'
    ),

    # Clinical Patient Reports Portal & Individual Reports
    path(
        'reports/',
        patient_reports_portal_web_view,
        name='patient-reports-portal'
    ),
    path(
        'reports/<str:patient_id>/',
        patient_individual_report_web_view,
        name='patient-individual-report'
    ),
    path(
        'reports/<str:patient_id>/download/',
        patient_report_download_view,
        name='patient-report-download'
    ),

    # Patient Dashboard
    path(
        'dashboard/',
        PatientDashboardAPIView.as_view(),
        name='patient-dashboard'
    ),

    # Patient List + Create
    path(
        '',
        PatientListCreateView.as_view(),
        name='patient-list-create'
    ),

    # Patient Detail
    path(
        '<uuid:pk>/',
        PatientDetailView.as_view(),
        name='patient-detail'
    ),
]