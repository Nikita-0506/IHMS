from django.test import TestCase
from uuid import uuid4

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from patients.models import Patient
from ai_analysis.models import AIAnalysis


class AIAnalysisAPITestCase(TestCase):

    def setUp(self):

        self.client = APIClient()

        self.admin_user = self._create_user('admin')
        self.patient_user = self._create_user('patient')
        self.doctor_user = self._create_user('doctor')
        self.lab_staff_user = self._create_user('lab_staff')

        self.patient = Patient.objects.create(
            user=self.patient_user,
            patient_id='AI-PAT-1001',
            blood_group='A+',
            gender='female',
            date_of_birth='1998-10-10',
            emergency_contact='9876543210',
            address='Pune',
        )

        self.analysis = AIAnalysis.objects.create(
            patient=self.patient,
            voice_stress_score=35.5,
            disease_prediction='No major cardiac risk',
            mental_health_result='Mild stress',
            confidence_score=0.88,
            audio_file=SimpleUploadedFile(
                'sample.wav',
                b'audio-content',
                content_type='audio/wav',
            ),
            analysis_report='Initial AI analysis report',
        )

    def _create_user(self, role):

        unique_suffix = uuid4().hex[:8]

        return User.objects.create_user(
            username=f'{role}_{unique_suffix}',
            email=f'{role}_{unique_suffix}@test.com',
            password='Password@123',
            role=role,
        )

    def test_ai_analysis_requires_authentication(self):

        response = self.client.get('/api/ai-analysis/')

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_patient_can_view_own_analysis(self):

        self.client.force_authenticate(user=self.patient_user)

        response = self.client.get('/api/ai-analysis/')

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(len(response.data), 1)

    def test_admin_can_create_analysis(self):

        self.client.force_authenticate(user=self.admin_user)

        response = self.client.post(
            '/api/ai-analysis/',
            {
                'patient': str(self.patient.id),
                'voice_stress_score': 41.2,
                'disease_prediction': 'Possible respiratory risk',
                'mental_health_result': 'Moderate stress',
                'confidence_score': 0.91,
                'audio_file': SimpleUploadedFile(
                    'new_sample.wav',
                    b'new-audio-content',
                    content_type='audio/wav',
                ),
                'analysis_report': 'Generated report',
            },
            format='multipart',
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

    def test_ai_dashboard_allowed_for_staff_roles(self):

        for user in [
            self.admin_user,
            self.doctor_user,
            self.lab_staff_user,
        ]:

            with self.subTest(role=user.role):

                self.client.force_authenticate(user=user)

                response = self.client.get('/api/ai-analysis/dashboard/')

                self.assertEqual(
                    response.status_code,
                    status.HTTP_200_OK,
                )

