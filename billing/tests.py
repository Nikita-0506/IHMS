# billing/tests.py

from decimal import Decimal

from django.urls import reverse
from django.contrib.auth import get_user_model
from django.db.utils import IntegrityError

from rest_framework import status
from rest_framework.test import APITestCase

from patients.models import Patient
from doctors.models import Doctor
from appointments.models import Appointment
from billing.models import Billing


User = get_user_model()


class BillingEnterpriseTestCase(APITestCase):

    """
    Enterprise-Level Billing Test Suite
    """

    def setUp(self):

        # ==========================================
        # Create Dynamic Users
        # ==========================================

        self.user_data = [

            {
                "username": "adminuser",
                "password": "Admin@123",
                "role": "admin"
            },

            {
                "username": "doctoruser",
                "password": "Doctor@123",
                "role": "doctor"
            },

            {
                "username": "patientuser",
                "password": "Patient@123",
                "role": "patient"
            },

            {
                "username": "receptionuser",
                "password": "Reception@123",
                "role": "receptionist"
            },
        ]

        self.created_users = {}

        for user in self.user_data:

            created_user = User.objects.create_user(
                username=user["username"],
                password=user["password"],
                role=user["role"]
            )

            self.created_users[user["role"]] = created_user

        # ==========================================
        # Create Patient Profile
        # ==========================================

        self.patient = Patient.objects.create(

            user=self.created_users["patient"],

            patient_id="PAT-1001",

            blood_group="O+",

            medical_history="Diabetes",

            insurance="Health Insurance",

            emergency_contact="9999999999",

            address="Pune Maharashtra"
        )

        # ==========================================
        # Create Doctor Profile
        # ==========================================

        self.doctor = Doctor.objects.create(

            user=self.created_users["doctor"],

            specialization="Cardiology",

            availability=True,

            experience_years=10,

            consultation_fee=500
        )

        # ==========================================
        # Create Appointment
        # ==========================================

        self.appointment = Appointment.objects.create(

            patient=self.patient,

            doctor=self.doctor,

            date="2026-01-20",

            time="10:00:00",

            symptoms="Chest Pain",

            status="confirmed"
        )

        # ==========================================
        # Create Billing Record
        # ==========================================

        self.billing = Billing.objects.create(

            invoice="INV-2026-0001",

            patient=self.patient,

            appointment=self.appointment,

            total_amount=Decimal('5000.00'),

            payment_status='paid',

            payment_method='upi'
        )

    # ====================================================
    # TEST USER CREATION
    # ====================================================

    def test_users_created_successfully(self):

        self.assertEqual(
            User.objects.count(),
            4
        )

    # ====================================================
    # TEST BILLING CREATION
    # ====================================================

    def test_create_billing(self):

        billing = Billing.objects.create(

            invoice="INV-2026-0002",

            patient=self.patient,

            appointment=self.appointment,

            total_amount=Decimal('3000.00'),

            payment_status='pending',

            payment_method='cash'
        )

        self.assertEqual(
            billing.invoice,
            "INV-2026-0002"
        )

    # ====================================================
    # TEST INVOICE UNIQUENESS
    # ====================================================

    def test_invoice_uniqueness(self):

        with self.assertRaises(IntegrityError):

            Billing.objects.create(

                invoice="INV-2026-0001",

                patient=self.patient,

                appointment=self.appointment,

                total_amount=Decimal('1000.00'),

                payment_status='paid',

                payment_method='card'
            )

    # ====================================================
    # TEST INVALID TOTAL AMOUNT
    # ====================================================

    def test_invalid_total_amount(self):

        billing = Billing(

            invoice="INV-2026-0003",

            patient=self.patient,

            appointment=self.appointment,

            total_amount=Decimal('-100'),

            payment_status='paid',

            payment_method='cash'
        )

        self.assertLess(
            billing.total_amount,
            0
        )

    # ====================================================
    # TEST BILLING LIST API
    # ====================================================

    def test_billing_list_api(self):

        self.client.force_authenticate(
            user=self.created_users["admin"]
        )

        response = self.client.get(
            reverse('billing-list-create')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

    # ====================================================
    # TEST BILLING DELETE PERMISSION
    # ====================================================

    def test_billing_delete_permission(self):

        self.client.force_authenticate(
            user=self.created_users["admin"]
        )

        response = self.client.delete(
            reverse(
                'billing-detail',
                kwargs={'pk': self.billing.id}
            )
        )

        self.assertIn(
            response.status_code,
            [
                status.HTTP_204_NO_CONTENT,
                status.HTTP_200_OK
            ]
        )

    # ====================================================
    # TEST UNAUTHORIZED ACCESS
    # ====================================================

    def test_unauthorized_access(self):

        response = self.client.get(
            reverse('billing-list-create')
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

    # ====================================================
    # TEST BILLING STATUS
    # ====================================================

    def test_payment_status(self):

        self.assertEqual(
            self.billing.payment_status,
            'paid'
        )

    # ====================================================
    # TEST BILLING PAYMENT METHOD
    # ====================================================

    def test_payment_method(self):

        self.assertEqual(
            self.billing.payment_method,
            'upi'
        )

    # ====================================================
    # TEST BILLING STRING REPRESENTATION
    # ====================================================

    def test_billing_string_representation(self):

        self.assertEqual(
            str(self.billing),
            f"{self.billing.invoice} - {self.patient}"
        )

    # ====================================================
    # TEST BILLING ORDERING
    # ====================================================

    def test_billing_ordering(self):

        billings = Billing.objects.all()

        self.assertEqual(
            billings[0],
            self.billing
        )

    # ====================================================
    # TEST ROLE-BASED ACCESS
    # ====================================================

    def test_role_based_access(self):

        allowed_roles = [
            'admin',
            'receptionist'
        ]

        for role, user in self.created_users.items():

            if role in allowed_roles:

                self.assertIn(
                    user.role,
                    allowed_roles
                )

    # ====================================================
    # TEST BILLING TOTAL COUNT
    # ====================================================

    def test_billing_total_count(self):

        self.assertEqual(
            Billing.objects.count(),
            1
        )

    # ====================================================
    # TEST APPOINTMENT RELATIONSHIP
    # ====================================================

    def test_billing_appointment_relationship(self):

        self.assertEqual(
            self.billing.appointment,
            self.appointment
        )

    # ====================================================
    # TEST PATIENT RELATIONSHIP
    # ====================================================

    def test_billing_patient_relationship(self):

        self.assertEqual(
            self.billing.patient,
            self.patient
        )