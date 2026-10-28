from rest_framework import serializers

from .models import Doctor


class DoctorSerializer(serializers.ModelSerializer):
    doctor_name = serializers.SerializerMethodField()

    class Meta:

        model = Doctor

        fields = [
            'id',
            'user',
            'doctor_name',
            'doctor_id',
            'specialization',
            'availability',
            'department',
            'qualification',
            'experience_years',
            'consultation_fee',
            'license_number',
            'shift',
            'opd_timing',
            'room_number',
            'max_daily_patients',
            'current_queue_count',
            'is_active',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]

    def get_doctor_name(self, obj):
        if obj.user:
            return f"Dr. {obj.user.get_full_name() or obj.user.username}"
        return "Doctor"

    def validate_experience_years(self, value):

        if value < 0:

            raise serializers.ValidationError(
                "Experience cannot be negative"
            )

        return value

    def validate_consultation_fee(self, value):

        if value < 0:

            raise serializers.ValidationError(
                "Consultation fee cannot be negative"
            )

        return value


class ServiceRequestSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        from .models import ServiceRequest
        model = ServiceRequest
        fields = (
            'id',
            'request_id',
            'patient',
            'patient_id',
            'patient_name',
            'ordering_doctor',
            'doctor_name',
            'service_type',
            'department',
            'priority',
            'status',
            'details',
            'result_summary',
            'responsible_team',
            'assigned_staff',
            'created_at',
            'updated_at',
            'closed_at',
        )
        read_only_fields = ('id', 'request_id', 'created_at', 'updated_at', 'patient_id')

    def get_patient_name(self, obj):
        if obj.patient and obj.patient.user:
            return obj.patient.user.get_full_name() or obj.patient.user.username
        return "Unknown"

    def get_doctor_name(self, obj):
        if obj.ordering_doctor and obj.ordering_doctor.user:
            return f"Dr. {obj.ordering_doctor.user.get_full_name() or obj.ordering_doctor.user.username}"
        return "Unassigned"