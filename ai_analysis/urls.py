from django.urls import path

from .views import (
    AIAnalysisAPIView,
    AIAnalysisListCreateView,
    AIAnalysisDetailView,
)

urlpatterns = [

    path(
        'dashboard/',
        AIAnalysisAPIView.as_view(),
        name='ai-analysis-dashboard'
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