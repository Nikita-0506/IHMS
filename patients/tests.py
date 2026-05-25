from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User
from patients.models import Patient


class PatientTestCase(TestCase):

    # ==========================================
    # Setup Test Environment
    # ==========================================

    def setUp(self):

        self.client = APIClient()

        # Dynamic Admin User
        self.admin_user = User.objects.create_user(
            username='admin_user',
            email='admin@test.com',
            password='Admin@123',
            role='admin'
        )

        # Dynamic Doctor User
        self.doctor_user = User.objects.create_user(
            username='doctor_user',
            email='doctor@test.com',
            password='Doctor@123',
            role='doctor'
        )

        # Dynamic Patient User
        self.patient_user = User.objects.create_user(
            username='patient_user',
            email='patient@test.com',
            password='Patient@123',
            role='patient'
        )

        # Dynamic Patient Object
        self.patient = Patient.objects.create(
            user=self.patient_user,
            patient_id='PAT1001',
            blood_group='A+',
            gender='female',
            date_of_birth='2000-01-01',
            emergency_contact='9876543210',
            address='Pune'
        )

    # ==========================================
    # Patient Creation Test
    # ==========================================

    def test_patient_creation(self):

        self.assertEqual(
            self.patient.patient_id,
            'PAT1001'
        )

    # ==========================================
    # Patient List API Test
    # ==========================================

    def test_patient_list_api(self):

        self.client.force_authenticate(
            user=self.admin_user
        )

        response = self.client.get(
            '/api/patients/'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    # ==========================================
    # Patient Detail API Test
    # ==========================================

    def test_patient_detail_api(self):

        self.client.force_authenticate(
            user=self.doctor_user
        )

        response = self.client.get(
            f'/api/patients/{self.patient.id}/'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    # ==========================================
    # Unauthorized Access Test
    # ==========================================

    def test_unauthorized_access(self):

        response = self.client.get(
            '/api/patients/'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    # ==========================================
    # Soft Delete Test
    # ==========================================

    def test_soft_delete_patient(self):

        self.client.force_authenticate(
            user=self.admin_user
        )

        response = self.client.delete(
            f'/api/patients/{self.patient.id}/'
        )

        self.patient.refresh_from_db()

        self.assertEqual(
            self.patient.is_deleted,
            True
        )

    # ==========================================
    # Search API Test
    # ==========================================

    def test_patient_search(self):

        self.client.force_authenticate(
            user=self.admin_user
        )

        response = self.client.get(
            '/api/patients/?search=PAT1001'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    # ==========================================
    # Filter API Test
    # ==========================================

    def test_patient_filter(self):

        self.client.force_authenticate(
            user=self.admin_user
        )

        response = self.client.get(
            '/api/patients/?blood_group=A+'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    # ==========================================
    # Invalid Emergency Contact Test
    # ==========================================

    def test_invalid_emergency_contact(self):

        invalid_patient = Patient(
            user=self.patient_user,
            patient_id='PAT2001',
            blood_group='B+',
            gender='male',
            date_of_birth='2001-01-01',
            emergency_contact='123',
            address='Mumbai'
        )

        with self.assertRaises(Exception):

            invalid_patient.full_clean()

    # ==========================================
    # Patient String Representation Test
    # ==========================================

    def test_patient_string_representation(self):

        self.assertEqual(
            str(self.patient),
            f'{self.patient.patient_id} - {self.patient.user.username}'
        )