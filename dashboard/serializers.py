from rest_framework import serializers

from .models import DashboardAnalytics


class DashboardAnalyticsSerializer(serializers.ModelSerializer):

    user_email = serializers.EmailField(
        source='user.email',
        read_only=True,
    )

    class Meta:

        model = DashboardAnalytics

        fields = (
            'id',
            'user',
            'user_email',
            'total_patients',
            'total_doctors',
            'total_appointments',
            'total_revenue',
            'emergency_cases',
            'ai_predictions',
            'active_users',
            'created_at',
            'updated_at',
        )

        read_only_fields = (
            'id',
            'created_at',
            'updated_at',
            'user_email',
        )
