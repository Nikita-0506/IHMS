import logging

from celery import shared_task

from ml_models.disease_prediction.train_model import train_disease_model
from ml_models.mental_health.train_model import train_mental_health_model
from ml_models.voice_analysis.train_model import train_voice_model
from services.history.history_service import HistoryService


logger = logging.getLogger(__name__)


@shared_task(name='ai_analysis.retrain_all_models')
def retrain_all_models_task():
    results = []

    for model_name, trainer in (
        ('disease_prediction', train_disease_model),
        ('mental_health', train_mental_health_model),
        ('voice_analysis', train_voice_model),
    ):
        result = trainer()
        HistoryService.save_ai_history(
            model_name=f'{model_name}_scheduled_retrain',
            patient_id='system',
            prediction=result,
        )
        results.append(result)

    logger.info('Scheduled retraining completed for %s models', len(results))
    return results
