from datetime import datetime
import pandas as pd
import numpy as np

NUMERIC_COLUMNS = [
    'heart_rate_bpm',
    'systolic_bp_mmhg',
    'diastolic_bp_mmhg',
    'respiratory_rate_bpm',
    'spo2_percent',
    'temperature_c',
    'blood_glucose_mg_dl',
    'gcs_score',
    'pain_score',
    'urine_output_ml_hr',
    'age',
    # Derived clinical indicators
    'mean_arterial_pressure',
    'pulse_pressure',
    'shock_index',
    'hypoxia_flag',
    'tachycardia_flag',
    'bradycardia_flag',
    'gcs_impaired_flag',
    'hypotension_flag',
    'hypertension_flag',
    'fever_flag',
    'hypothermia_flag',
    'oliguria_flag',
    'hyperglycemia_flag',
    'severe_pain_flag',
]

CATEGORICAL_COLUMNS = [
    'gender',
    'patient_category',
    'allergy_status',
    'ecg_rhythm',
]

def parse_dob_to_age(dob_val):
    if pd.isna(dob_val) or not dob_val:
        return 45 # Default median age
    if isinstance(dob_val, (int, float)):
        return int(dob_val)
    dob_str = str(dob_val).strip()
    for fmt in ('%d-%m-%Y', '%Y-%m-%d', '%d/%m/%Y', '%Y/%m/%d'):
        try:
            d = datetime.strptime(dob_str, fmt).date()
            today = datetime.now().date()
            return today.year - d.year - ((today.month, today.day) < (d.month, d.day))
        except ValueError:
            pass
    return 45

def prepare_features(df_or_dict):
    """
    Standardizes raw patient dataframe or dictionary into structured features
    with clinical biomarkers and derived vital sign indicators.
    """
    if isinstance(df_or_dict, dict):
        df = pd.DataFrame([df_or_dict])
    else:
        df = df_or_dict.copy()

    # Normalize column names to lowercase snake_case
    col_map = {}
    for col in df.columns:
        norm = col.lower().replace('-', '_').replace(' ', '_')
        if norm.startswith('pain_score'):
            norm = 'pain_score'
        col_map[col] = norm
    df = df.rename(columns=col_map)

    # Compute or verify age
    if 'age' not in df.columns or df['age'].isnull().any():
        if 'date_of_birth' in df.columns:
            df['age'] = df['date_of_birth'].apply(parse_dob_to_age)
        else:
            df['age'] = 45

    # Fill base numerical columns
    base_num_defaults = {
        'heart_rate_bpm': 80.0,
        'systolic_bp_mmhg': 120.0,
        'diastolic_bp_mmhg': 75.0,
        'respiratory_rate_bpm': 16.0,
        'spo2_percent': 98.0,
        'temperature_c': 37.0,
        'blood_glucose_mg_dl': 110.0,
        'gcs_score': 15,
        'pain_score': 0,
        'urine_output_ml_hr': 60.0,
        'age': 45,
    }
    for col, default_val in base_num_defaults.items():
        if col not in df.columns:
            df[col] = default_val
        else:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(default_val)

    # Categorical columns
    cat_defaults = {
        'gender': 'Unknown',
        'patient_category': 'Routine Patient',
        'allergy_status': 'No Known Allergy',
        'ecg_rhythm': 'Sinus Rhythm',
    }
    for col, default_val in cat_defaults.items():
        if col not in df.columns:
            df[col] = default_val
        else:
            df[col] = df[col].fillna(default_val).astype(str)

    # Derived clinical indicators
    sbp = df['systolic_bp_mmhg']
    dbp = df['diastolic_bp_mmhg']
    hr = df['heart_rate_bpm']
    spo2 = df['spo2_percent']
    temp = df['temperature_c']
    glucose = df['blood_glucose_mg_dl']
    gcs = df['gcs_score']
    pain = df['pain_score']
    urine = df['urine_output_ml_hr']

    df['mean_arterial_pressure'] = dbp + (sbp - dbp) / 3.0
    df['pulse_pressure'] = sbp - dbp
    df['shock_index'] = hr / (sbp.replace(0, 1.0))
    df['hypoxia_flag'] = (spo2 < 95.0).astype(float)
    df['tachycardia_flag'] = (hr > 100.0).astype(float)
    df['bradycardia_flag'] = (hr < 60.0).astype(float)
    df['gcs_impaired_flag'] = (gcs < 15).astype(float)
    df['hypotension_flag'] = (sbp < 90.0).astype(float)
    df['hypertension_flag'] = (sbp >= 140.0).astype(float)
    df['fever_flag'] = (temp > 38.0).astype(float)
    df['hypothermia_flag'] = (temp < 36.0).astype(float)
    df['oliguria_flag'] = (urine < 30.0).astype(float)
    df['hyperglycemia_flag'] = (glucose > 180.0).astype(float)
    df['severe_pain_flag'] = (pain >= 7).astype(float)

    all_features = NUMERIC_COLUMNS + CATEGORICAL_COLUMNS
    return df[all_features]
