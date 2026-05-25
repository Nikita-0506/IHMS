from rest_framework import serializers
from django.utils.timezone import now

from .models import Appointment


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

    patient_name = serializers.CharField(
        source='patient.user.username'
    )

    doctor_name = serializers.CharField(
        source='doctor.user.username'
    )

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

    class Meta:

        model = Appointment

        fields = '__all__'


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