from django.contrib import admin
from .models import AIAnalysis


@admin.register(AIAnalysis)
class AIAnalysisAdmin(admin.ModelAdmin):

    list_display = (
        'patient',
        'voice_stress_score',
        'disease_prediction',
        'mental_health_result',
        'confidence_score',
        'created_at',
    )

    search_fields = (
        'patient__patient_id',
        'disease_prediction',
        'mental_health_result',
    )

    list_filter = (
        'mental_health_result',
        'created_at',
    )

    ordering = ('-created_at',)

    list_select_related = (
        'patient',
        'patient__user',
    )

    readonly_fields = (
        'id',
        'created_at',
    )