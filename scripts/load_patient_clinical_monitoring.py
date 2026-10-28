import os
import sys
from datetime import datetime
import pandas as pd
from pathlib import Path

# Setup Django environment
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_ai.settings')

import django
django.setup()

from django.db import transaction
from django.utils import timezone
from patients.models import PatientClinicalMonitoring

DATASET_PATH = BASE_DIR / 'ml_models' / 'datasets' / 'patient_clinical_monitoring.csv'

def parse_date(date_str):
    if pd.isna(date_str) or not str(date_str).strip():
        return None
    for fmt in ('%d-%m-%Y', '%Y-%m-%d', '%d/%m/%Y', '%Y/%m/%d'):
        try:
            return datetime.strptime(str(date_str).strip(), fmt).date()
        except ValueError:
            pass
    return None

def parse_datetime(dt_str):
    if pd.isna(dt_str) or not str(dt_str).strip():
        return None
    for fmt in ('%d-%m-%Y %H:%M', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d %H:%M', '%d/%m/%Y %H:%M'):
        try:
            dt = datetime.strptime(str(dt_str).strip(), fmt)
            return timezone.make_aware(dt) if timezone.is_naive(dt) else dt
        except ValueError:
            pass
    return None

def calculate_age(dob):
    if not dob:
        return None
    today = datetime.now().date()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

def load_data(csv_path=None):
    source = Path(csv_path) if csv_path else DATASET_PATH
    if not source.exists():
        raise FileNotFoundError(f"Dataset not found at {source}")

    print(f"Reading dataset from {source}...")
    df = pd.read_csv(source)
    total_rows = len(df)
    print(f"Total rows found: {total_rows}")

    records = []
    for _, row in df.iterrows():
        dob = parse_date(row.get('Date_of_Birth'))
        age = calculate_age(dob)
        created_at_dt = parse_datetime(row.get('Created_At'))
        monitoring_dt = parse_datetime(row.get('Monitoring_Last_Updated'))

        record = PatientClinicalMonitoring(
            patient_id=str(row['Patient_ID']).strip(),
            first_name=str(row.get('First_Name', '')).strip(),
            last_name=str(row.get('Last_Name', '')).strip(),
            date_of_birth=dob,
            age=age,
            gender=str(row.get('Gender', 'Other')).strip(),
            phone=str(row.get('Phone', '')).strip(),
            email=str(row.get('Email', '')).strip(),
            city=str(row.get('City', '')).strip(),
            patient_category=str(row.get('Patient_Category', '')).strip(),
            allergy_status=str(row.get('Allergy_Status', '')).strip(),
            record_status=str(row.get('Record_Status', 'Active')).strip(),
            care_location_type=str(row.get('Care_Location_Type', '')).strip(),
            room_no=str(row.get('Room_No', '')).strip(),
            bed_no=str(row.get('Bed_No', '')).strip(),
            care_unit=str(row.get('Care_Unit', '')).strip(),
            monitoring_level=str(row.get('Monitoring_Level', 'Routine')).strip(),
            heart_rate_bpm=float(row.get('Heart_Rate_bpm', 0.0)),
            systolic_bp_mmhg=float(row.get('Systolic_BP_mmHg', 0.0)),
            diastolic_bp_mmhg=float(row.get('Diastolic_BP_mmHg', 0.0)),
            respiratory_rate_bpm=float(row.get('Respiratory_Rate_bpm', 0.0)),
            spo2_percent=float(row.get('SpO2_percent', 0.0)),
            temperature_c=float(row.get('Temperature_C', 0.0)),
            blood_glucose_mg_dl=float(row.get('Blood_Glucose_mg_dL', 0.0)),
            gcs_score=int(row.get('GCS_Score', 15)),
            pain_score=int(row.get('Pain_Score_0_10', 0)),
            ecg_rhythm=str(row.get('ECG_Rhythm', 'Sinus Rhythm')).strip(),
            urine_output_ml_hr=float(row.get('Urine_Output_mL_hr', 0.0)),
            monitoring_frequency=str(row.get('Monitoring_Frequency', '')).strip(),
            monitoring_last_updated=monitoring_dt,
            created_at_record=created_at_dt,
        )
        records.append(record)

    # Bulk insert with conflict resolution
    print("Inserting records into PostgreSQL (IHMS_Project)...")
    with transaction.atomic():
        PatientClinicalMonitoring.objects.all().delete()
        batch_size = 500
        for i in range(0, len(records), batch_size):
            chunk = records[i:i + batch_size]
            PatientClinicalMonitoring.objects.bulk_create(chunk)
            print(f"  Inserted chunk {i + 1} to {min(i + batch_size, len(records))}...")

    db_count = PatientClinicalMonitoring.objects.count()
    print(f"\n[SUCCESS] Successfully populated {db_count} records into PostgreSQL!")
    return db_count

if __name__ == '__main__':
    load_data()
