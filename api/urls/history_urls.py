from django.urls import path

from api.views.history_api_view import HistoryOverviewAPIView


urlpatterns = [
    path('overview/', HistoryOverviewAPIView.as_view(), name='history-overview'),
]
