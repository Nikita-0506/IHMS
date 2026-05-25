from rest_framework import serializers

from .models import Doctor


class DoctorSerializer(serializers.ModelSerializer):

    class Meta:

        model = Doctor

        fields = [
            'id',
            'user',
            'specialization',
            'availability',
            'department',
            'qualification',
            'experience_years',
            'consultation_fee',
            'license_number',
            'is_active',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]

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