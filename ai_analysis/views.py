import logging

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import AIAnalysis
from .serializers import AIAnalysisSerializer
from .permissions import IsAIAnalysisStaff, IsPatientOrAIAnalysisStaff


logger = logging.getLogger(__name__)

class AIAnalysisAPIView(APIView):

    permission_classes = [IsAuthenticated, IsAIAnalysisStaff]

    def get(self, request):

        total_analyses = AIAnalysis.objects.count()

        return Response({
            "message": "AI Analysis dashboard loaded successfully",
            "user": request.user.username,
            "total_analyses": total_analyses,
        }, status=status.HTTP_200_OK)


class AIAnalysisListCreateView(generics.ListCreateAPIView):

    serializer_class = AIAnalysisSerializer

    permission_classes = [IsAuthenticated, IsPatientOrAIAnalysisStaff]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        'patient',
        'disease_prediction',
        'mental_health_result',
    ]

    search_fields = [
        'patient__patient_id',
        'patient__user__username',
        'disease_prediction',
        'mental_health_result',
    ]

    ordering_fields = [
        'confidence_score',
        'voice_stress_score',
        'created_at',
    ]

    ordering = ['-created_at']

    def get_queryset(self):

        queryset = AIAnalysis.objects.select_related(
            'patient',
            'patient__user',
        )

        if self.request.user.role == 'patient':

            patient_profile = getattr(
                self.request.user,
                'patient_profile',
                None,
            )

            if not patient_profile:

                return queryset.none()

            return queryset.filter(patient=patient_profile)

        return queryset

    def perform_create(self, serializer):

        if self.request.user.role == 'patient':

            patient_profile = getattr(
                self.request.user,
                'patient_profile',
                None,
            )

            if not patient_profile:

                raise PermissionDenied(
                    'Patient profile not found for current user.'
                )

            serializer.save(patient=patient_profile)

            logger.info(
                'AI analysis created by patient user %s',
                self.request.user.username,
            )

            return

        serializer.save()

        logger.info(
            'AI analysis created by staff user %s',
            self.request.user.username,
        )


class AIAnalysisDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = AIAnalysisSerializer

    permission_classes = [IsAuthenticated, IsPatientOrAIAnalysisStaff]

    def get_queryset(self):

        queryset = AIAnalysis.objects.select_related(
            'patient',
            'patient__user',
        )

        if self.request.user.role == 'patient':

            patient_profile = getattr(
                self.request.user,
                'patient_profile',
                None,
            )

            if not patient_profile:

                return queryset.none()

            return queryset.filter(patient=patient_profile)

        return queryset


class AIAnalysisView(AIAnalysisListCreateView):
    """Backward-compatible alias used in existing URL imports."""