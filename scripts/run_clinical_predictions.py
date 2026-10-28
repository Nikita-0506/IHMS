import os
import sys
from pathlib import Path
import time
import numpy as np
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_ai.settings')

import django
django.setup()

from django.db import transaction
from patients.models import PatientClinicalMonitoring
from ml_models.patient_monitoring.predict_monitoring import _get_triage_model, _get_care_unit_model
from ml_models.patient_monitoring.feature_engineering import prepare_features

def run_predictions_on_postgres():
    print("=" * 65)
    print("RUNNING BATCH INFERENCE & SYNCING ML PREDICTIONS TO POSTGRESQL")
    print("=" * 65)

    qs = PatientClinicalMonitoring.objects.all().order_by('patient_id')
    total = qs.count()
    if total == 0:
        print("[ERROR] No records found in PostgreSQL. Please run load_patient_clinical_monitoring.py first.")
        return

    print(f"Loaded {total} patient records from PostgreSQL (IHMS_Project).")
    t0 = time.time()

    # Convert to DataFrame for fast vectorized processing
    data_list = list(qs.values())
    raw_df = pd.DataFrame(data_list)

    # 1. Vectorized Feature Engineering
    features_df = prepare_features(raw_df)

    # 2. Vectorized Model Predictions
    triage_art = _get_triage_model()
    triage_model = triage_art['model']
    classes = list(triage_art['classes'])

    print("Running Triage / Monitoring Level classification...")
    pred_triage = triage_model.predict(features_df)
    triage_probs = triage_model.predict_proba(features_df)
    confidences = np.max(triage_probs, axis=1)

    # Map class probabilities
    cls_idx = {cls_name: idx for idx, cls_name in enumerate(classes)}
    prob_cont = triage_probs[:, cls_idx.get('Continuous', 0)] if 'Continuous' in cls_idx else np.zeros(total)
    prob_enh = triage_probs[:, cls_idx.get('Enhanced', 1)] if 'Enhanced' in cls_idx else np.zeros(total)
    risk_scores = np.round((prob_cont * 100.0) + (prob_enh * 50.0), 2)

    deterioration_risks = []
    for r_score, pred in zip(risk_scores, pred_triage):
        if r_score >= 60.0 or pred == 'Continuous':
            deterioration_risks.append('High')
        elif r_score >= 25.0 or pred == 'Enhanced':
            deterioration_risks.append('Moderate')
        else:
            deterioration_risks.append('Low')

    # Care Unit model
    print("Running Care Unit placement recommendation...")
    care_unit_art = _get_care_unit_model()
    if care_unit_art:
        pred_care_unit = care_unit_art['model'].predict(features_df)
    else:
        pred_care_unit = ['General Ward'] * total

    # 3. Assign to patient model instances
    patient_instances = list(qs)
    correct_triage = 0
    high_risk_count = 0
    moderate_risk_count = 0
    low_risk_count = 0

    for i, p in enumerate(patient_instances):
        p.predicted_monitoring_level = str(pred_triage[i])
        p.prediction_confidence = round(float(confidences[i]), 4)
        p.predicted_care_unit = str(pred_care_unit[i])
        p.risk_score = float(risk_scores[i])
        p.deterioration_risk = deterioration_risks[i]

        if p.predicted_monitoring_level == p.monitoring_level:
            correct_triage += 1

        if p.deterioration_risk == 'High':
            high_risk_count += 1
        elif p.deterioration_risk == 'Moderate':
            moderate_risk_count += 1
        else:
            low_risk_count += 1

    # 4. Bulk update in PostgreSQL
    print("Saving prediction columns into PostgreSQL...")
    with transaction.atomic():
        PatientClinicalMonitoring.objects.bulk_update(
            patient_instances,
            [
                'predicted_monitoring_level',
                'prediction_confidence',
                'predicted_care_unit',
                'risk_score',
                'deterioration_risk'
            ],
            batch_size=500
        )

    elapsed = time.time() - t0
    accuracy = (correct_triage / total) * 100

    print("\n" + "=" * 65)
    print("POSTGRESQL SYNC COMPLETE")
    print(f"  Processed & Updated: {total} records in {elapsed:.2f} seconds ({total/elapsed:.1f} records/sec)")
    print(f"  Triage Match Accuracy: {accuracy:.2f}% ({correct_triage}/{total})")
    print(f"  Risk Categorization in DB:")
    print(f"    - High Risk (ICU / Continuous Escalation):     {high_risk_count}")
    print(f"    - Moderate Risk (Emergency / Enhanced Triage): {moderate_risk_count}")
    print(f"    - Low Risk (Routine Inpatient / Stable Ward):  {low_risk_count}")
    print("=" * 65)

if __name__ == '__main__':
    run_predictions_on_postgres()
