from django.urls import path

from .views import (
    LaboratoryAPIView,
    LaboratoryReportListCreateView,
    LaboratoryReportDetailView,
)

urlpatterns = [

    path(
        'dashboard/',
        LaboratoryAPIView.as_view(),
        name='laboratory-dashboard'
    ),

    path(
        '',
        LaboratoryReportListCreateView.as_view(),
        name='laboratory-report-list-create'
    ),

    path(
        '<uuid:pk>/',
        LaboratoryReportDetailView.as_view(),
        name='laboratory-report-detail'
    ),
]