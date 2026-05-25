from django.test import TestCase
from uuid import uuid4

from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from pharmacy.models import Medicine


class PharmacyAPITestCase(TestCase):

    def setUp(self):

        self.client = APIClient()

        self.admin_user = self._create_user('admin')
        self.pharmacist_user = self._create_user('pharmacist')
        self.doctor_user = self._create_user('doctor')
        self.receptionist_user = self._create_user('receptionist')
        self.patient_user = self._create_user('patient')

        self.medicine = Medicine.objects.create(
            medicine_name='Paracetamol',
            manufacturer='ABC Pharma',
            quantity=100,
            price=15.50,
            expiry_date='2030-12-31',
        )

    def _create_user(self, role):

        unique_suffix = uuid4().hex[:8]

        return User.objects.create_user(
            username=f'{role}_{unique_suffix}',
            email=f'{role}_{unique_suffix}@test.com',
            password='Password@123',
            role=role,
        )

    def test_pharmacy_list_requires_authentication(self):

        response = self.client.get('/api/pharmacy/')

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_patient_cannot_access_pharmacy_list(self):

        self.client.force_authenticate(user=self.patient_user)

        response = self.client.get('/api/pharmacy/')

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_pharmacist_can_create_medicine(self):

        self.client.force_authenticate(user=self.pharmacist_user)

        response = self.client.post(
            '/api/pharmacy/',
            {
                'medicine_name': 'Amoxicillin',
                'manufacturer': 'XYZ Pharma',
                'quantity': 50,
                'price': 120.00,
                'expiry_date': '2031-01-01',
            },
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

    def test_supported_read_roles_can_access_pharmacy_list(self):

        for user in [
            self.admin_user,
            self.pharmacist_user,
            self.doctor_user,
            self.receptionist_user,
        ]:

            with self.subTest(role=user.role):

                self.client.force_authenticate(user=user)

                response = self.client.get('/api/pharmacy/')

                self.assertEqual(
                    response.status_code,
                    status.HTTP_200_OK,
                )
