import os
import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_ai.settings')

import django
django.setup()

from django.test import RequestFactory
from django.conf import settings
from django.db import connection
from accounts.models import User
from patients.models import PatientClinicalMonitoring
from patients.views import PatientClinicalMonitoringListView, PatientClinicalTriagePredictAPIView
from ml_models.model_registry import get_predictor

rf = RequestFactory()

print("=" * 65)
print("TESTING IHMS POSTGRESQL & ML INTEGRATION")
print("=" * 65)

# 1. Test PostgreSQL Connection & Record Counts
print("\n[TEST 1] Verifying PostgreSQL Connection & Engine...")
db_engine = settings.DATABASES['default']['ENGINE']
db_name = settings.DATABASES['default']['NAME']
db_port = settings.DATABASES['default']['PORT']
print(f"  Engine: {db_engine}")
print(f"  Database: {db_name}")
print(f"  Port: {db_port}")
assert 'postgresql' in db_engine, "Default database engine is not PostgreSQL!"

with connection.cursor() as cur:
    cur.execute("SELECT version();")
    ver = cur.fetchone()[0]
    print(f"  PostgreSQL Server Version: {ver.split(',')[0]}")

total_count = PatientClinicalMonitoring.objects.count()
print(f"  Patient Clinical Records in PostgreSQL: {total_count}")
assert total_count == 2500, f"Expected 2500 records, found {total_count}!"

# 2. Test Monitoring Level & Risk Distribution in PostgreSQL
print("\n[TEST 2] Verifying Risk and Triage Distribution in DB...")
high_risk_qs = PatientClinicalMonitoring.objects.filter(deterioration_risk='High')
mod_risk_qs = PatientClinicalMonitoring.objects.filter(deterioration_risk='Moderate')
low_risk_qs = PatientClinicalMonitoring.objects.filter(deterioration_risk='Low')
print(f"  High Deterioration Risk:     {high_risk_qs.count()} patients")
print(f"  Moderate Deterioration Risk: {mod_risk_qs.count()} patients")
print(f"  Low Deterioration Risk:      {low_risk_qs.count()} patients")
assert high_risk_qs.count() > 0, "No high-risk patients classified!"

# 3. Test API: Listing & Filtering Patients from PostgreSQL
print("\n[TEST 3] Testing PatientClinicalMonitoringListView API (PostgreSQL)...")
staff_user = User.objects.filter(is_staff=True).first()
if not staff_user:
    staff_user = User.objects.create(username='test_dr', role='doctor', is_staff=True)

from rest_framework.test import force_authenticate

# Filter by High Risk
req = rf.get('/api/patients/monitoring/', {'deterioration_risk': 'High'})
force_authenticate(req, user=staff_user)
res = PatientClinicalMonitoringListView.as_view()(req)
assert res.status_code == 200, f"API failed with {res.status_code}"
results = res.data.get('results', res.data)
print(f"  [PASS] API returned {len(results)} high-risk patients in current page (Total: {res.data.get('count')})")
first_p = results[0]
print(f"  Sample Patient: {first_p['patient_id']} - {first_p['full_name']} | SpO2: {first_p['spo2_percent']}% | GCS: {first_p['gcs_score']} | Risk: {first_p['deterioration_risk']}")

# 4. Test API: ML Triage Inference & PostgreSQL Sync for Patient PAT-000018
print("\n[TEST 4] Testing ML Triage Predict API with PostgreSQL Patient (PAT-000018)...")
req_pred = rf.post('/api/patients/monitoring/triage-predict/', {'patient_id': 'PAT-000018'}, content_type='application/json')
force_authenticate(req_pred, user=staff_user)
res_pred = PatientClinicalTriagePredictAPIView.as_view()(req_pred)
assert res_pred.status_code == 200, f"Predict API failed with {res_pred.status_code}"
pred_data = res_pred.data
print(f"  [PASS] Patient: {pred_data.get('patient_id')} ({pred_data.get('patient_name')})")
print(f"  Predicted Level: {pred_data['predicted_monitoring_level']} (Confidence: {pred_data['prediction_confidence'] * 100:.1f}%)")
print(f"  Risk Score: {pred_data['risk_score']}/100 ({pred_data['deterioration_risk']} Risk)")
print(f"  Recommended Ward: {pred_data['recommended_care_unit']}")
print(f"  Clinical Alerts: {pred_data['clinical_alerts']}")
print(f"  Synced to PostgreSQL: {pred_data.get('synced_to_postgresql')}")

# 5. Test Model Registry Lookup
print("\n[TEST 5] Testing Model Registry...")
predictor = get_predictor('patient_triage')
assert callable(predictor), "Predictor is not callable!"
inference_test = predictor({
    'heart_rate_bpm': 125,
    'systolic_bp_mmhg': 90,
    'diastolic_bp_mmhg': 60,
    'respiratory_rate_bpm': 26,
    'spo2_percent': 91.0,
    'temperature_c': 38.9,
    'blood_glucose_mg_dl': 210,
    'gcs_score': 10,
    'pain_score': 7,
    'urine_output_ml_hr': 22.0,
    'gender': 'Male',
    'age': 60
})
print(f"  [PASS] Model Registry Predictor Output: {inference_test['predicted_monitoring_level']} | Risk: {inference_test['risk_score']}")
assert inference_test['predicted_monitoring_level'] in ('Continuous', 'Enhanced')

print("\n" + "=" * 65)
print("ALL POSTGRESQL & ML INTEGRATION TESTS PASSED SUCCESSFULLY!")
print("=" * 65)
