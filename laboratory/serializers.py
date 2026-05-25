from rest_framework import serializers

from .models import LaboratoryReport


class LaboratoryReportSerializer(serializers.ModelSerializer):

    patient_id = serializers.CharField(
        source='patient.patient_id',
        read_only=True,
    )

    class Meta:

        model = LaboratoryReport

        fields = (
            'id',
            'patient',
            'patient_id',
            'doctor',
            'lab_staff',
            'test_name',
            'test_description',
            'report_file',
            'test_result',
            'ai_analysis_result',
            'report_status',
            'created_at',
            'updated_at',
        )

        read_only_fields = (
            'id',
            'created_at',
            'updated_at',
            'patient_id',
        )

    def validate_test_name(self, value):

        cleaned_value = value.strip()

        if not cleaned_value:

            raise serializers.ValidationError(
                'Test name cannot be empty.'
            )

        return cleaned_value

    def validate(self, attrs):

        report_status = attrs.get('report_status')

        test_result = attrs.get('test_result')

        if report_status == 'completed' and not test_result:

            raise serializers.ValidationError({
                'test_result': (
                    'Test result is required for completed reports.'
                )
            })

        return attrs