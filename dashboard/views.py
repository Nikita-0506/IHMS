from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import DashboardAnalytics
from .permissions import IsDashboardManager
from .serializers import DashboardAnalyticsSerializer
from .services import DashboardMetricsService


class DashboardAPIView(APIView):

    permission_classes = [IsAuthenticated, IsDashboardManager]

    def get(self, request):

        metrics = DashboardMetricsService.collect_global_metrics()

        analytics, _created = DashboardAnalytics.objects.get_or_create(
            user=request.user,
            defaults={
                'total_patients': metrics['total_patients'],
                'total_doctors': metrics['total_doctors'],
                'total_appointments': metrics['total_appointments'],
                'total_revenue': metrics['total_revenue'],
                'emergency_cases': metrics['emergency_cases'],
                'ai_predictions': metrics['ai_predictions'],
                'active_users': metrics['active_users'],
            }
        )

        analytics.total_patients = metrics['total_patients']
        analytics.total_doctors = metrics['total_doctors']
        analytics.total_appointments = metrics['total_appointments']
        analytics.total_revenue = metrics['total_revenue']
        analytics.emergency_cases = metrics['emergency_cases']
        analytics.ai_predictions = metrics['ai_predictions']
        analytics.active_users = metrics['active_users']
        analytics.save()

        return Response({
            "message": "Dashboard loaded successfully",
            "role": request.user.role,
            "metrics": metrics,
            "last_refreshed_analytics_id": str(analytics.id),
        }, status=status.HTTP_200_OK)


class DashboardAnalyticsListView(generics.ListAPIView):

    serializer_class = DashboardAnalyticsSerializer

    permission_classes = [IsAuthenticated, IsDashboardManager]

    queryset = DashboardAnalytics.objects.select_related(
        'user'
    ).order_by('-updated_at')