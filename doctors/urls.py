from django.urls import path

from .views import (
    DoctorDashboardAPIView,
    DoctorListCreateView,
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
]