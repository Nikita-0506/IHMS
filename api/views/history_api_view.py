from pathlib import Path

from django.conf import settings
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class HistoryOverviewAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        history_root = Path(settings.BASE_DIR) / 'history'

        summary = {}
        for folder in [
            'reports',
            'ai_analysis',
            'commits',
            'test_reports',
            'user_logs',
            'audit_logs',
        ]:
            current_path = history_root / folder
            if current_path.exists():
                summary[folder] = len(list(current_path.glob('*.jsonl')))
            else:
                summary[folder] = 0

        return Response({
            'success': True,
            'message': 'History summary fetched',
            'data': summary,
        }, status=status.HTTP_200_OK)
