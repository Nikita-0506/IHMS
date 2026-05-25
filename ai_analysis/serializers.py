from rest_framework import serializers

from .models import AIAnalysis


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