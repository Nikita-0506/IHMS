from rest_framework import serializers
from django.utils.timezone import now

from .models import Appointment


def _user_display_name(user):
    full_name = user.get_full_name().strip()
    return full_name or user.username or user.email


class AppointmentCreateSerializer(serializers.ModelSerializer):

    class Meta:

        model = Appointment

        fields = '__all__'

        read_only_fields = (
            'created_by',
            'updated_by',
            'created_at',
            'updated_at',
        )

    def validate(self, data):

        appointment_date = data.get('date')

        appointment_time = data.get('time')

        doctor = data.get('doctor')

        if appointment_date < now().date():

            raise serializers.ValidationError(
                'Past appointments are not allowed.'
            )

        existing_appointment = Appointment.objects.filter(
            doctor=doctor,
            date=appointment_date,
            time=appointment_time,
            is_deleted=False
        )

        if self.instance:

            existing_appointment = existing_appointment.exclude(
                id=self.instance.id
            )

        if existing_appointment.exists():

            raise serializers.ValidationError(
                'Doctor already has an appointment.'
            )

        return data


class AppointmentListSerializer(serializers.ModelSerializer):

    patient_name = serializers.SerializerMethodField()

    doctor_name = serializers.SerializerMethodField()

    def get_patient_name(self, obj):
        return _user_display_name(obj.patient.user)

    def get_doctor_name(self, obj):
        return _user_display_name(obj.doctor.user)

    class Meta:

        model = Appointment

        fields = (
            'id',
            'patient_name',
            'doctor_name',
            'date',
            'time',
            'status',
            'priority_level',
        )


class AppointmentDetailSerializer(serializers.ModelSerializer):

    patient_name = serializers.SerializerMethodField()

    doctor_name = serializers.SerializerMethodField()

    patient_medical_history = serializers.CharField(
        source='patient.medical_history',
        read_only=True,
    )

    patient_history_with_doctor = serializers.SerializerMethodField()

    def get_patient_name(self, obj):
        return _user_display_name(obj.patient.user)

    def get_doctor_name(self, obj):
        return _user_display_name(obj.doctor.user)

    def get_patient_history_with_doctor(self, obj):
        history_qs = Appointment.objects.filter(
            patient=obj.patient,
            doctor=obj.doctor,
            is_deleted=False,
        ).exclude(id=obj.id).order_by('-date', '-time')[:10]

        return [
            {
                'id': str(item.id),
                'date': item.date,
                'time': item.time,
                'status': item.status,
                'symptoms': item.symptoms,
                'notes': item.notes,
            }
            for item in history_qs
        ]

    class Meta:

        model = Appointment

        fields = (
            'id',
            'patient',
            'doctor',
            'appointment_type',
            'date',
            'time',
            'symptoms',
            'notes',
            'meeting_link',
            'status',
            'priority_level',
            'is_deleted',
            'created_by',
            'updated_by',
            'created_at',
            'updated_at',
            'patient_name',
            'doctor_name',
            'patient_medical_history',
            'patient_history_with_doctor',
        )


class AppointmentUpdateSerializer(serializers.ModelSerializer):

    class Meta:

        model = Appointment

        fields = '__all__'

        read_only_fields = (
            'created_by',
            'created_at',
        )

    def validate(self, data):

        appointment_date = data.get(
            'date',
            self.instance.date
        )

        appointment_time = data.get(
            'time',
            self.instance.time
        )

        doctor = data.get(
            'doctor',
            self.instance.doctor
        )

        existing_appointment = Appointment.objects.filter(
            doctor=doctor,
            date=appointment_date,
            time=appointment_time,
            is_deleted=False
        ).exclude(
            id=self.instance.id
        )

        if existing_appointment.exists():

            raise serializers.ValidationError(
                'Doctor already has appointment.'
            )

        return data