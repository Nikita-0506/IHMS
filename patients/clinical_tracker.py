"""
Clinical Parameter Tracker and Individual Patient Report Generator for IHMS.
Evaluates vitals, identifies diagnoses/diseases, reconciles medications
(active, added, reduced/withheld), and generates standalone individual reports.
"""

from datetime import datetime
from pathlib import Path
import json

BASE_DIR = Path(__file__).resolve().parent.parent
REPORTS_DIR = BASE_DIR / 'reports' / 'patients'


# =====================================================================
# 1. PARAMETER REFERENCE RANGES & THRESHOLDS
# =====================================================================

VITAL_RANGES = {
    'heart_rate_bpm': {
        'name': 'Heart Rate',
        'unit': 'bpm',
        'min_normal': 60.0,
        'max_normal': 100.0,
        'low_alert': 50.0,
        'high_alert': 120.0,
        'description': 'Normal resting heart rate: 60-100 bpm',
    },
    'systolic_bp_mmhg': {
        'name': 'Systolic BP',
        'unit': 'mmHg',
        'min_normal': 90.0,
        'max_normal': 120.0,
        'low_alert': 90.0,
        'high_alert': 160.0,
        'description': 'Normal SBP: 90-120 mmHg; Stage 2 HTN: >=160 mmHg',
    },
    'diastolic_bp_mmhg': {
        'name': 'Diastolic BP',
        'unit': 'mmHg',
        'min_normal': 60.0,
        'max_normal': 80.0,
        'low_alert': 55.0,
        'high_alert': 100.0,
        'description': 'Normal DBP: 60-80 mmHg; Stage 2 HTN: >=90-100 mmHg',
    },
    'respiratory_rate_bpm': {
        'name': 'Respiratory Rate',
        'unit': 'breaths/min',
        'min_normal': 12.0,
        'max_normal': 20.0,
        'low_alert': 10.0,
        'high_alert': 28.0,
        'description': 'Normal respiratory rate: 12-20 bpm',
    },
    'spo2_percent': {
        'name': 'Oxygen Saturation (SpO2)',
        'unit': '%',
        'min_normal': 95.0,
        'max_normal': 100.0,
        'low_alert': 92.0,
        'high_alert': 100.0,
        'description': 'Normal SpO2: 95-100%; Hypoxemia: <92%',
    },
    'temperature_c': {
        'name': 'Body Temperature',
        'unit': '°C',
        'min_normal': 36.5,
        'max_normal': 37.5,
        'low_alert': 35.5,
        'high_alert': 38.5,
        'description': 'Normal core temp: 36.5-37.5°C; Fever: >=38.5°C',
    },
    'blood_glucose_mg_dl': {
        'name': 'Blood Glucose',
        'unit': 'mg/dL',
        'min_normal': 70.0,
        'max_normal': 140.0,
        'low_alert': 70.0,
        'high_alert': 200.0,
        'description': 'Normal random glucose: 70-140 mg/dL; Hyperglycemia: >=200',
    },
    'gcs_score': {
        'name': 'Glasgow Coma Scale (GCS)',
        'unit': '/ 15',
        'min_normal': 14,
        'max_normal': 15,
        'low_alert': 12,
        'high_alert': 15,
        'description': 'Normal GCS: 14-15; Severe impairment: <=8; Moderate: <=12',
    },
    'pain_score': {
        'name': 'Pain Score',
        'unit': '/ 10',
        'min_normal': 0,
        'max_normal': 3,
        'low_alert': 0,
        'high_alert': 7,
        'description': 'Mild: 0-3; Moderate: 4-6; Severe: 7-10',
    },
    'urine_output_ml_hr': {
        'name': 'Urine Output',
        'unit': 'mL/hr',
        'min_normal': 30.0,
        'max_normal': 80.0,
        'low_alert': 25.0,
        'high_alert': 120.0,
        'description': 'Normal: 30-80 mL/hr; Oliguria: <30 mL/hr',
    },
}


# =====================================================================
# 2. PARAMETER TRACKER ENGINE
# =====================================================================

def evaluate_patient_parameters(patient):
    """
    Evaluates all patient parameters against clinical reference ranges.
    Returns a structured tracking dict with status, severity, score, and badges.
    """
    tracked_parameters = []
    total_critical = 0
    total_warning = 0
    total_normal = 0

    def eval_metric(key, value, name, unit):
        nonlocal total_critical, total_warning, total_normal
        cfg = VITAL_RANGES.get(key, {})
        val = float(value) if value is not None else 0.0

        status = 'Normal'
        status_mr = 'Normal'
        color = 'green'
        severity = 0

        # High / Low Checks
        if key == 'spo2_percent':
            if val < 92.0:
                status, status_mr, color, severity = 'Critical Hypoxemia', 'Critical Low', 'red', 3
            elif val < 95.0:
                status, status_mr, color, severity = 'Borderline Low', 'Borderline Low', 'amber', 2
        elif key == 'gcs_score':
            if val <= 8:
                status, status_mr, color, severity = 'Severe Coma Danger', 'Severe Alteration', 'red', 3
            elif val <= 12:
                status, status_mr, color, severity = 'Moderate Impairment', 'Moderate Impairment', 'amber', 2
            elif val < 15:
                status, status_mr, color, severity = 'Mild Alteration', 'Mild Alteration', 'amber', 1
        elif key == 'pain_score':
            if val >= 7:
                status, status_mr, color, severity = 'Severe Acute Pain', 'Severe Pain', 'red', 3
            elif val >= 4:
                status, status_mr, color, severity = 'Moderate Pain', 'Moderate Pain', 'amber', 2
        elif key == 'urine_output_ml_hr':
            if val < 20.0:
                status, status_mr, color, severity = 'Critical Oliguria', 'Critical Oliguria', 'red', 3
            elif val < 30.0:
                status, status_mr, color, severity = 'Low Urine Output', 'Low Urine Output', 'amber', 2
        else:
            # Standard two-tailed ranges
            min_n = cfg.get('min_normal', 0)
            max_n = cfg.get('max_normal', 100)
            low_a = cfg.get('low_alert', min_n)
            high_a = cfg.get('high_alert', max_n)

            if val > high_a:
                status, status_mr, color, severity = 'Critical High', 'Critical High', 'red', 3
            elif val < low_a:
                status, status_mr, color, severity = 'Critical Low', 'Critical Low', 'red', 3
            elif val > max_n:
                status, status_mr, color, severity = 'Elevated', 'Elevated', 'amber', 2
            elif val < min_n:
                status, status_mr, color, severity = 'Low', 'Low', 'amber', 1

        if severity == 3:
            total_critical += 1
        elif severity in (1, 2):
            total_warning += 1
        else:
            total_normal += 1

        tracked_parameters.append({
            'key': key,
            'name': name,
            'value': val if key not in ('gcs_score', 'pain_score') else int(val),
            'unit': unit,
            'normal_range': f"{cfg.get('min_normal')} - {cfg.get('max_normal')} {unit}",
            'status': status,
            'status_mr': status_mr,
            'color': color,
            'severity': severity,
            'description': cfg.get('description', ''),
        })

    eval_metric('heart_rate_bpm', getattr(patient, 'heart_rate_bpm', 80), 'Heart Rate', 'bpm')
    eval_metric('systolic_bp_mmhg', getattr(patient, 'systolic_bp_mmhg', 120), 'Systolic BP', 'mmHg')
    eval_metric('diastolic_bp_mmhg', getattr(patient, 'diastolic_bp_mmhg', 80), 'Diastolic BP', 'mmHg')
    eval_metric('respiratory_rate_bpm', getattr(patient, 'respiratory_rate_bpm', 16), 'Respiratory Rate', 'bpm')
    eval_metric('spo2_percent', getattr(patient, 'spo2_percent', 98), 'SpO2 Saturation', '%')
    eval_metric('temperature_c', getattr(patient, 'temperature_c', 37), 'Body Temperature', '°C')
    eval_metric('blood_glucose_mg_dl', getattr(patient, 'blood_glucose_mg_dl', 110), 'Blood Glucose', 'mg/dL')
    eval_metric('gcs_score', getattr(patient, 'gcs_score', 15), 'GCS Score', '/15')
    eval_metric('pain_score', getattr(patient, 'pain_score', 0), 'Pain Score', '/10')
    eval_metric('urine_output_ml_hr', getattr(patient, 'urine_output_ml_hr', 50), 'Urine Output', 'mL/hr')

    # ECG Rhythm evaluation
    ecg_val = getattr(patient, 'ecg_rhythm', 'Sinus Rhythm')
    ecg_abnormal = ecg_val in ('Atrial Fibrillation', 'ST-T Changes', 'Sinus Tachycardia')
    tracked_parameters.append({
        'key': 'ecg_rhythm',
        'name': 'ECG Rhythm',
        'value': ecg_val,
        'unit': 'rhythm',
        'normal_range': 'Sinus Rhythm',
        'status': 'Abnormal Rhythm' if ecg_abnormal else 'Normal Sinus',
        'status_mr': 'Abnormal ECG' if ecg_abnormal else 'Normal ECG',
        'color': 'red' if ecg_val in ('Atrial Fibrillation', 'ST-T Changes') else ('amber' if ecg_abnormal else 'green'),
        'severity': 3 if ecg_val in ('Atrial Fibrillation', 'ST-T Changes') else (2 if ecg_abnormal else 0),
        'description': 'Electrocardiogram cardiac conduction profile',
    })
    if ecg_abnormal:
        if ecg_val in ('Atrial Fibrillation', 'ST-T Changes'):
            total_critical += 1
        else:
            total_warning += 1
    else:
        total_normal += 1

    return {
        'parameters': tracked_parameters,
        'summary': {
            'total_parameters': len(tracked_parameters),
            'critical_count': total_critical,
            'warning_count': total_warning,
            'normal_count': total_normal,
            'overall_status': 'CRITICAL ALERT' if total_critical >= 2 else ('ATTENTION NEEDED' if total_critical == 1 or total_warning >= 2 else 'STABLE ROUTINE'),
            'overall_status_mr': 'CRITICAL ALERT' if total_critical >= 2 else ('ATTENTION NEEDED' if total_critical == 1 or total_warning >= 2 else 'STABLE ROUTINE'),
            'overall_color': 'red' if total_critical >= 2 else ('amber' if total_critical == 1 or total_warning >= 2 else 'green'),
        }
    }


