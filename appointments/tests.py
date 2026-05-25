from datetime import date, timedelta, time

from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User
from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment


class AppointmentAPITestCase(TestCase):

    def setUp(self):

        # ====================================
        # API CLIENT
        # ====================================

        self.client = APIClient()

        # ====================================
        # ADMIN USER
        # ====================================

        self.admin_user = User.objects.create_user(
            username='admin_user',
            email='admin@gmail.com',
            password='Admin@123',
            role='admin'
        )

        # ====================================
        # DOCTOR USER
        # ====================================

        self.doctor_user = User.objects.create_user(
            username='doctor_user',
            email='doctor@gmail.com',
            password='Doctor@123',
            role='doctor'
        )

        # ====================================
        # PATIENT USER
        # ====================================

        self.patient_user = User.objects.create_user(
            username='patient_user',
            email='patient@gmail.com',
            password='Patient@123',
            role='patient'
        )

        # ====================================
        # PATIENT PROFILE
        # ====================================

        self.patient = Patient.objects.create(
            user=self.patient_user,
            patient_id='PAT001',
            blood_group='O+',
            medical_history='No major history',
            insurance='ABC Insurance',
            emergency_contact='9999999999',
            address='Pune'
        )

        # ====================================
        # DOCTOR PROFILE
        # ====================================

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization='Cardiologist',
            availability=True,
            experience_years=10,
            consultation_fee=1000
        )

        # ====================================
        # APPOINTMENT DATA
        # ====================================

        self.appointment_data = {

            "patient": self.patient.id,

            "doctor": self.doctor.id,

            "appointment_type": "online",

            "date": str(date.today() + timedelta(days=1)),

            "time": "10:30:00",

            "symptoms": "Chest Pain",

            "priority_level": 5,

            "status": "pending"
        }

    # ====================================================
    # TEST AUTHENTICATION
    # ====================================================

    def test_authentication_required(self):

        response = self.client.get('/api/appointments/')

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    # ====================================================
    # ADMIN CAN ACCESS ALL APPOINTMENTS
    # ====================================================

    def test_admin_can_access_appointments(self):

        self.client.force_authenticate(
            user=self.admin_user
        )

        response = self.client.get('/api/appointments/')

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    # ====================================================
    # CREATE APPOINTMENT
    # ====================================================

    def test_create_appointment(self):

        self.client.force_authenticate(
            user=self.admin_user
        )

        response = self.client.post(
            '/api/appointments/',
            self.appointment_data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

    # ====================================================
    # PREVENT DUPLICATE APPOINTMENT
    # ====================================================

    def test_duplicate_appointment_prevention(self):

        self.client.force_authenticate(
            user=self.admin_user
        )

        Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_type='online',
            date=date.today() + timedelta(days=1),
            time=time(10, 30),
            symptoms='Chest Pain',
            priority_level=5,
            status='pending',
            created_by=self.admin_user,
            updated_by=self.admin_user
        )

        response = self.client.post(
            '/api/appointments/',
            self.appointment_data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    # ====================================================
    # PREVENT PAST APPOINTMENT
    # ====================================================

    def test_prevent_past_appointment(self):

        self.client.force_authenticate(
            user=self.admin_user
        )

        invalid_data = self.appointment_data.copy()

        invalid_data['date'] = str(
            date.today() - timedelta(days=1)
        )

        response = self.client.post(
            '/api/appointments/',
            invalid_data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    # ====================================================
    # DOCTOR CAN VIEW OWN APPOINTMENTS
    # ====================================================

    def test_doctor_can_view_own_appointments(self):

        Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_type='online',
            date=date.today() + timedelta(days=1),
            time=time(11, 0),
            symptoms='Fever',
            priority_level=2,
            status='confirmed',
            created_by=self.admin_user,
            updated_by=self.admin_user
        )

        self.client.force_authenticate(
            user=self.doctor_user
        )

        response = self.client.get('/api/appointments/')

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    # ====================================================
    # PATIENT CAN VIEW OWN APPOINTMENTS
    # ====================================================

    def test_patient_can_view_own_appointments(self):

        Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_type='offline',
            date=date.today() + timedelta(days=2),
            time=time(12, 0),
            symptoms='Cold',
            priority_level=1,
            status='confirmed',
            created_by=self.admin_user,
            updated_by=self.admin_user
        )

        self.client.force_authenticate(
            user=self.patient_user
        )

        response = self.client.get('/api/appointments/')

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    # ====================================================
    # SOFT DELETE TEST
    # ====================================================

    def test_soft_delete_appointment(self):

        self.client.force_authenticate(
            user=self.admin_user
        )

        appointment = Appointment.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            appointment_type='offline',
            date=date.today() + timedelta(days=3),
            time=time(1, 0),
            symptoms='Headache',
            priority_level=1,
            status='pending',
            created_by=self.admin_user,
            updated_by=self.admin_user
        )

        response = self.client.delete(
            f'/api/appointments/{appointment.id}/'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        appointment.refresh_from_db()

        self.assertTrue(
            appointment.is_deleted
        )