from django.test import TestCase
from uuid import uuid4

from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from notifications.models import Notification


class NotificationsAPITestCase(TestCase):

    def setUp(self):

        self.client = APIClient()

        self.admin_user = self._create_user('admin')
        self.patient_user = self._create_user('patient')
        self.doctor_user = self._create_user('doctor')
        self.receptionist_user = self._create_user('receptionist')

        self.notification = Notification.objects.create(
            user=self.patient_user,
            title='Appointment Reminder',
            message='Your appointment is tomorrow at 10 AM.',
            notification_type='appointment',
            priority='high',
            delivery_status='sent',
        )

        self.other_user_notification = Notification.objects.create(
            user=self.doctor_user,
            title='Doctor Alert',
            message='Emergency patient assigned.',
            notification_type='emergency',
            priority='critical',
            delivery_status='sent',
        )

    def _create_user(self, role):

        unique_suffix = uuid4().hex[:8]

        return User.objects.create_user(
            username=f'{role}_{unique_suffix}',
            email=f'{role}_{unique_suffix}@test.com',
            password='Password@123',
            role=role,
        )

    def test_notifications_require_authentication(self):

        response = self.client.get('/api/notifications/')

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_patient_lists_only_own_notifications(self):

        self.client.force_authenticate(user=self.patient_user)

        response = self.client.get('/api/notifications/all/')

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]['user'],
            str(self.patient_user.id),
        )

    def test_admin_can_list_all_notifications(self):

        self.client.force_authenticate(user=self.admin_user)

        response = self.client.get('/api/notifications/all/')

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data), 2)

    def test_mark_notification_as_read(self):

        self.client.force_authenticate(user=self.patient_user)

        response = self.client.patch(
            f'/api/notifications/{self.notification.id}/mark-read/'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.notification.refresh_from_db()

        self.assertTrue(self.notification.is_read)

    def test_patient_creates_notification_for_self(self):

        self.client.force_authenticate(user=self.patient_user)

        response = self.client.post(
            '/api/notifications/',
            {
                'user': str(self.admin_user.id),
                'title': 'Billing update',
                'message': 'Your invoice is generated.',
                'notification_type': 'billing',
                'priority': 'medium',
            },
            format='json',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        created_notification = Notification.objects.get(id=response.data['id'])

        self.assertEqual(created_notification.user, self.patient_user)

    def test_supported_roles_can_access_notification_reader_endpoints(self):

        allowed_roles = [
            self.admin_user,
            self.patient_user,
            self.doctor_user,
            self.receptionist_user,
        ]

        for user in allowed_roles:

            with self.subTest(role=user.role):

                self.client.force_authenticate(user=user)

                response = self.client.get('/api/notifications/unread-count/')

                self.assertEqual(
                    response.status_code,
                    status.HTTP_200_OK,
                )
