from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ai_analysis.chatbot.assistant import MedicalChatAssistant
from ai_analysis.inference.risk_score_engine import calculate_health_risk_score
from ai_analysis.preprocessing.health_data_cleaner import clean_patient_health_payload
from ai_analysis.ocr_scanner.prescription_ocr import extract_prescription_fields
from services.history.history_service import HistoryService


class AIRiskScoreAPIView(APIView):

    permission_classes = [IsAuthenticated]

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

    def post(self, request):

        text = request.data.get('text', '')

        extracted = extract_prescription_fields(text)

        return Response({
            'success': True,
            'message': 'Prescription text extracted',
            'data': extracted,
        }, status=status.HTTP_200_OK)
