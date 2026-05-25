from django.urls import path

from .views import (
    PatientDashboardAPIView,
    PatientListCreateView,
    PatientDetailView,
)

urlpatterns = [

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