from django.urls import path

from api.views.ai_tools_api_view import (
    AIChatAssistantAPIView,
    AIMLModelPredictAPIView,
    AIMLModelRetrainAPIView,
    AIRiskScoreAPIView,
    OCRPrescriptionAPIView,
)


urlpatterns = [
    path('risk-score/', AIRiskScoreAPIView.as_view(), name='ai-risk-score'),
    path('predict/', AIMLModelPredictAPIView.as_view(), name='ai-model-predict'),
    path('retrain/', AIMLModelRetrainAPIView.as_view(), name='ai-model-retrain'),
    path('chat-assistant/', AIChatAssistantAPIView.as_view(), name='ai-chat-assistant'),
    path('ocr-prescription/', OCRPrescriptionAPIView.as_view(), name='ai-ocr-prescription'),
]