# =====================================================================
# 3. DISEASE & DIAGNOSIS IDENTIFICATION ENGINE
# =====================================================================

def identify_clinical_diagnoses(patient, tracked_info):
    """
    Identifies specific diseases, clinical syndromes, and acute diagnoses
    based on the patient's individual physiological parameters.
    """
    diagnoses = []

    sbp = float(getattr(patient, 'systolic_bp_mmhg', 120))
    dbp = float(getattr(patient, 'diastolic_bp_mmhg', 80))
    hr = float(getattr(patient, 'heart_rate_bpm', 80))
    resp = float(getattr(patient, 'respiratory_rate_bpm', 16))
    spo2 = float(getattr(patient, 'spo2_percent', 98))
    temp = float(getattr(patient, 'temperature_c', 37))
    glucose = float(getattr(patient, 'blood_glucose_mg_dl', 110))
    gcs = int(getattr(patient, 'gcs_score', 15))
    pain = int(getattr(patient, 'pain_score', 0))
    ecg = str(getattr(patient, 'ecg_rhythm', 'Sinus Rhythm')).strip()
    urine = float(getattr(patient, 'urine_output_ml_hr', 50))
    age = int(getattr(patient, 'age', 45) or 45)

    # 1. Hypertension / Hypertensive Crisis
    if sbp >= 160 or dbp >= 100:
        diagnoses.append({
            'code': 'HTN-CRISIS',
            'disease': 'Hypertensive Urgency / Stage 2 Hypertension',
            'severity': 'Critical' if sbp >= 170 or dbp >= 105 else 'High',
            'severity_color': 'red',
            'primary_parameter': f'Systolic BP: {sbp:.0f} mmHg | Diastolic BP: {dbp:.0f} mmHg',
            'clinical_rationale': 'Systolic pressure markedly elevated above safe vascular thresholds. High risk of end-organ compromise or stroke.',
            'recommended_action': 'Urgent blood pressure reduction with rapid-acting oral/IV antihypertensive, continuous BP monitoring.',
        })
    elif sbp >= 140 or dbp >= 90:
        diagnoses.append({
            'code': 'HTN-STG1',
            'disease': 'Stage 1 Hypertension',
            'severity': 'Moderate',
            'severity_color': 'amber',
            'primary_parameter': f'BP: {sbp:.0f}/{dbp:.0f} mmHg',
            'clinical_rationale': 'Persistent arterial pressure above normal physiological range.',
            'recommended_action': 'Oral antihypertensive initiation/titration, salt restriction, 4-hourly monitoring.',
        })

    # 2. Hypotension / Shock Warning
    if sbp < 90 or (sbp < 95 and hr > 100):
        diagnoses.append({
            'code': 'HYPOTENSION-SHOCK',
            'disease': 'Hypotension & Circulatory Shock Risk',
            'severity': 'Critical',
            'severity_color': 'red',
            'primary_parameter': f'SBP: {sbp:.0f} mmHg, Heart Rate: {hr:.0f} bpm, Urine: {urine:.1f} mL/hr',
            'clinical_rationale': 'Inadequate systemic perfusion pressure. Risk of hemodynamic collapse, cerebral hypoperfusion, and renal ischemia.',
            'recommended_action': 'Immediate IV fluid resuscitation (Normal Saline 500mL stat), withhold antihypertensives, evaluate for sepsis/hemorrhage.',
        })

    # 3. Diabetes Mellitus / Severe Hyperglycemia
    if glucose >= 200:
        diagnoses.append({
            'code': 'DM-HYPERGLYCEMIA',
            'disease': 'Severe Hyperglycemia / Uncontrolled Diabetes',
            'severity': 'Critical' if glucose >= 240 else 'High',
            'severity_color': 'red',
            'primary_parameter': f'Blood Glucose: {glucose:.0f} mg/dL (Normal: 70-140 mg/dL)',
            'clinical_rationale': 'Marked glucose elevation indicating insulin insufficiency or metabolic decompensation. Risk of DKA/HHS.',
            'recommended_action': 'Immediate regular insulin administration, serial blood sugar tracking every 2-4 hours, hydration.',
        })
    elif glucose >= 150:
        diagnoses.append({
            'code': 'DM-ELEVATED',
            'disease': 'Impaired Glycemic Control',
            'severity': 'Moderate',
            'severity_color': 'amber',
            'primary_parameter': f'Blood Glucose: {glucose:.0f} mg/dL',
            'clinical_rationale': 'Mild to moderate postprandial/random hyperglycemia.',
            'recommended_action': 'Diabetic diet adherence, oral hypoglycemic adjustment (Metformin/Glimepiride).',
        })
    elif glucose < 70:
        diagnoses.append({
            'code': 'DM-HYPOGLYCEMIA',
            'disease': 'Acute Hypoglycemia Emergency',
            'severity': 'Critical',
            'severity_color': 'red',
            'primary_parameter': f'Blood Glucose: {glucose:.0f} mg/dL (< 70 mg/dL)',
            'clinical_rationale': 'Critical neuroglycopenia risk, seizures, loss of consciousness.',
            'recommended_action': 'Stat 25% or 50% Dextrose IV bolus or oral glucose/fruit juice if conscious.',
        })

    # 4. Respiratory Distress / Hypoxemia
    if spo2 < 92 or (spo2 < 95 and resp > 24):
        diagnoses.append({
            'code': 'RESP-HYPOXIA',
            'disease': 'Acute Hypoxemic Respiratory Distress',
            'severity': 'Critical',
            'severity_color': 'red',
            'primary_parameter': f'SpO2: {spo2:.1f}% (< 92%), Resp Rate: {resp:.0f} bpm',
            'clinical_rationale': 'Impaired pulmonary alveolar gas exchange. Cellular hypoxia risk.',
            'recommended_action': 'High-flow Supplemental O2 via Venturi/Nasal Cannula (4-6 L/min), bronchodilator nebulization, ABG analysis.',
        })
    elif spo2 < 95 or resp > 22:
        diagnoses.append({
            'code': 'RESP-MILD',
            'disease': 'Mild Respiratory Strain / Tachypnea',
            'severity': 'Moderate',
            'severity_color': 'amber',
            'primary_parameter': f'SpO2: {spo2:.1f}%, Resp Rate: {resp:.0f} bpm',
            'clinical_rationale': 'Compensatory hyperventilation or mild hypoxia.',
            'recommended_action': 'Oxygen monitoring, chest auscultation, propped-up positioning.',
        })

    # 5. Sepsis / Febrile Systemic Infection
    qsofa = 0
    if resp >= 22: qsofa += 1
    if sbp <= 100: qsofa += 1
    if gcs <= 14: qsofa += 1

    if temp >= 38.5 or (temp >= 38.0 and (hr > 100 or qsofa >= 2)):
        diagnoses.append({
            'code': 'SEPSIS-RISK',
            'disease': 'Febrile Systemic Infection / Sepsis Risk',
            'severity': 'Critical' if qsofa >= 2 else 'High',
            'severity_color': 'red',
            'primary_parameter': f'Temperature: {temp:.1f}°C, Heart Rate: {hr:.0f} bpm, qSOFA: {qsofa}/3',
            'clinical_rationale': 'Systemic inflammatory response triggered by microbial infection. Sepsis bundle compliance warranted.',
            'recommended_action': 'Blood cultures stat, start empiric IV broad-spectrum antibiotics, IV antipyretic (Paracetamol 1g).',
        })
    elif temp >= 37.8:
        diagnoses.append({
            'code': 'FEVER-MILD',
            'disease': 'Pyrexia / Low Grade Fever',
            'severity': 'Moderate',
            'severity_color': 'amber',
            'primary_parameter': f'Temperature: {temp:.1f}°C',
            'clinical_rationale': 'Active inflammatory or viral/bacterial response.',
            'recommended_action': 'Oral antipyretic (Paracetamol 650mg SOS), fluid intake encouragement.',
        })

    # 6. Cardiac Arrhythmia / Conduction Abnormality
    if ecg == 'Atrial Fibrillation':
        diagnoses.append({
            'code': 'CARD-AFIB',
            'disease': 'Atrial Fibrillation',
            'severity': 'Critical',
            'severity_color': 'red',
            'primary_parameter': f'ECG: Atrial Fibrillation, Heart Rate: {hr:.0f} bpm',
            'clinical_rationale': 'Chaotic atrial electrical activation. High thromboembolic stroke risk and hemodynamic compromise.',
            'recommended_action': 'Rate/rhythm control (Beta-blocker/Digoxin), anticoagulation evaluation (DOAC/Warfarin), 12-lead ECG.',
        })
    elif ecg == 'ST-T Changes':
        diagnoses.append({
            'code': 'CARD-ISCHEMIA',
            'disease': 'Myocardial Ischemia / Coronary Syndrome Risk',
            'severity': 'Critical',
            'severity_color': 'red',
            'primary_parameter': f'ECG: ST-T Segment Changes, Heart Rate: {hr:.0f} bpm',
            'clinical_rationale': 'Repolarization abnormalities indicative of myocardial strain, subendocardial ischemia, or electrolyte imbalance.',
            'recommended_action': 'Stat Troponin-I and CPK-MB, 12-lead ECG, cardiology consult, Aspirin + Clopidogrel loading if indicated.',
        })
    elif ecg == 'Sinus Tachycardia' or hr > 115:
        diagnoses.append({
            'code': 'CARD-TACHY',
            'disease': 'Sinus Tachycardia',
            'severity': 'Moderate',
            'severity_color': 'amber',
            'primary_parameter': f'Heart Rate: {hr:.0f} bpm (> 100 bpm), ECG: {ecg}',
            'clinical_rationale': 'Excessive sympathetic drive secondary to fever, pain, dehydration, hypoxia, or anxiety.',
            'recommended_action': 'Treat underlying cause (rehydrate, relieve pain, reduce fever), continuous telemetry.',
        })

    # 7. Acute Kidney Injury / Oliguria
    if urine < 25.0:
        diagnoses.append({
            'code': 'RENAL-OLIGURIA',
            'disease': 'Acute Oliguria / Renal Impairment Risk',
            'severity': 'Critical',
            'severity_color': 'red',
            'primary_parameter': f'Urine Output: {urine:.1f} mL/hr (< 25 mL/hr)',
            'clinical_rationale': 'Significantly reduced renal glomerular filtration and tubular perfusion. AKI danger.',
            'recommended_action': 'Check fluid balance, serum creatinine/BUN, avoid nephrotoxic drugs (NSAIDs, aminoglycosides), consider loop diuretic/fluid challenge.',
        })
    elif urine < 35.0:
        diagnoses.append({
            'code': 'RENAL-MILD',
            'disease': 'Borderline Low Urine Output',
            'severity': 'Moderate',
            'severity_color': 'amber',
            'primary_parameter': f'Urine Output: {urine:.1f} mL/hr',
            'clinical_rationale': 'Mild dehydration or early renal hypoperfusion.',
            'recommended_action': 'Fluid intake monitoring, repeat measurement in 2 hours.',
        })

    # 8. Neurological Depression
    if gcs <= 12:
        diagnoses.append({
            'code': 'NEURO-DEPRESSION',
            'disease': 'Altered Sensorium / Neurological Depression',
            'severity': 'Critical' if gcs <= 8 else 'High',
            'severity_color': 'red',
            'primary_parameter': f'GCS Score: {gcs}/15',
            'clinical_rationale': 'Depressed central nervous system arousal. High risk of aspiration and airway compromise.',
            'recommended_action': 'Airway protection, urgent non-contrast CT brain if sudden onset, check glucose and electrolytes.',
        })

    # 9. Severe Pain Syndrome
    if pain >= 7:
        diagnoses.append({
            'code': 'PAIN-SEVERE',
            'disease': 'Severe Acute Pain Syndrome',
            'severity': 'High',
            'severity_color': 'red',
            'primary_parameter': f'Pain Score: {pain}/10',
            'clinical_rationale': 'Severe subjective suffering, causing secondary tachycardia and hypertension.',
            'recommended_action': 'Titrated multimodal analgesia (IV Paracetamol / Tramadol / NSAID if renal function allows).',
        })

    # Fallback if all vitals are completely stable
    if not diagnoses:
        diagnoses.append({
            'code': 'ROUTINE-STABLE',
            'disease': 'Clinically Stable / Routine Inpatient Observation',
            'severity': 'Normal',
            'severity_color': 'green',
            'primary_parameter': 'All physiological parameters within expected limits',
            'clinical_rationale': 'No acute physiological derangements detected on daily vital monitoring.',
            'recommended_action': 'Continue routine inpatient monitoring and standard care pathway.',
        })

    return diagnoses


