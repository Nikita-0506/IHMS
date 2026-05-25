from django.test import TestCase
from uuid import uuid4

from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User


class DashboardAPITestCase(TestCase):

    def setUp(self):

        self.client = APIClient()

        self.admin_user = self._create_user('admin')
        self.receptionist_user = self._create_user('receptionist')
        self.patient_user = self._create_user('patient')

    def _create_user(self, role):

        unique_suffix = uuid4().hex[:8]

        return User.objects.create_user(
            username=f'{role}_{unique_suffix}',
            email=f'{role}_{unique_suffix}@test.com',
            password='Password@123',
            role=role,
        )

    def test_dashboard_requires_authentication(self):

        response = self.client.get('/api/dashboard/')

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_dashboard_access_for_admin(self):

        self.client.force_authenticate(user=self.admin_user)

        response = self.client.get('/api/dashboard/')

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn('metrics', response.data)

    def test_dashboard_forbidden_for_patient(self):

        self.client.force_authenticate(user=self.patient_user)

        response = self.client.get('/api/dashboard/')

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_dashboard_access_for_all_manager_roles(self):

        for user in [
            self.admin_user,
            self.receptionist_user,
        ]:

            with self.subTest(role=user.role):

                self.client.force_authenticate(user=user)

                response = self.client.get('/api/dashboard/')

                self.assertEqual(
                    response.status_code,
                    status.HTTP_200_OK,
                )
