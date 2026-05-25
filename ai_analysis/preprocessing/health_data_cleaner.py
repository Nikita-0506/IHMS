def clean_patient_health_payload(payload):

    return {
        'age': int(payload.get('age', 0) or 0),
        'bmi': float(payload.get('bmi', 0) or 0),
        'systolic_bp': float(payload.get('systolic_bp', 0) or 0),
        'sugar_level': float(payload.get('sugar_level', 0) or 0),
        'stress_score': float(payload.get('stress_score', 0) or 0),
    }
