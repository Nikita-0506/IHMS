import uuid

from django.urls import reverse

from rest_framework.test import APITestCase
from rest_framework import status

from .models import User


class AuthenticationTestCase(APITestCase):

    def setUp(self):

        self.register_url = reverse('register')

        self.login_url = reverse('token_obtain_pair')

        self.test_user_data = {

            "username": f"user_{uuid.uuid4().hex[:8]}",

            "email": f"test_{uuid.uuid4().hex[:8]}@gmail.com",

            "password": "StrongPassword@123",

            "password2": "StrongPassword@123",

            "role": "admin",

            "phone_number": "9876543210"
        }

    # =========================================
    # USER REGISTRATION TEST
    # =========================================

    def test_user_registration_success(self):

        response = self.client.post(
            self.register_url,
            self.test_user_data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            response.data
        )

        self.assertTrue(

            User.objects.filter(
                email=self.test_user_data['email']
            ).exists()
        )

    # =========================================
    # DUPLICATE EMAIL TEST
    # =========================================

    def test_duplicate_email_registration(self):

        User.objects.create_user(

            username='existing_user',

            email='existing@gmail.com',

            password='StrongPassword@123',

            role='doctor'
        )

        duplicate_data = {

            "username": "new_user",

            "email": "existing@gmail.com",

            "password": "StrongPassword@123",

            "password2": "StrongPassword@123",

            "role": "doctor"
        }

        response = self.client.post(
            self.register_url,
            duplicate_data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    # =========================================
    # RE-REGISTER SOFT-DELETED USER TEST
    # =========================================

    def test_soft_deleted_user_can_register_again(self):

        requester = User.objects.create_user(

            username='request_admin',

            email='request_admin@gmail.com',

            password='StrongPassword@123',

            role='admin'
        )

        self.client.force_authenticate(user=requester)

        deleted_user = User.objects.create_user(

            username='deleted_user',

            email='deleted@gmail.com',

            password='StrongPassword@123',

            role='admin'
        )

        deleted_user.is_deleted = True
        deleted_user.is_active = False
        deleted_user.save(update_fields=['is_deleted', 'is_active', 'updated_at'])

        payload = {

            "username": "deleted_user",

            "email": "deleted@gmail.com",

            "password": "StrongPassword@123",

            "password2": "StrongPassword@123",

            "role": "doctor"
        }

        response = self.client.post(
            self.register_url,
            payload,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
            f"Unexpected response: {response.data}"
        )

        deleted_user.refresh_from_db()
        self.assertFalse(deleted_user.is_deleted)
        self.assertTrue(deleted_user.is_active)

    # =========================================
    # PASSWORD MISMATCH TEST
    # =========================================

    def test_password_mismatch(self):

        invalid_data = self.test_user_data.copy()

        invalid_data['password2'] = "WrongPassword@123"

        response = self.client.post(
            self.register_url,
            invalid_data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

    # =========================================
    # LOGIN TEST
    # =========================================

    def test_login_success(self):

        user = User.objects.create_user(

            username=f"user_{uuid.uuid4().hex[:8]}",

            email=f"login_{uuid.uuid4().hex[:8]}@gmail.com",

            password='StrongPassword@123',

            role='admin'
        )

        login_data = {

            "email": user.email,

            "password": "StrongPassword@123"
        }

        response = self.client.post(
            self.login_url,
            login_data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertIn('access', response.data)

        self.assertIn('refresh', response.data)

    # =========================================
    # INVALID LOGIN TEST
    # =========================================

    def test_invalid_login(self):

        login_data = {

            "email": "invalid@gmail.com",

            "password": "WrongPassword@123"
        }

        response = self.client.post(
            self.login_url,
            login_data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    # =========================================
    # PROTECTED API TEST
    # =========================================

    def test_authenticated_user_access(self):

        user = User.objects.create_user(

            username=f"user_{uuid.uuid4().hex[:8]}",

            email=f"protected_{uuid.uuid4().hex[:8]}@gmail.com",

            password='StrongPassword@123',

            role='admin'
        )

        login_response = self.client.post(

            self.login_url,

            {
                "email": user.email,
                "password": "StrongPassword@123"
            },

            format='json'
        )

        access_token = login_response.data['access']

        self.client.credentials(

            HTTP_AUTHORIZATION=f'Bearer {access_token}'
        )

        protected_url = reverse('test')

        response = self.client.get(protected_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    # =========================================
    # UNAUTHORIZED ACCESS TEST
    # =========================================

    def test_unauthorized_access(self):

        protected_url = reverse('test')

        response = self.client.get(protected_url)

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )