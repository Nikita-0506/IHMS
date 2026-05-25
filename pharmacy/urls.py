from django.urls import path

from .views import (
    PharmacyDashboardAPIView,
    MedicineListCreateView,
    MedicineDetailView,
)

urlpatterns = [

    path(
        'dashboard/',
        PharmacyDashboardAPIView.as_view(),
        name='pharmacy-dashboard'
    ),

    path(
        '',
        MedicineListCreateView.as_view(),
        name='medicine-list-create'
    ),

    path(
        '<uuid:pk>/',
        MedicineDetailView.as_view(),
        name='medicine-detail'
    ),
]