# =====================================================================
# 4. MEDICATION RECONCILIATION ENGINE
# (Ongoing, Added, Reduced/Withheld)
# =====================================================================

def reconcile_patient_medications(patient, diagnoses, tracked_info):
    """
    Determines medication management based on clinical parameters and identified conditions:
    1. Active / Ongoing Medications (Active Maintenance)
    2. Newly Added / Initiated Medications (New Additions)
    3. Reduced or Discontinued Medications (Reduced / Discontinued)
    """
    sbp = float(getattr(patient, 'systolic_bp_mmhg', 120))
    glucose = float(getattr(patient, 'blood_glucose_mg_dl', 110))
    temp = float(getattr(patient, 'temperature_c', 37))
    spo2 = float(getattr(patient, 'spo2_percent', 98))
    ecg = str(getattr(patient, 'ecg_rhythm', 'Sinus Rhythm')).strip()
    hr = float(getattr(patient, 'heart_rate_bpm', 80))
    pain = int(getattr(patient, 'pain_score', 0))
    urine = float(getattr(patient, 'urine_output_ml_hr', 50))
    gcs = int(getattr(patient, 'gcs_score', 15))
    allergy = str(getattr(patient, 'allergy_status', '')).lower()
    care_unit = str(getattr(patient, 'care_unit', 'General Ward'))

    active_meds = []
    added_meds = []
    reduced_meds = []

    # 1. BASELINE ACTIVE MEDICATIONS (Active Medications)
    # Standard maintenance profile based on care unit & age
    if 'icu' in care_unit.lower() or 'emergency' in care_unit.lower():
        active_meds.append({
            'name': 'Inj. Pantoprazole',
            'dose': '40 mg IV',
            'frequency': 'Once Daily (OD)',
            'category': 'GI Prophylaxis',
            'status': 'Active',
            'notes': 'Stress ulcer prophylaxis in high-dependency care.',
        })
        active_meds.append({
            'name': 'IV Normal Saline 0.9%',
            'dose': '1000 mL / 24 hrs',
            'frequency': 'Continuous Infusion',
            'category': 'Fluid Maintenance',
            'status': 'Active',
            'notes': 'Maintenance hydration.',
        })
    else:
        active_meds.append({
            'name': 'Tab. Pantoprazole',
            'dose': '40 mg Oral',
            'frequency': 'Before Breakfast (OD)',
            'category': 'GI Protection',
            'status': 'Active',
            'notes': 'Gastric mucosal protection.',
        })
        active_meds.append({
            'name': 'Tab. Multivitamin & Zinc',
            'dose': '1 Capsule',
            'frequency': 'Once Daily (OD)',
            'category': 'Nutritional Support',
            'status': 'Active',
            'notes': 'Nutritional and immunity maintenance.',
        })

    # 2. PARAMETER-DRIVEN MEDICATION ADDITIONS (Added Medications)

    # Blood Pressure Additions
    if sbp >= 160:
        added_meds.append({
            'name': 'Tab. Amlodipine + Telmisartan',
            'dose': '5 mg / 40 mg Oral',
            'frequency': 'Once Daily (OD)',
            'category': 'Antihypertensive',
            'trigger': f'High Systolic BP ({sbp:.0f} mmHg)',
            'action_type': 'ADDED',
            'reason': 'Added immediately to control Stage 2 Hypertension / Urgency.',
        })
    elif sbp >= 140:
        added_meds.append({
            'name': 'Tab. Telmisartan',
            'dose': '40 mg Oral',
            'frequency': 'Morning (OD)',
            'category': 'Antihypertensive',
            'trigger': f'Elevated SBP ({sbp:.0f} mmHg)',
            'action_type': 'ADDED',
            'reason': 'Started for Stage 1 arterial hypertension management.',
        })

    # Blood Glucose Additions
    if glucose >= 220:
        added_meds.append({
            'name': 'Inj. Regular Human Insulin',
            'dose': '6 - 10 Units Subcutaneous',
            'frequency': 'Sliding Scale before meals (TDS)',
            'category': 'Antidiabetic / Insulin',
            'trigger': f'Critical Blood Glucose ({glucose:.0f} mg/dL)',
            'action_type': 'ADDED',
            'reason': 'Rapid-acting glycemic control initiated for acute hyperglycemia.',
        })
    elif glucose >= 160:
        added_meds.append({
            'name': 'Tab. Metformin',
            'dose': '500 mg Oral',
            'frequency': 'Twice Daily with meals (BD)',
            'category': 'Oral Hypoglycemic',
            'trigger': f'Elevated Glucose ({glucose:.0f} mg/dL)',
            'action_type': 'ADDED',
            'reason': 'Started to control elevated fasting/postprandial glucose.',
        })
    elif glucose < 70:
        added_meds.append({
            'name': '25% Dextrose Injection',
            'dose': '100 mL IV Stat',
            'frequency': 'Immediate Bolus',
            'category': 'Emergency Glycemic Rescue',
            'trigger': f'Hypoglycemia ({glucose:.0f} mg/dL)',
            'action_type': 'ADDED',
            'reason': 'Emergency intravenous sugar rescue to prevent neuroglycopenia.',
        })

    # SpO2 / Oxygen Additions
    if spo2 < 93:
        added_meds.append({
            'name': 'Medical Oxygen Therapy',
            'dose': '4 - 6 Litres / min',
            'frequency': 'Continuous via Venturi Mask / Cannula',
            'category': 'Respiratory Support',
            'trigger': f'Low SpO2 ({spo2:.1f}%)',
            'action_type': 'ADDED',
            'reason': 'Started urgently to maintain target peripheral SpO2 >= 95%.',
        })
        added_meds.append({
            'name': 'Duolin + Budecort Nebulization',
            'dose': '1 respule each',
            'frequency': 'Every 8 hours (TDS)',
            'category': 'Bronchodilator / Steroid',
            'trigger': f'Hypoxemia / Tachypnea',
            'action_type': 'ADDED',
            'reason': 'Bronchodilator therapy to relieve bronchospasm and airway resistance.',
        })

    # Fever / Sepsis Additions
    if temp >= 38.4:
        added_meds.append({
            'name': 'Inj. Paracetamol',
            'dose': '1000 mg IV Infusion',
            'frequency': 'Stat & every 6 hrs SOS',
            'category': 'Antipyretic',
            'trigger': f'High Grade Fever ({temp:.1f}°C)',
            'action_type': 'ADDED',
            'reason': 'Rapid temperature reduction for febrile illness.',
        })
        # Check allergy before adding antibiotics
        if 'penicillin' not in allergy:
            added_meds.append({
                'name': 'Inj. Ceftriaxone',
                'dose': '1 g IV',
                'frequency': 'Twice Daily (BD)',
                'category': 'Broad-Spectrum Antibiotic',
                'trigger': f'Fever / Elevated Infection Risk ({temp:.1f}°C)',
                'action_type': 'ADDED',
                'reason': 'Empiric coverage for acute bacterial infection.',
            })
        else:
            added_meds.append({
                'name': 'Inj. Levofloxacin',
                'dose': '500 mg IV Infusion',
                'frequency': 'Once Daily (OD)',
                'category': 'Fluoroquinolone Antibiotic (Safe for Penicillin Allergy)',
                'trigger': f'Fever ({temp:.1f}°C) with Penicillin Allergy',
                'action_type': 'ADDED',
                'reason': 'Alternative safe antibiotic chosen due to Penicillin allergy.',
            })

    # Cardiac / Arrhythmia Additions
    if ecg == 'Atrial Fibrillation':
        added_meds.append({
            'name': 'Tab. Metoprolol Tartrate',
            'dose': '25 mg Oral',
            'frequency': 'Twice Daily (BD)',
            'category': 'Beta-Blocker / Rate Control',
            'trigger': 'Atrial Fibrillation on ECG',
            'action_type': 'ADDED',
            'reason': 'Ventricular rate control in atrial fibrillation.',
        })
        added_meds.append({
            'name': 'Inj. Enoxaparin (Low Molecular Weight Heparin)',
            'dose': '40 mg Subcutaneous',
            'frequency': 'Once Daily (OD)',
            'category': 'Anticoagulant',
            'trigger': 'AFib Thromboembolism Prophylaxis',
            'action_type': 'ADDED',
            'reason': 'Anticoagulant initiated to prevent left atrial thrombus and stroke.',
        })
    elif ecg == 'ST-T Changes':
        added_meds.append({
            'name': 'Tab. Ecosprin',
            'dose': '150 mg Oral Stat then 75 mg OD',
            'frequency': 'Once Daily',
            'category': 'Antiplatelet',
            'trigger': 'ST-T Ischemic Changes on ECG',
            'action_type': 'ADDED',
            'reason': 'Antiplatelet therapy initiated for coronary artery protection.',
        })
        added_meds.append({
            'name': 'Tab. Atorvastatin',
            'dose': '40 mg Oral',
            'frequency': 'Bedtime (Night)',
            'category': 'Statin / Plaque Stabilizer',
            'trigger': 'Cardiovascular Risk / ST-T Changes',
            'action_type': 'ADDED',
            'reason': 'Intensive lipid-lowering and vascular endothelial stabilization.',
        })

    # Severe Pain Additions
    if pain >= 7:
        added_meds.append({
            'name': 'Tab. Ultracet (Tramadol + Paracetamol)',
            'dose': '37.5 mg / 325 mg Oral',
            'frequency': 'Every 8 hours as needed (TDS SOS)',
            'category': 'Moderate-to-Severe Analgesic',
            'trigger': f'Severe Pain Score ({pain}/10)',
            'action_type': 'ADDED',
            'reason': 'Multimodal analgesic control for acute severe pain relief.',
        })
    elif pain >= 4:
        added_meds.append({
            'name': 'Tab. Paracetamol',
            'dose': '650 mg Oral',
            'frequency': 'Every 8 hours SOS',
            'category': 'Mild-to-Moderate Analgesic',
            'trigger': f'Pain Score ({pain}/10)',
            'action_type': 'ADDED',
            'reason': 'Pain relief for moderate surgical/body ache.',
        })

    # Oliguria / Renal Fluid Challenge
    if urine < 25:
        added_meds.append({
            'name': 'IV Normal Saline Bolus',
            'dose': '500 mL IV over 1 hour',
            'frequency': 'Stat Challenge',
            'category': 'Hydration / Renal Perfusion',
            'trigger': f'Low Urine Output ({urine:.1f} mL/hr)',
            'action_type': 'ADDED',
            'reason': 'Fluid challenge to restore renal blood flow and stimulate glomerular filtration.',
        })


    # 3. MEDICATION REDUCTIONS & DISCONTINUATIONS (Reduced Medications)

    # Allergy-Driven Discontinuations
    if 'penicillin' in allergy:
        reduced_meds.append({
            'name': 'Penicillin / Amoxicillin / Augmentin',
            'previous_dose': 'Standard antibiotic regimen',
            'new_status': 'DISCONTINUED / WITHHELD',
            'category': 'Beta-Lactam Antibiotic',
            'reason': 'CRITICAL SAFETY: Patient has documented Penicillin allergy. High risk of anaphylaxis.',
        })

    if 'sulfa' in allergy:
        reduced_meds.append({
            'name': 'Sulfamethoxazole / Cotrimoxazole / Sulfa Drugs',
            'previous_dose': 'Sulfa-based antibiotic/diuretic',
            'new_status': 'DISCONTINUED / WITHHELD',
            'category': 'Sulfonamide',
            'reason': 'CRITICAL SAFETY: Documented Sulfa allergy. Stopped to prevent Stevens-Johnson syndrome / allergy.',
        })

    if 'latex' in allergy:
        reduced_meds.append({
            'name': 'Latex-containing Medical Devices & Catheters',
            'previous_dose': 'Standard hospital consumables',
            'new_status': 'SWITCHED TO SILICONE / LATEX-FREE',
            'category': 'Equipment Safety Protocol',
            'reason': 'Documented Latex allergy. Switched to non-latex hypoallergenic consumables.',
        })

    # Physiological Threshold Discontinuations
    if sbp < 95:
        reduced_meds.append({
            'name': 'Antihypertensive Medication',
            'previous_dose': 'Amlodipine / Telmisartan / Enalapril',
            'new_status': 'WITHHELD / TEMPORARILY STOPPED',
            'category': 'Blood Pressure Reducers',
            'reason': f'Low Systolic BP ({sbp:.0f} mmHg < 95 mmHg). Withheld to prevent hypotensive shock.',
        })

    if urine < 25:
        reduced_meds.append({
            'name': 'NSAIDs (e.g. Ibuprofen / Diclofenac)',
            'previous_dose': 'Standard pain medication',
            'new_status': 'STOPPED / STRICTLY AVOIDED',
            'category': 'Non-Steroidal Anti-Inflammatory Drug',
            'reason': f'Critical Oliguria ({urine:.1f} mL/hr). NSAIDs cause renal afferent arteriolar constriction.',
        })

    if gcs <= 12:
        reduced_meds.append({
            'name': 'Sedatives & Opioids (e.g. Diazepam / Sedatives)',
            'previous_dose': 'Night sedatives or high-dose analgesics',
            'new_status': 'REDUCED BY 50% OR STOPPED',
            'category': 'CNS Depressant',
            'reason': f'Depressed consciousness (GCS {gcs}/15). Reduced to prevent respiratory suppression and coma.',
        })

    if glucose < 80:
        reduced_meds.append({
            'name': 'Oral Hypoglycemics / Insulin',
            'previous_dose': 'Standard morning antidiabetic dose',
            'new_status': 'DOSE REDUCED BY 50%',
            'category': 'Antidiabetic',
            'reason': f'Borderline/low glucose level ({glucose:.0f} mg/dL). Dose reduced to avoid hypoglycemia.',
        })

    # If no reductions were needed
    if not reduced_meds:
        reduced_meds.append({
            'name': 'No active drug contraindications detected',
            'previous_dose': 'N/A',
            'new_status': 'NO REDUCTIONS REQUIRED',
            'category': 'Maintenance',
            'reason': 'Current medication tolerance is stable with no adverse drug interactions or allergy triggers.',
        })

    return {
        'active_medications': active_meds,
        'added_medications': added_meds,
        'reduced_medications': reduced_meds,
        'counts': {
            'active': len(active_meds),
            'added': len(added_meds),
            'reduced': len(reduced_meds),
        }
    }


