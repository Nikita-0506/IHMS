from django.urls import path

from .views import (
    BillingDashboardAPIView,
    BillingListCreateAPIView,
    BillingRetrieveUpdateDeleteAPIView,
)

urlpatterns = [

    path(
        'dashboard/',
        BillingDashboardAPIView.as_view(),
        name='billing-dashboard'
    ),

    path(
        '',
        BillingListCreateAPIView.as_view(),
        name='billing-list-create'
    ),

    path(
        '<uuid:pk>/',
        BillingRetrieveUpdateDeleteAPIView.as_view(),
        name='billing-detail'
    ),
]