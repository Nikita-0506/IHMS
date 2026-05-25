from django.urls import path

from .views import (
    DashboardAPIView,
    DashboardAnalyticsListView,
)

urlpatterns = [

    path(
        '',
        DashboardAPIView.as_view(),
        name='dashboard-summary'
    ),

    path(
        'analytics/',
        DashboardAnalyticsListView.as_view(),
        name='dashboard-analytics-list'
    ),
]