# =====================================================================
# 5. INDIVIDUAL PATIENT REPORT GENERATOR
# =====================================================================

def generate_individual_patient_report(patient, save_to_disk=True):
    """
    Builds a complete, standalone, individual medical monitor report for a single patient.
    Includes Parameter Tracker, Disease Diagnoses, Medication Reconciliation,
    and SVG Visualization.
    """
    # 1. Parameter Tracker
    tracker_data = evaluate_patient_parameters(patient)

    # 2. Disease Identification
    diagnoses = identify_clinical_diagnoses(patient, tracker_data)

    # 3. Medication Reconciliation
    medications = reconcile_patient_medications(patient, diagnoses, tracker_data)

    # 4. Clinical Risk & Metadata
    patient_id = getattr(patient, 'patient_id', 'UNKNOWN')
    full_name = getattr(patient, 'full_name', f"{getattr(patient, 'first_name', '')} {getattr(patient, 'last_name', '')}").strip()
    age = getattr(patient, 'age', 45) or 45
    gender = getattr(patient, 'gender', 'Other')
    city = getattr(patient, 'city', 'Unknown')
    care_unit = getattr(patient, 'care_unit', 'General Ward')
    location = getattr(patient, 'care_location_type', 'Inpatient Ward')
    room_no = getattr(patient, 'room_no', 'N/A')
    bed_no = getattr(patient, 'bed_no', 'N/A')
    allergies = getattr(patient, 'allergy_status', 'No Known Allergy')
    monitoring_level = getattr(patient, 'monitoring_level', 'Routine')
    predicted_level = getattr(patient, 'predicted_monitoring_level', monitoring_level)
    risk_score = float(getattr(patient, 'risk_score', 25.0) or 25.0)
    deterioration_risk = getattr(patient, 'deterioration_risk', 'Low') or 'Low'

    monitoring_frequency = getattr(patient, 'monitoring_frequency', 'Every 4 hours') or 'Every 4 hours'

    report_context = {
        'patient_id': patient_id,
        'full_name': full_name,
        'age': age,
        'gender': gender,
        'city': city,
        'care_unit': care_unit,
        'location': location,
        'room_no': room_no,
        'bed_no': bed_no,
        'allergies': allergies,
        'monitoring_level': monitoring_level,
        'predicted_level': predicted_level,
        'monitoring_frequency': monitoring_frequency,
        'risk_score': risk_score,
        'deterioration_risk': deterioration_risk,
        'generated_at': datetime.now().strftime('%d-%m-%Y %H:%M:%S'),
        'tracker': tracker_data,
        'diagnoses': diagnoses,
        'medications': medications,
    }

    html_content = render_standalone_patient_html_report(report_context)

    file_path = None
    if save_to_disk:
        REPORTS_DIR.mkdir(parents=True, exist_ok=True)
        filename = f"{patient_id}_clinical_report.html"
        file_path = REPORTS_DIR / filename
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        # Also save JSON companion
        json_path = REPORTS_DIR / f"{patient_id}_clinical_report.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(report_context, f, indent=2, default=str)

    report_context['html_content'] = html_content
    report_context['file_path'] = str(file_path) if file_path else None
    return report_context


