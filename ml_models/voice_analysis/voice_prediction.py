from pathlib import Path

import joblib
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / 'ml_models' / 'trained_models' / 'voice_analysis_model.joblib'


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
		for col in feature_columns:
			input_df[col] = pd.to_numeric(input_df[col], errors='coerce')
		input_df = input_df.fillna(0.0)

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


def predict_voice_stress(payload):

	trained_result = _predict_with_trained_model(payload)
	if trained_result is not None:
		return trained_result

	pitch_variance = float(payload.get('pitch_variance', 0))

	speaking_rate = float(payload.get('speaking_rate', 0))

	composite_score = (pitch_variance * 0.6) + (speaking_rate * 0.4)

	if composite_score >= 70:

		label = 'high_voice_stress'
		confidence = 0.88

	elif composite_score >= 40:

		label = 'moderate_voice_stress'
		confidence = 0.76

	else:

		label = 'low_voice_stress'
		confidence = 0.67

	return {
		'prediction': label,
		'confidence': confidence,
		'meta': {
			'composite_score': round(composite_score, 2),
			'source': 'fallback_rule',
		},
	}

