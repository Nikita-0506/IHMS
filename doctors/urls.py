from django.urls import path

from .views import (
    DoctorDashboardAPIView,
    DoctorListCreateView,
    DoctorCoordinationRosterAPIView,
    DoctorAssignmentRecommendAPIView,
    ServiceRequestListCreateAPIView,
)

urlpatterns = [
    path(
        '',
        DoctorListCreateView.as_view(),
        name='doctor-list-create'
    ),
    path(
        'dashboard/',
        DoctorDashboardAPIView.as_view(),
        name='doctor-dashboard'
    ),
    path(
        'roster/',
        DoctorCoordinationRosterAPIView.as_view(),
        name='doctor-roster'
    ),
    path(
        'recommend-assignment/',
        DoctorAssignmentRecommendAPIView.as_view(),
        name='doctor-recommend-assignment'
    ),
    path(
        'service-requests/',
        ServiceRequestListCreateAPIView.as_view(),
        name='doctor-service-requests'
    ),
]