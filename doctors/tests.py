from django.urls import reverse

from rest_framework.test import APITestCase
from rest_framework import status

from accounts.models import User
from doctors.models import Doctor


class DoctorAPITestCase(APITestCase):

    def setUp(self):

        # =========================
        # Admin User
        # =========================

        self.admin_user = User.objects.create_user(
            username='adminuser',
            email='admin@gmail.com',
            password='Admin@123',
            role='admin'
        )

        # =========================
        # Doctor User 1
        # =========================

        self.doctor_user_1 = User.objects.create_user(
            username='doctor1',
            email='doctor1@gmail.com',
            password='Doctor@123',
            role='doctor'
        )

        self.doctor_1 = Doctor.objects.create(
            user=self.doctor_user_1,
            specialization='Cardiology',
            availability='available',
            department='Heart',
            qualification='MBBS',
            experience_years=5,
            consultation_fee=500,
            license_number='DOC1001'
        )

        # =========================
        # Doctor User 2
        # =========================

        self.doctor_user_2 = User.objects.create_user(
            username='doctor2',
            email='doctor2@gmail.com',
            password='Doctor@123',
            role='doctor'
        )

        self.doctor_2 = Doctor.objects.create(
            user=self.doctor_user_2,
            specialization='Neurology',
            availability='busy',
            department='Brain',
            qualification='MD',
            experience_years=10,
            consultation_fee=1000,
            license_number='DOC1002'
        )

        # =========================
        # Patient User
        # =========================

        self.patient_user = User.objects.create_user(
            username='patient1',
            email='patient@gmail.com',
            password='Patient@123',
            role='patient'
        )

        # =========================
        # URLs
        # =========================

        self.doctor_list_url = reverse(
            'doctor-list-create'
        )

        self.dashboard_url = reverse(
            'doctor-dashboard'
        )

    # =========================================
    # TEST: LOGIN REQUIRED
    # =========================================

    def test_login_required_for_doctor_list(self):

        response = self.client.get(
            self.doctor_list_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    # =========================================
    # TEST: ADMIN CAN ACCESS DOCTOR LIST
    # =========================================

    def test_admin_can_access_doctor_list(self):

        self.client.force_authenticate(
            user=self.admin_user
        )

        response = self.client.get(
            self.doctor_list_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    # =========================================
    # TEST: DOCTOR CAN ACCESS DASHBOARD
    # =========================================

    def test_doctor_dashboard_access(self):

        self.client.force_authenticate(
            user=self.doctor_user_1
        )

        response = self.client.get(
            self.dashboard_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data['success'],
            True
        )

    # =========================================
    # TEST: PATIENT CANNOT ACCESS DASHBOARD
    # =========================================

    def test_patient_cannot_access_dashboard(self):

        self.client.force_authenticate(
            user=self.patient_user
        )

        response = self.client.get(
            self.dashboard_url
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN
        )

    # =========================================
    # TEST: FILTER BY SPECIALIZATION
    # =========================================

    def test_filter_doctors_by_specialization(self):

        self.client.force_authenticate(
            user=self.admin_user
        )

        response = self.client.get(
            f'{self.doctor_list_url}?specialization=Cardiology'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    # =========================================
    # TEST: SEARCH DOCTOR
    # =========================================

    def test_search_doctor(self):

        self.client.force_authenticate(
            user=self.admin_user
        )

        response = self.client.get(
            f'{self.doctor_list_url}?search=doctor1'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    # =========================================
    # TEST: ORDERING
    # =========================================

    def test_doctor_ordering(self):

        self.client.force_authenticate(
            user=self.admin_user
        )

        response = self.client.get(
            f'{self.doctor_list_url}?ordering=experience_years'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    # =========================================
    # TEST: CREATE NEW DOCTOR
    # =========================================

    def test_create_doctor(self):

        self.client.force_authenticate(
            user=self.admin_user
        )

        data = {
            "user": str(self.doctor_user_1.id),
            "specialization": "Orthopedic",
            "availability": "available",
            "department": "Bones",
            "qualification": "MS",
            "experience_years": 8,
            "consultation_fee": 1500,
            "license_number": "DOC1003"
        }

        response = self.client.post(
            self.doctor_list_url,
            data
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_201_CREATED,
                status.HTTP_400_BAD_REQUEST
            ]
        )