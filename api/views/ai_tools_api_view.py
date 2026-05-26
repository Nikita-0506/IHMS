from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema

from ai_analysis.chatbot.assistant import MedicalChatAssistant
from ai_analysis.inference.risk_score_engine import calculate_health_risk_score
from ai_analysis.preprocessing.health_data_cleaner import clean_patient_health_payload
from ai_analysis.ocr_scanner.prescription_ocr import extract_prescription_fields
from api.permissions.admin_permission import IsAdminRole
from ml_models.disease_prediction.train_model import train_disease_model
from ml_models.mental_health.train_model import train_mental_health_model
from ml_models.model_registry import get_predictor
from ml_models.voice_analysis.train_model import train_voice_model
from services.history.history_service import HistoryService


RETRAIN_REQUEST_SCHEMA = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['model_name'],
    properties={
        'model_name': openapi.Schema(
            type=openapi.TYPE_STRING,
            enum=['all', 'disease_prediction', 'mental_health', 'voice_analysis'],
            description='Choose which model to retrain.',
            example='all',
        ),
    },
)

PREDICT_REQUEST_SCHEMA = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['model_name', 'payload'],
    properties={
        'model_name': openapi.Schema(
            type=openapi.TYPE_STRING,
            enum=['disease_prediction', 'mental_health', 'voice_analysis'],
            example='disease_prediction',
        ),
        'patient_id': openapi.Schema(
            type=openapi.TYPE_STRING,
            example='P1001',
        ),
        'payload': openapi.Schema(
            type=openapi.TYPE_OBJECT,
            description='Model input payload. Use dataset-aligned fields for best accuracy.',
            example={
                'age': 41,
                'gender': 'male',
                'bp_systolic': 138,
                'bp_diastolic': 89,
                'sugar_level': 162,
                'cholesterol': 225,
                'bmi': 30.2,
                'heart_rate': 94,
                'oxygen_level': 97,
                'symptoms': 'fatigue,headache,joint pain',
                'admission_type': 'Emergency',
                'doctor_department': 'General Medicine',
            },
        ),
    },
)

SUCCESS_RESPONSE_SCHEMA = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'success': openapi.Schema(type=openapi.TYPE_BOOLEAN),
        'message': openapi.Schema(type=openapi.TYPE_STRING),
        'data': openapi.Schema(type=openapi.TYPE_OBJECT),
    },
)


class AIRiskScoreAPIView(APIView):

    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Generate rule-based health risk score',
        operation_description='Calculates risk score from cleaned patient health payload and stores AI history.',
        responses={200: SUCCESS_RESPONSE_SCHEMA},
    )

    def post(self, request):

        cleaned_payload = clean_patient_health_payload(request.data)

        prediction = calculate_health_risk_score(**cleaned_payload)

        patient_id = request.data.get('patient_id', 'unknown')

        HistoryService.save_ai_history(
            model_name='risk_score_engine',
            patient_id=patient_id,
            prediction=prediction,
        )

        return Response({
            'success': True,
            'message': 'Risk score generated successfully',
            'data': prediction,
        }, status=status.HTTP_200_OK)


class AIChatAssistantAPIView(APIView):

    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Get AI chat assistant response',
        responses={200: SUCCESS_RESPONSE_SCHEMA},
    )

    def post(self, request):

        query = request.data.get('query', '')

        answer = MedicalChatAssistant.answer(query)

        return Response({
            'success': True,
            'message': 'Assistant response generated',
            'data': answer,
        }, status=status.HTTP_200_OK)


class OCRPrescriptionAPIView(APIView):

    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Extract prescription information from text',
        responses={200: SUCCESS_RESPONSE_SCHEMA},
    )

    def post(self, request):

        text = request.data.get('text', '')

        extracted = extract_prescription_fields(text)

        return Response({
            'success': True,
            'message': 'Prescription text extracted',
            'data': extracted,
        }, status=status.HTTP_200_OK)


class AIMLModelRetrainAPIView(APIView):

    permission_classes = [IsAuthenticated, IsAdminRole]

    _trainers = {
        'disease_prediction': train_disease_model,
        'mental_health': train_mental_health_model,
        'voice_analysis': train_voice_model,
    }

    @swagger_auto_schema(
        operation_summary='Retrain one or all ML models using connected datasets',
        operation_description='Admin-only endpoint. Trains model artifacts under ml_models/trained_models/.',
        request_body=RETRAIN_REQUEST_SCHEMA,
        responses={200: SUCCESS_RESPONSE_SCHEMA},
    )

    def post(self, request):
        model_name = request.data.get('model_name', 'all')

        if model_name == 'all':
            targets = list(self._trainers.items())
        else:
            if model_name not in self._trainers:
                raise ValidationError({'model_name': 'Unsupported model_name.'})
            targets = [(model_name, self._trainers[model_name])]

        results = []
        for name, trainer in targets:
            result = trainer()
            HistoryService.save_ai_history(
                model_name=f'{name}_retrain',
                patient_id='system',
                prediction=result,
            )
            results.append(result)

        return Response({
            'success': True,
            'message': 'Model retraining completed.',
            'data': results,
        }, status=status.HTTP_200_OK)


class AIMLModelPredictAPIView(APIView):

    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(
        operation_summary='Run model inference using trained artifact',
        operation_description='Uses model_registry and prefers trained model artifacts with fallback rules.',
        request_body=PREDICT_REQUEST_SCHEMA,
        responses={200: SUCCESS_RESPONSE_SCHEMA},
    )

    def post(self, request):
        model_name = request.data.get('model_name')
        payload = request.data.get('payload', {})
        patient_id = request.data.get('patient_id', 'unknown')

        if not model_name:
            raise ValidationError({'model_name': 'model_name is required.'})

        if not isinstance(payload, dict):
            raise ValidationError({'payload': 'payload must be a JSON object.'})

        predictor = get_predictor(model_name)
        prediction = predictor(payload)

        HistoryService.save_ai_history(
            model_name=model_name,
            patient_id=patient_id,
            prediction=prediction,
        )

        return Response({
            'success': True,
            'message': 'Prediction generated successfully.',
            'data': prediction,
        }, status=status.HTTP_200_OK)
