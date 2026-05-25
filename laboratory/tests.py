from django.test import TestCase
from uuid import uuid4

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from doctors.models import Doctor
from laboratory.models import LaboratoryReport
from patients.models import Patient


class LaboratoryReportAPITestCase(TestCase):

    def setUp(self):

        self.client = APIClient()

        self.admin_user = self._create_user('admin')
        self.lab_user = self._create_user('lab_staff')
        self.patient_user = self._create_user('patient')
        self.doctor_user = self._create_user('doctor')

        self.patient = Patient.objects.create(
            user=self.patient_user,
            patient_id='LAB-PAT-1001',
            blood_group='B+',
            gender='male',
            date_of_birth='1992-07-10',
            emergency_contact='9876543210',
            address='Pune',
        )

        self.doctor = Doctor.objects.create(
            user=self.doctor_user,
            specialization='Pathology',
            availability='available',
            department='Laboratory',
            qualification='MD',
            experience_years=8,
            consultation_fee=500,
            license_number='LAB-DC-1001',
        )

        self.report = LaboratoryReport.objects.create(
            patient=self.patient,
            doctor=self.doctor,
            lab_staff=self.lab_user,
            test_name='CBC',
            test_description='Routine blood test',
            report_file=SimpleUploadedFile(
                'report.pdf',
                b'pdf-content',
                content_type='application/pdf',
            ),
            report_status='processing',
        )

    def _create_user(self, role):

        unique_suffix = uuid4().hex[:8]

        return User.objects.create_user(
            username=f'{role}_{unique_suffix}',
            email=f'{role}_{unique_suffix}@test.com',
            password='Password@123',
            role=role,
        )

    def test_laboratory_list_requires_authentication(self):

        response = self.client.get('/api/laboratory/')

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_patient_can_list_own_reports(self):

        self.client.force_authenticate(user=self.patient_user)

        response = self.client.get('/api/laboratory/')

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(response.data['count'], 1)

    def test_lab_staff_can_create_report(self):

        self.client.force_authenticate(user=self.lab_user)

        response = self.client.post(
            '/api/laboratory/',
            {
                'patient': str(self.patient.id),
                'doctor': str(self.doctor.id),
                'test_name': 'Lipid Profile',
                'test_description': 'Cholesterol check',
                'report_file': SimpleUploadedFile(
                    'lipid-report.pdf',
                    b'pdf-content',
                    content_type='application/pdf',
                ),
                'report_status': 'pending',
            },
            format='multipart',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

    def test_read_roles_can_access_laboratory_dashboard(self):

        for user in [
            self.admin_user,
            self.lab_user,
            self.doctor_user,
            self.patient_user,
        ]:

            with self.subTest(role=user.role):

                self.client.force_authenticate(user=user)

                response = self.client.get('/api/laboratory/dashboard/')

                self.assertEqual(
                    response.status_code,
                    status.HTTP_200_OK,
                )

