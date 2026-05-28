import re
from rest_framework import serializers
from .models import Patient


class PatientSerializer(serializers.ModelSerializer):

    patient_name = serializers.SerializerMethodField()

    user_username = serializers.CharField(
        source='user.username',
        read_only=True
    )

    user_email = serializers.CharField(
        source='user.email',
        read_only=True
    )

    class Meta:

        model = Patient

        fields = '__all__'

        read_only_fields = [
            'id',
            'created_at',
        ]


    # =====================================
    # Custom Validation
    # =====================================

    def validate_patient_id(self, value):

        if len(value) < 5:

            raise serializers.ValidationError(
                "Patient ID must contain at least 5 characters."
            )

        return value


    def validate_emergency_contact(self, value):

     if not re.match(r'^[0-9]{10}$', value):

            raise serializers.ValidationError(
                "Emergency contact must contain exactly 10 digits."
            )
     
     return value

    def get_patient_name(self, obj):

        full_name = obj.user.get_full_name().strip()

        return full_name or obj.user.username or obj.user.email