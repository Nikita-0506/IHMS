from pathlib import Path
import joblib
import pandas as pd
import numpy as np

from ml_models.patient_monitoring.feature_engineering import prepare_features

BASE_DIR = Path(__file__).resolve().parents[2]
TRIAGE_MODEL_PATH = BASE_DIR / 'ml_models' / 'trained_models' / 'patient_triage_model.joblib'
CARE_UNIT_MODEL_PATH = BASE_DIR / 'ml_models' / 'trained_models' / 'care_unit_model.joblib'

_triage_artifact = None
_care_unit_artifact = None

def _get_triage_model():
    global _triage_artifact
    if _triage_artifact is None:
        if not TRIAGE_MODEL_PATH.exists():
            raise FileNotFoundError(f"Triage model not found at {TRIAGE_MODEL_PATH}. Run training first.")
        _triage_artifact = joblib.load(TRIAGE_MODEL_PATH)
    return _triage_artifact

def _get_care_unit_model():
    global _care_unit_artifact
    if _care_unit_artifact is None:
        if not CARE_UNIT_MODEL_PATH.exists():
            return None
        _care_unit_artifact = joblib.load(CARE_UNIT_MODEL_PATH)
    return _care_unit_artifact

def compute_clinical_alerts(features_row):
    """
    Identifies high-priority physiological alert triggers based on clinical thresholds.
    """
    alerts = []
    spo2 = float(features_row.get('spo2_percent', 98.0))
    hr = float(features_row.get('heart_rate_bpm', 80.0))
    sbp = float(features_row.get('systolic_bp_mmhg', 120.0))
    dbp = float(features_row.get('diastolic_bp_mmhg', 75.0))
    resp = float(features_row.get('respiratory_rate_bpm', 16.0))
    temp = float(features_row.get('temperature_c', 37.0))
    glucose = float(features_row.get('blood_glucose_mg_dl', 110.0))
    gcs = int(features_row.get('gcs_score', 15))
    pain = int(features_row.get('pain_score', 0))
    ecg = str(features_row.get('ecg_rhythm', '')).strip()

    if spo2 < 92.0:
        alerts.append(f"Severe Hypoxemia (SpO2 {spo2:.1f}% < 92%)")
    elif spo2 < 95.0:
        alerts.append(f"Borderline Hypoxia (SpO2 {spo2:.1f}% < 95%)")

    if gcs <= 8:
        alerts.append(f"Severe Neurological Impairment (GCS {gcs} <= 8 / Coma danger)")
    elif gcs <= 12:
        alerts.append(f"Altered Consciousness / GCS Depression (GCS {gcs} <= 12)")

    if sbp < 90.0:
        alerts.append(f"Hypotensive Shock Risk (SBP {sbp:.0f} mmHg < 90)")
    elif sbp >= 160.0:
        alerts.append(f"Hypertensive Crisis Risk (SBP {sbp:.0f} mmHg >= 160)")

    if hr > 120.0:
        alerts.append(f"Severe Tachycardia (Heart Rate {hr:.0f} bpm > 120)")
    elif hr < 50.0:
        alerts.append(f"Marked Bradycardia (Heart Rate {hr:.0f} bpm < 50)")

    if resp > 28.0:
        alerts.append(f"Severe Tachypnea (Respiratory Rate {resp:.0f} bpm > 28)")
    elif resp < 10.0:
        alerts.append(f"Bradypnea / Respiratory Failure Risk (Resp {resp:.0f} bpm < 10)")

    if temp > 38.8:
        alerts.append(f"High Fever / Sepsis Risk (Temp {temp:.1f}°C > 38.8°C)")
    elif temp < 35.5:
        alerts.append(f"Hypothermia (Temp {temp:.1f}°C < 35.5°C)")

    if glucose > 220.0:
        alerts.append(f"Severe Hyperglycemia (Glucose {glucose:.0f} mg/dL > 220)")

    if pain >= 8:
        alerts.append(f"Acute Severe Pain Score ({pain}/10)")

    if ecg in ('Atrial Fibrillation', 'ST-T Changes', 'Sinus Tachycardia'):
        alerts.append(f"Abnormal ECG Rhythm ({ecg})")

    return alerts

def predict_patient_clinical_status(patient_dict_or_row):
    """
    Main inference entrypoint.
    Returns predicted monitoring level, deterioration risk score, care unit recommendation,
    prediction confidence probabilities, and physiological alert flags.
    """
    triage_art = _get_triage_model()
    triage_model = triage_art['model']
    classes = triage_art['classes']

    # 1. Feature Engineering
    features_df = prepare_features(patient_dict_or_row)

    # 2. Triage prediction & probabilities
    pred_level = triage_model.predict(features_df)[0]
    probabilities = {}
    confidence = 0.85
    if hasattr(triage_model, 'predict_proba'):
        raw_probs = triage_model.predict_proba(features_df)[0]
        probabilities = {cls_name: round(float(prob), 4) for cls_name, prob in zip(classes, raw_probs)}
        confidence = float(max(raw_probs))

    # Calculate Composite Clinical Risk Score (0-100)
    # Continuous prob (weight 1.0) + Enhanced prob (weight 0.5) scaled to 0-100
    prob_cont = probabilities.get('Continuous', 0.0)
    prob_enh = probabilities.get('Enhanced', 0.0)
    prob_rout = probabilities.get('Routine', 0.0)
    risk_score = round((prob_cont * 100.0) + (prob_enh * 50.0), 2)

    if risk_score >= 60.0 or pred_level == 'Continuous':
        deterioration_risk = 'High'
    elif risk_score >= 25.0 or pred_level == 'Enhanced':
        deterioration_risk = 'Moderate'
    else:
        deterioration_risk = 'Low'

    # 3. Care Unit recommendation
    recommended_care_unit = "General Ward"
    care_unit_art = _get_care_unit_model()
    if care_unit_art:
        try:
            care_unit_model = care_unit_art['model']
            recommended_care_unit = str(care_unit_model.predict(features_df)[0])
        except Exception:
            pass
    else:
        if pred_level == 'Continuous':
            recommended_care_unit = 'Intensive Care Unit'
        elif pred_level == 'Enhanced':
            recommended_care_unit = 'Emergency Department'

    # 4. Clinical Alert Triggers
    row_data = patient_dict_or_row if isinstance(patient_dict_or_row, dict) else patient_dict_or_row.to_dict()
    alerts = compute_clinical_alerts(row_data)

    return {
        'predicted_monitoring_level': str(pred_level),
        'prediction_confidence': round(confidence, 4),
        'risk_score': risk_score,
        'deterioration_risk': deterioration_risk,
        'recommended_care_unit': recommended_care_unit,
        'class_probabilities': probabilities,
        'clinical_alerts': alerts,
        'meta': {
            'model_name': 'patient_triage_random_forest',
            'model_accuracy': triage_art['metrics']['accuracy'],
            'macro_f1': triage_art['metrics']['macro_f1'],
            'features_analyzed': len(features_df.columns)
        }
    }
