def calculate_health_risk_score(age, bmi, systolic_bp, sugar_level, stress_score):

    score = 0

    if age >= 60:
        score += 20
    elif age >= 40:
        score += 10

    if bmi >= 30:
        score += 20
    elif bmi >= 25:
        score += 10

    if systolic_bp >= 150:
        score += 20
    elif systolic_bp >= 130:
        score += 10

    if sugar_level >= 180:
        score += 20
    elif sugar_level >= 130:
        score += 10

    if stress_score >= 75:
        score += 20
    elif stress_score >= 50:
        score += 10

    score = min(score, 100)

    if score >= 70:
        level = 'high'
    elif score >= 40:
        level = 'medium'
    else:
        level = 'low'

    return {
        'risk_score': score,
        'risk_level': level,
        'confidence': round(0.60 + (score / 250), 2),
    }
