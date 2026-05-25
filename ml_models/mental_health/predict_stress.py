def predict_stress(payload):

	stress_score = float(payload.get('stress_score', 0))

	if stress_score >= 75:

		label = 'high_stress'
		confidence = 0.86

	elif stress_score >= 45:

		label = 'moderate_stress'
		confidence = 0.78

	else:

		label = 'low_stress'
		confidence = 0.69

	return {
		'prediction': label,
		'confidence': confidence,
		'meta': {
			'stress_score': stress_score,
		},
	}

