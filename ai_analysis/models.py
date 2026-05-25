import uuid
from django.db import models
from patients.models import Patient

class AIAnalysis(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE
    )

    voice_stress_score = models.FloatField()

    disease_prediction = models.CharField(max_length=255)

    mental_health_result = models.CharField(max_length=255)

    confidence_score = models.FloatField()

    audio_file = models.FileField(upload_to='voice_analysis/')

    analysis_report = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient} - {self.disease_prediction} - {self.created_at}"