from ml_models.disease_prediction.predict import predict_disease
from ml_models.mental_health.predict_stress import predict_stress
from ml_models.voice_analysis.voice_prediction import predict_voice_stress


MODEL_REGISTRY = {
    'disease_prediction': predict_disease,
    'mental_health': predict_stress,
    'voice_analysis': predict_voice_stress,
}


def get_predictor(model_name):

    if model_name not in MODEL_REGISTRY:

        raise ValueError(f'Unknown model name: {model_name}')

    return MODEL_REGISTRY[model_name]
