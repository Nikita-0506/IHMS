from rest_framework import serializers

from .models import (
    AIAnalysis,
    MedicalDocument,
    AIClinicalSummary,
    ClinicalAuditLog,
)


class AIAnalysisSerializer(serializers.ModelSerializer):

    patient_id = serializers.CharField(
        source='patient.patient_id',
        read_only=True,
    )

    class Meta:

        model = AIAnalysis

        fields = (
            'id',
            'patient',
            'patient_id',
            'voice_stress_score',
            'disease_prediction',
            'mental_health_result',
            'confidence_score',
            'audio_file',
            'analysis_report',
            'created_at',
        )

        read_only_fields = (
            'id',
            'created_at',
            'patient_id',
        )

    def validate_voice_stress_score(self, value):

        if value < 0 or value > 100:

            raise serializers.ValidationError(
                'Voice stress score must be between 0 and 100.'
            )

        return value

    def validate_confidence_score(self, value):

        if value < 0 or value > 1:

            raise serializers.ValidationError(
                'Confidence score must be between 0 and 1.'
            )

        return value

    def validate(self, attrs):

        disease_prediction = attrs.get('disease_prediction', '').strip()

        mental_health_result = attrs.get('mental_health_result', '').strip()

        if not disease_prediction:

            raise serializers.ValidationError({
                'disease_prediction': 'Disease prediction cannot be blank.'
            })

        if not mental_health_result:

            raise serializers.ValidationError({
                'mental_health_result': 'Mental health result cannot be blank.'
            })

        attrs['disease_prediction'] = disease_prediction
        attrs['mental_health_result'] = mental_health_result

        return attrs


class MedicalDocumentSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
    patient_name = serializers.SerializerMethodField()

    class Meta:
        model = MedicalDocument
        fields = (
            'id',
            'document_id',
            'patient',
            'patient_id',
            'patient_name',
            'document_type',
            'title',
            'document_file',
            'raw_text',
            'ocr_confidence',
            'verification_status',
            'verified_by',
            'verified_at',
            'extracted_data',
            'doctor_notes',
            'is_duplicate',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'patient_id')

    def get_patient_name(self, obj):
        if obj.patient and obj.patient.user:
            return obj.patient.user.get_full_name() or obj.patient.user.username
        return "Unassigned"


class AIClinicalSummarySerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = AIClinicalSummary
        fields = (
            'id',
            'patient',
            'patient_id',
            'patient_name',
            'doctor',
            'doctor_name',
            'case_type',
            'priority_level',
            'trend_comparison',
            'current_condition',
            'relevant_history',
            'alerts',
            'pending_actions',
            'source_documents',
            'vitals_snapshot',
            'risk_score',
            'ai_confidence',
            'doctor_reviewed',
            'doctor_feedback',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'patient_id')

    def get_patient_name(self, obj):
        if obj.patient and obj.patient.user:
            return obj.patient.user.get_full_name() or obj.patient.user.username
        return "Unknown"

    def get_doctor_name(self, obj):
        if obj.doctor and obj.doctor.user:
            return f"Dr. {obj.doctor.user.get_full_name() or obj.doctor.user.username}"
        return "Doctor Review Required"


class ClinicalAuditLogSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)

    class Meta:
        model = ClinicalAuditLog
        fields = '__all__'