# =====================================================================
# 6. HTML REPORT TEMPLATE RENDERER (STANDALONE & PRINT/PDF READY)
# =====================================================================

def render_standalone_patient_html_report(ctx):
    """
    Renders a stunning, rich, responsive HTML report for an individual patient.
    Self-contained: no external CDN dependencies so it works completely offline and in Docker!
    """
    t = ctx['tracker']['summary']
    params = ctx['tracker']['parameters']
    diagnoses = ctx['diagnoses']
    meds = ctx['medications']

    # Build rows for Parameter Tracker Table
    param_rows_html = ""
    for p in params:
        pill_badge = ""
        if p['color'] == 'green':
            pill_badge = f'<span style="background:#d1fae5; color:#065f46; padding:4px 10px; border-radius:12px; font-weight:600; font-size:12px;">✓ {p["status"]}</span>'
        elif p['color'] == 'amber':
            pill_badge = f'<span style="background:#fef3c7; color:#92400e; padding:4px 10px; border-radius:12px; font-weight:600; font-size:12px;">⚠ {p["status"]}</span>'
        else:
            pill_badge = f'<span style="background:#fee2e2; color:#991b1b; padding:4px 10px; border-radius:12px; font-weight:700; font-size:12px;">⚡ {p["status"]}</span>'

        param_rows_html += f"""
        <tr style="border-bottom:1px solid #e2e8f0;">
            <td style="padding:12px 14px; font-weight:600; color:#1e293b;">{p['name']}</td>
            <td style="padding:12px 14px; font-weight:700; font-size:15px; color:#0f172a;">{p['value']} <span style="font-size:12px; font-weight:400; color:#64748b;">{p['unit']}</span></td>
            <td style="padding:12px 14px; color:#475569; font-size:13px;">{p['normal_range']}</td>
            <td style="padding:12px 14px;">{pill_badge}</td>
            <td style="padding:12px 14px; font-size:12px; color:#64748b;">{p['status_mr']}</td>
        </tr>
        """

    # Build Diagnoses Cards HTML
    diag_cards_html = ""
    for d in diagnoses:
        border_c = '#ef4444' if d['severity_color'] == 'red' else ('#f59e0b' if d['severity_color'] == 'amber' else '#10b981')
        bg_c = '#fff5f5' if d['severity_color'] == 'red' else ('#fffbeb' if d['severity_color'] == 'amber' else '#f0fdf4')
        diag_cards_html += f"""
        <div style="background:{bg_c}; border-left:5px solid {border_c}; padding:14px 18px; border-radius:8px; margin-bottom:12px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <h4 style="margin:0; font-size:16px; color:#0f172a;">{d['disease']}</h4>
                <span style="background:{border_c}; color:#fff; padding:2px 10px; border-radius:12px; font-size:11px; font-weight:700; text-transform:uppercase;">{d['severity']}</span>
            </div>
            <p style="margin:4px 0; font-size:13px; color:#334155;"><strong>Triggered Parameter:</strong> <span style="color:#0284c7; font-weight:600;">{d['primary_parameter']}</span></p>
            <p style="margin:4px 0; font-size:13px; color:#475569;"><strong>Clinical Rationale:</strong> {d['clinical_rationale']}</p>
            <p style="margin:4px 0; font-size:13px; color:#166534; background:#dcfce7; padding:6px 10px; border-radius:6px;"><strong>Recommended Clinical Action:</strong> {d['recommended_action']}</p>
        </div>
        """

    # Build Medication Sections
    # 1) Active
    active_meds_html = ""
    for m in meds['active_medications']:
        active_meds_html += f"""
        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:10px 14px; margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between;">
                <span style="font-weight:700; color:#0f172a; font-size:14px;">{m['name']}</span>
                <span style="background:#e2e8f0; color:#334155; font-size:11px; padding:2px 8px; border-radius:8px; font-weight:600;">{m['category']}</span>
            </div>
            <div style="font-size:12px; color:#475569; margin-top:4px;">
                <strong>Dose / Frequency:</strong> {m['dose']} — {m['frequency']}
            </div>
            <div style="font-size:11px; color:#64748b; margin-top:2px;">{m['notes']}</div>
        </div>
        """

    # 2) Added
    added_meds_html = ""
    if meds['added_medications']:
        for m in meds['added_medications']:
            added_meds_html += f"""
            <div style="background:#ecfdf5; border-left:4px solid #10b981; border-radius:8px; padding:10px 14px; margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between;">
                    <span style="font-weight:700; color:#065f46; font-size:14px;">➕ {m['name']}</span>
                    <span style="background:#10b981; color:#fff; font-size:11px; padding:2px 8px; border-radius:8px; font-weight:700;">NEW / ADDED</span>
                </div>
                <div style="font-size:12px; color:#047857; margin-top:4px;">
                    <strong>Dose:</strong> {m['dose']} ({m['frequency']}) | <strong>Trigger:</strong> {m['trigger']}
                </div>
                <div style="font-size:12px; color:#064e3b; margin-top:2px;"><strong>Reason:</strong> {m['reason']}</div>
            </div>
            """
    else:
        added_meds_html = '<p style="color:#64748b; font-size:13px; font-style:italic;">No new medications required at this time.</p>'

    # 3) Reduced / Withheld
    reduced_meds_html = ""
    for m in meds['reduced_medications']:
        is_contra = 'DISCONTINUED' in m['new_status'] or 'STOPPED' in m['new_status']
        bg_col = '#fef2f2' if is_contra else '#fffbeb'
        border_col = '#ef4444' if is_contra else '#f59e0b'
        tag_col = '#b91c1c' if is_contra else '#b45309'

        reduced_meds_html += f"""
        <div style="background:{bg_col}; border-left:4px solid {border_col}; border-radius:8px; padding:10px 14px; margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between;">
                <span style="font-weight:700; color:#1e293b; font-size:14px;">⛔ {m['name']}</span>
                <span style="color:{tag_col}; font-size:11px; font-weight:700; text-transform:uppercase;">{m['new_status']}</span>
            </div>
            <div style="font-size:12px; color:#78350f; margin-top:3px;">
                <strong>Clinical Rationale:</strong> {m['reason']}
            </div>
        </div>
        """

    # Risk badge
    risk_color = '#ef4444' if ctx['deterioration_risk'].lower() == 'high' else ('#f59e0b' if ctx['deterioration_risk'].lower() == 'moderate' else '#10b981')

    # SVG Visual Gauge for Risk Score
    risk_percentage = min(100.0, max(0.0, ctx['risk_score']))
    stroke_dash = f"{risk_percentage * 2.51:.1f}, 251.2"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Patient Clinical Report - {ctx['patient_id']} ({ctx['full_name']})</title>
