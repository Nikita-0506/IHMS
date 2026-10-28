from pathlib import Path
import joblib
import pandas as pd
import numpy as np

BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / 'ml_models' / 'trained_models' / 'patient_deterioration_20sheets_model.joblib'

_model_artifact = None

def get_20sheets_model():
    global _model_artifact
    if _model_artifact is None:
        if not MODEL_PATH.exists():
            from scripts.train_20_sheets_ml_model import train_20_sheets_model
            train_20_sheets_model()
        _model_artifact = joblib.load(MODEL_PATH)
    return _model_artifact

def predict_patient_deterioration_20sheets(payload):
    """
    Inference function for patient deterioration risk using the 20-sheets trained model.
    Accepts raw vitals or pre-computed synthetic features.
    """
    model = get_20sheets_model()

    sbp = float(payload.get('Systolic_BP_mmHg') or payload.get('systolic_bp_mmhg') or payload.get('bp_systolic') or 120.0)
    temp = float(payload.get('Temperature_C') or payload.get('temperature_c') or 37.0)
    spo2 = float(payload.get('SpO2_percent') or payload.get('spo2_percent') or payload.get('oxygen_level') or 98.0)
    hr = float(payload.get('Heart_Rate_bpm') or payload.get('heart_rate_bpm') or payload.get('heart_rate') or 80.0)
    gcs = int(payload.get('GCS_Score') or payload.get('gcs_score') or 15)
    pain = int(payload.get('Pain_Score_0_10') or payload.get('pain_score') or 0)

    visits_last_12 = int(payload.get('Visits_Last_12_Months', 2))
    active_conds = int(payload.get('Active_Conditions_Count', 1))
    med_count = int(payload.get('Medication_Count', 2))
    pending_tests = int(payload.get('Pending_Test_Count', 1))

    # Auto-derive severity indicators if not explicitly provided
    symp = payload.get('Symptom_Severity_Text')
    emerg = payload.get('Emergency_Flag')
    assess = payload.get('Assessment_Severity')

    if not symp:
        if spo2 < 91 or sbp < 90 or gcs < 10 or hr > 120 or temp > 38.5:
            symp = 'Severe'
        elif spo2 < 95 or sbp > 150 or pain > 6:
            symp = 'Moderate'
        else:
            symp = 'Mild'

    if not emerg:
        emerg = 'Yes' if (spo2 < 91 or sbp < 90 or gcs <= 8 or temp > 39.0) else 'No'

    if not assess:
        if symp == 'Severe' or emerg == 'Yes':
            assess = 'Critical'
        elif symp == 'Moderate':
            assess = 'Moderate'
        else:
            assess = 'Low'

    transfer_flag = payload.get('Transfer_Flag', 'No')

    row = {
        'Visits_Last_12_Months': visits_last_12,
        'Active_Conditions_Count': active_conds,
        'Medication_Count': med_count,
        'Pending_Test_Count': pending_tests,
        'Systolic_BP_mmHg': sbp,
        'Temperature_C': temp,
        'SpO2_percent': spo2,
        'Symptom_Severity_Text': symp,
        'Transfer_Flag': transfer_flag,
        'Emergency_Flag': emerg,
        'Assessment_Severity': assess
    }

    df_in = pd.DataFrame([row])
    pred = model.predict(df_in)[0]
    classes = list(model.classes_)
    probas = model.predict_proba(df_in)[0]

    prob_dict = {cls: round(float(prob), 4) for cls, prob in zip(classes, probas)}

    # Weighted risk score (0-100)
    class_weights = {'Low': 0.15, 'Moderate': 0.45, 'High': 0.75, 'Critical': 0.95}
    score = sum(prob * class_weights.get(cls, 0.5) for prob, cls in zip(probas, classes))
    risk_score = round(float(score) * 100, 1)

    # Clinical action advice
    if pred == 'Critical' or risk_score >= 70.0:
        action = 'Immediate ICU/CCU resuscitation & urgent physician escalation required.'
        urgency = 'Immediate'
    elif pred == 'High' or risk_score >= 55.0:
        action = 'Enhanced Step-Down Ward monitoring with continuous vitals tracking.'
        urgency = 'High'
    elif pred == 'Moderate' or risk_score >= 40.0:
        action = 'Regular Inpatient Ward monitoring every 4 hours.'
        urgency = 'Medium'
    else:
        action = 'Routine OPD/General Ward observation.'
        urgency = 'Routine'

    return {
        'model_name': 'patient_deterioration_20sheets_model',
        'predicted_risk_level': str(pred),
        'risk_score': float(risk_score),
        'urgency': urgency,
        'recommended_clinical_action': action,
        'class_probabilities': prob_dict,
        'confidence': round(float(max(probas)), 4),
        'input_vitals': {
            'sbp': sbp,
            'temp': temp,
            'spo2': spo2,
            'hr': hr,
            'gcs': gcs,
            'pain': pain
        }
    }
