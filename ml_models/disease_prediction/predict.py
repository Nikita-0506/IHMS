def predict_disease(payload):

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
		},
	}

