from ml_models.disease_prediction.predict import predict_disease
from ml_models.mental_health.predict_stress import predict_stress
from ml_models.voice_analysis.voice_prediction import predict_voice_stress
try:
    from ml_models.patient_monitoring.predict_monitoring import predict_patient_clinical_status
except Exception:
    def predict_patient_clinical_status(payload):
        return {'error': 'ML patient monitoring unavailable without joblib/pandas.'}

try:
    from ml_models.patient_monitoring.predict_20sheets import predict_patient_deterioration_20sheets
except Exception:
    def predict_patient_deterioration_20sheets(payload):
        return {'error': 'ML 20-sheets model unavailable without joblib/pandas.'}


MODEL_REGISTRY = {
    'disease_prediction': predict_disease,
    'mental_health': predict_stress,
    'voice_analysis': predict_voice_stress,
    'patient_monitoring': predict_patient_clinical_status,
    'patient_triage': predict_patient_clinical_status,
    'patient_deterioration_20sheets': predict_patient_deterioration_20sheets,
}


def get_predictor(model_name):

    if model_name not in MODEL_REGISTRY:

        raise ValueError(f'Unknown model name: {model_name}')

    return MODEL_REGISTRY[model_name]
