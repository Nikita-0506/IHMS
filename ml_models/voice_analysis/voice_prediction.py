def predict_voice_stress(payload):

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
		},
	}