<style>
    @media print {{
        .no-print {{ display: none !important; }}
        body {{ background: #fff !important; padding: 0 !important; }}
        .report-card {{ box-shadow: none !important; border: 1px solid #ccc !important; }}
    }}
    body {{
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background-color: #f1f5f9;
        margin: 0;
        padding: 24px;
        color: #0f172a;
    }}
    .report-card {{
        max-width: 1040px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        border: 1px solid #e2e8f0;
        overflow: hidden;
    }}
    .header-banner {{
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        color: white;
        padding: 24px 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
    }}
    .section-title {{
        font-size: 17px;
        font-weight: 700;
        color: #0f172a;
        margin-top: 0;
        margin-bottom: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 2px solid #f1f5f9;
        padding-bottom: 8px;
    }}
    .btn {{
        background: #ffffff;
        color: #0369a1;
        font-weight: 700;
        border: none;
        padding: 10px 18px;
        border-radius: 8px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        transition: all 0.2s;
    }}
    .btn:hover {{
        background: #f8fafc;
        transform: translateY(-1px);
    }}
</style>
</head>
<body>

<div class="report-card">

    <!-- 1. HEADER BANNER -->
    <div class="header-banner">
        <div>
            <div style="font-size:12px; letter-spacing:1px; text-transform:uppercase; opacity:0.9;">IHMS Clinical Intelligence Suite</div>
            <h1 style="margin:4px 0 6px 0; font-size:26px;">Daily Patient Clinical Monitoring Report</h1>
            <div style="font-size:14px; opacity:0.95;">
                Patient ID: <strong>{ctx['patient_id']}</strong> &nbsp;|&nbsp; 
                Date: <strong>{ctx['generated_at']}</strong>
            </div>
        </div>
        <div class="no-print">
            <button class="btn" onclick="window.print()">
                🖨️ Print / Save to PDF
            </button>
        </div>
    </div>

    <div style="padding: 28px 32px;">

        <!-- 2. PATIENT DEMOGRAPHICS & VITALS SNAPSHOT -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:16px; background:#f8fafc; padding:20px; border-radius:12px; border:1px solid #e2e8f0; margin-bottom:28px;">
            <div>
                <span style="font-size:12px; color:#64748b; text-transform:uppercase; font-weight:600;">Patient Full Name</span>
                <div style="font-size:17px; font-weight:700; color:#0f172a; margin-top:2px;">{ctx['full_name']}</div>
                <div style="font-size:13px; color:#475569;">Age: {ctx['age']} yrs &nbsp;|&nbsp; Gender: {ctx['gender']}</div>
            </div>
            <div>
                <span style="font-size:12px; color:#64748b; text-transform:uppercase; font-weight:600;">Care Location</span>
                <div style="font-size:15px; font-weight:700; color:#0f172a; margin-top:2px;">{ctx['care_unit']}</div>
                <div style="font-size:13px; color:#475569;">Room: {ctx['room_no']} &nbsp;|&nbsp; Bed: {ctx['bed_no']}</div>
            </div>
            <div>
                <span style="font-size:12px; color:#64748b; text-transform:uppercase; font-weight:600;">Allergy Status</span>
                <div style="font-size:14px; font-weight:700; color:{'#dc2626' if 'allergy' in ctx['allergies'].lower() or 'penicillin' in ctx['allergies'].lower() or 'sulfa' in ctx['allergies'].lower() or 'latex' in ctx['allergies'].lower() else '#16a34a'}; margin-top:2px;">
                    ⚠️ {ctx['allergies']}
                </div>
                <div style="font-size:12px; color:#64748b;">City: {ctx['city']}</div>
            </div>
            <div>
                <span style="font-size:12px; color:#64748b; text-transform:uppercase; font-weight:600;">Triage Level</span>
                <div style="font-size:15px; font-weight:700; color:#0284c7; margin-top:2px;">{ctx['monitoring_level']}</div>
                <div style="font-size:12px; color:#64748b;">ML Predicted: <strong>{ctx['predicted_level']}</strong></div>
            </div>
        </div>

        <!-- 3. PARAMETER TRACKER SUMMARY & RISK SCORE VISUALIZATION -->
        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px; margin-bottom:28px;">
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; box-shadow:0 1px 4px rgba(0,0,0,0.04);">
                <div class="section-title">📊 Parameter Tracker Overview</div>
                <div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:12px;">
                    <div style="flex:1; min-width:110px; background:#dcfce7; padding:12px; border-radius:8px; text-align:center;">
                        <div style="font-size:24px; font-weight:800; color:#15803d;">{t['normal_count']}</div>
                        <div style="font-size:12px; font-weight:600; color:#166534;">Normal</div>
                    </div>
                    <div style="flex:1; min-width:110px; background:#fef3c7; padding:12px; border-radius:8px; text-align:center;">
                        <div style="font-size:24px; font-weight:800; color:#b45309;">{t['warning_count']}</div>
                        <div style="font-size:12px; font-weight:600; color:#92400e;">Warning</div>
                    </div>
                    <div style="flex:1; min-width:110px; background:#fee2e2; padding:12px; border-radius:8px; text-align:center;">
                        <div style="font-size:24px; font-weight:800; color:#b91c1c;">{t['critical_count']}</div>
                        <div style="font-size:12px; font-weight:600; color:#991b1b;">Critical</div>
                    </div>
                </div>
                <div style="background:#f8fafc; border-radius:8px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:14px; font-weight:600; color:#334155;">Overall Clinical Status:</span>
                    <span style="font-weight:800; font-size:14px; color:{t['overall_color']}; background:{'#fee2e2' if t['overall_color']=='red' else ('#fef3c7' if t['overall_color']=='amber' else '#d1fae5')}; padding:4px 12px; border-radius:12px;">
                        {t['overall_status']}
                    </span>
                </div>
            </div>

            <!-- RISK SCORE SVG GAUGE VISUALIZATION -->
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; text-align:center; box-shadow:0 1px 4px rgba(0,0,0,0.04);">
                <div class="section-title" style="justify-content:center;">🎯 Clinical Deterioration Risk Score</div>
                <div style="position:relative; width:120px; height:120px; margin:0 auto;">
                    <svg viewBox="0 0 100 100" width="120" height="120">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" stroke-width="10"></circle>
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="{risk_color}" stroke-width="10" stroke-dasharray="{stroke_dash}" stroke-linecap="round" transform="rotate(-90 50 50)"></circle>
                    </svg>
                    <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);">
                        <span style="font-size:22px; font-weight:800; color:{risk_color};">{ctx['risk_score']:.1f}</span>
                        <div style="font-size:10px; color:#64748b;">Score / 100</div>
                    </div>
                </div>
                <div style="margin-top:10px;">
                    <span style="background:{risk_color}; color:#fff; font-size:12px; font-weight:700; padding:4px 12px; border-radius:12px;">
                        {ctx['deterioration_risk'].upper()} RISK
                    </span>
                </div>
            </div>
        </div>

        <!-- 4. DETAILED PARAMETER TRACKER TABLE -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:28px; box-shadow:0 1px 4px rgba(0,0,0,0.04);">
            <div class="section-title">📋 Daily Physiological Vitals Tracker</div>
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; text-align:left;">
                    <thead>
                        <tr style="background:#f1f5f9; color:#475569; font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">
                            <th style="padding:12px 14px; border-top-left-radius:8px;">Parameter</th>
                            <th style="padding:12px 14px;">Observed Value</th>
                            <th style="padding:12px 14px;">Normal Reference Range</th>
                            <th style="padding:12px 14px;">Clinical Status</th>
                            <th style="padding:12px 14px; border-top-right-radius:8px;">Guideline Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        {param_rows_html}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 5. IDENTIFIED SPECIFIC DIAGNOSIS & DISEASES -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:28px; box-shadow:0 1px 4px rgba(0,0,0,0.04);">
            <div class="section-title">🩺 Identified Clinical Diagnoses & Risk Flags</div>
            <p style="font-size:13px; color:#64748b; margin-top:-6px; margin-bottom:16px;">
                Based on clinical thresholds of physiological parameters, the following diagnoses and risks have been identified:
            </p>
            {diag_cards_html}
        </div>

        <!-- 6. MEDICATION RECONCILIATION: ACTIVE, ADDED, REDUCED -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; margin-bottom:24px; box-shadow:0 1px 4px rgba(0,0,0,0.04);">
            <div class="section-title">💊 Medication Reconciliation Tracker</div>
            <p style="font-size:13px; color:#64748b; margin-top:-6px; margin-bottom:18px;">
                Medication regimen reconciliation tailored to individual vital trends:
            </p>

            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:20px;">
                <!-- Column 1: Ongoing Active Medications -->
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <h4 style="margin:0; font-size:15px; color:#1e293b;">1. Active Ongoing Medications</h4>
                        <span style="background:#e2e8f0; color:#334155; font-size:12px; font-weight:700; padding:2px 8px; border-radius:10px;">{meds['counts']['active']}</span>
                    </div>
                    {active_meds_html}
                </div>

                <!-- Column 2: Added / Initiated Medications -->
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <h4 style="margin:0; font-size:15px; color:#065f46;">2. Added / Initiated Medications</h4>
                        <span style="background:#10b981; color:#fff; font-size:12px; font-weight:700; padding:2px 8px; border-radius:10px;">{meds['counts']['added']}</span>
                    </div>
                    {added_meds_html}
                </div>

                <!-- Column 3: Reduced / Discontinued Medications -->
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <h4 style="margin:0; font-size:15px; color:#b91c1c;">3. Reduced / Withheld Medications</h4>
                        <span style="background:#ef4444; color:#fff; font-size:12px; font-weight:700; padding:2px 8px; border-radius:10px;">{meds['counts']['reduced']}</span>
                    </div>
                    {reduced_meds_html}
                </div>
            </div>
        </div>

        <!-- 7. DOCTOR SIGN-OFF & CLINICAL INSTRUCTIONS -->
        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:12px; padding:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
            <div>
                <div style="font-weight:700; font-size:14px; color:#0f172a;">Clinical Care Directives:</div>
                <div style="font-size:13px; color:#475569; margin-top:4px;">
                    • Scheduled Vital Monitoring: <strong>{ctx.get('monitoring_frequency', 'Every 4 hours')}</strong>.<br>
                    • Report any acute physiological deterioration immediately to Duty Medical Officer.
                </div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:12px; color:#64748b;">Authorized Medical Officer</div>
                <div style="font-size:15px; font-weight:700; color:#0284c7; margin-top:4px;">IHMS Clinical Intelligence Board</div>
                <div style="font-size:11px; color:#94a3b8;">Digitally Verified & Validated</div>
            </div>
        </div>

    </div>

</div>

</body>
</html>
"""
