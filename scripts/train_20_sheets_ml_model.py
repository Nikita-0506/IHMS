import os
import sys
import json
from pathlib import Path
from datetime import datetime
import joblib
import pandas as pd
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, f1_score

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / 'ml_models' / 'datasets' / 'IHMS_Healthcare_20_Sheets_CSV'
TRAINED_MODELS_DIR = BASE_DIR / 'ml_models' / 'trained_models'
REPORTS_DIR = BASE_DIR / 'ml_models' / 'reports'

def train_20_sheets_model():
    TRAINED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 70, flush=True)
    print("IHMS Healthcare 20-Sheets Dataset: ML Deterioration & Triage Training", flush=True)
    print("=" * 70, flush=True)

    feat_csv = DATA_DIR / 'Synthetic_Features.csv'
    patients_csv = DATA_DIR / 'Patients.csv'

    if not feat_csv.exists() or not patients_csv.exists():
        print(f"Error: Required CSVs not found in {DATA_DIR}", flush=True)
        sys.exit(1)

    df_feat = pd.read_csv(feat_csv)
    df_patients = pd.read_csv(patients_csv)

    print(f"Loaded {len(df_feat)} synthetic feature records and {len(df_patients)} patients.", flush=True)

    df = df_feat.copy()

    num_cols = [
        'Visits_Last_12_Months',
        'Active_Conditions_Count',
        'Medication_Count',
        'Pending_Test_Count',
        'Systolic_BP_mmHg',
        'Temperature_C',
        'SpO2_percent'
    ]

    cat_cols = [
        'Symptom_Severity_Text',
        'Transfer_Flag',
        'Emergency_Flag',
        'Assessment_Severity'
    ]

    target_col = 'Synthetic_Target_Label'

    X = df[num_cols + cat_cols]
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Train samples: {len(X_train)}, Test samples: {len(X_test)}", flush=True)

    numeric_transformer = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    categorical_transformer = Pipeline([
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, num_cols),
            ('cat', categorical_transformer, cat_cols)
        ]
    )

    rf_model = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            class_weight='balanced_subsample',
            n_jobs=1
        ))
    ])

    print("Training RandomForestClassifier ensemble on 20-sheet features...", flush=True)
    rf_model.fit(X_train, y_train)

    y_pred = rf_model.predict(X_test)
    y_proba = rf_model.predict_proba(X_test)

    acc = accuracy_score(y_test, y_pred)
    macro_f1 = f1_score(y_test, y_pred, average='macro')
    weighted_f1 = f1_score(y_test, y_pred, average='weighted')

    print(f"\nModel Performance on Test Set:", flush=True)
    print(f"  Accuracy:    {acc:.4f} ({acc*100:.2f}%)", flush=True)
    print(f"  Macro F1:    {macro_f1:.4f}", flush=True)
    print(f"  Weighted F1: {weighted_f1:.4f}", flush=True)

    report_dict = classification_report(y_test, y_pred, output_dict=True)

    # Save trained pipeline model
    model_path = TRAINED_MODELS_DIR / 'patient_deterioration_20sheets_model.joblib'
    joblib.dump(rf_model, model_path)
    print(f"Saved trained model to {model_path}", flush=True)

    # Generate predictions for all patients in Patients.csv
    print("Generating batch deterioration predictions for 2,500 patients...", flush=True)
    patient_feat_rows = []
    for _, pt in df_patients.iterrows():
        sbp = pt.get('Systolic_BP_mmHg', 120)
        temp = pt.get('Temperature_C', 37.0)
        spo2 = pt.get('SpO2_percent', 98.0)
        hr = pt.get('Heart_Rate_bpm', 80)
        gcs = pt.get('GCS_Score', 15)
        pain = pt.get('Pain_Score_0_10', 0)
        
        # Severity calculation
        if spo2 < 91 or sbp < 90 or gcs < 10 or hr > 120 or temp > 38.5:
            symp = 'Severe'
            emerg = 'Yes'
            assess = 'Critical'
        elif spo2 < 95 or sbp > 150 or pain > 6:
            symp = 'Moderate'
            emerg = 'No'
            assess = 'Moderate'
        else:
            symp = 'Mild'
            emerg = 'No'
            assess = 'Low'

        patient_feat_rows.append({
            'Patient_ID': pt['Patient_ID'],
            'Visits_Last_12_Months': 2,
            'Active_Conditions_Count': 1 if pt.get('Allergy_Status') not in ['No Known Allergy', 'None', None] else 0,
            'Medication_Count': 2,
            'Pending_Test_Count': 1,
            'Systolic_BP_mmHg': sbp,
            'Temperature_C': temp,
            'SpO2_percent': spo2,
            'Symptom_Severity_Text': symp,
            'Transfer_Flag': 'Yes' if 'Transfer' in str(pt.get('Patient_Category', '')) else 'No',
            'Emergency_Flag': emerg,
            'Assessment_Severity': assess
        })

    df_pt_feats = pd.DataFrame(patient_feat_rows)
    preds = rf_model.predict(df_pt_feats[num_cols + cat_cols])
    probas = rf_model.predict_proba(df_pt_feats[num_cols + cat_cols])
    classes = list(rf_model.classes_)

    # Risk score calculation
    risk_scores = []
    for p in probas:
        class_weights = {'Low': 0.15, 'Moderate': 0.45, 'High': 0.75, 'Critical': 0.95}
        score = sum(prob * class_weights.get(cls, 0.5) for prob, cls in zip(p, classes))
        risk_scores.append(round(score * 100, 1))

    df_patients['ML_Deterioration_Risk'] = preds
    df_patients['ML_Risk_Score'] = risk_scores

    pred_csv_path = REPORTS_DIR / 'patient_predictions_20sheets.csv'
    df_patients[['Patient_ID', 'First_Name', 'Last_Name', 'Care_Unit', 'Room_No', 'ML_Deterioration_Risk', 'ML_Risk_Score']].to_csv(pred_csv_path, index=False)
    print(f"Saved patient predictions to {pred_csv_path}", flush=True)

    # Save report metrics
    metrics_path = REPORTS_DIR / 'patient_deterioration_20sheets_report.json'
    with open(metrics_path, 'w', encoding='utf-8') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'dataset_source': 'IHMS_Healthcare_20_Sheets_CSV',
            'total_training_records': len(df_feat),
            'total_predicted_patients': len(df_patients),
            'accuracy': float(acc),
            'macro_f1': float(macro_f1),
            'weighted_f1': float(weighted_f1),
            'classes': classes,
            'classification_report': report_dict,
            'model_architecture': 'RandomForestClassifier(n_estimators=100)'
        }, f, indent=2)

    print(f"Saved metrics report to {metrics_path}", flush=True)
    print("\n[SUCCESS] Model training and patient inference completed successfully!", flush=True)
    return {
        'model_path': str(model_path),
        'accuracy': float(acc),
        'macro_f1': float(macro_f1),
        'records_trained': len(df_feat),
        'patients_predicted': len(df_patients)
    }

if __name__ == '__main__':
    train_20_sheets_model()
