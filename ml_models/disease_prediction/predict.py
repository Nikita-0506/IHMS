from pathlib import Path

import joblib
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / 'ml_models' / 'trained_models' / 'disease_prediction_model.joblib'


def _predict_with_trained_model(payload):
	try:
		if not MODEL_PATH.exists():
			return None

		artifact = joblib.load(MODEL_PATH)
		model = artifact['model']
		feature_columns = artifact.get('feature_columns', [])
		if not feature_columns:
			return None

		row = {col: payload.get(col) for col in feature_columns}
		input_df = pd.DataFrame([row], columns=feature_columns)

		prediction = model.predict(input_df)[0]
		confidence = None
		if hasattr(model, 'predict_proba'):
			probabilities = model.predict_proba(input_df)[0]
			confidence = float(max(probabilities))

		return {
			'prediction': str(prediction),
			'confidence': round(confidence, 4) if confidence is not None else None,
			'meta': {
				'source': 'trained_model',
				'model_path': str(MODEL_PATH),
			},
		}
	except Exception:
		return None


def predict_disease(payload):

	trained_result = _predict_with_trained_model(payload)
	if trained_result is not None:
		return trained_result

	symptoms = payload.get('symptoms', [])

	symptom_count = len(symptoms)

	if symptom_count >= 6:

		risk = 'high'
		confidence = 0.84

	elif symptom_count >= 3:

		risk = 'medium'
		confidence = 0.73

	else:

		risk = 'low'
		confidence = 0.62

	return {
		'prediction': f'{risk}_risk_condition',
		'confidence': confidence,
		'meta': {
			'symptom_count': symptom_count,
			'source': 'fallback_rule',
		},
	}

