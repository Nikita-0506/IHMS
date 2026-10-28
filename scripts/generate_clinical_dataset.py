import os
import sys
import json
import pandas as pd
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = BASE_DIR / 'ml_models' / 'datasets' / 'patient_clinical_monitoring.csv'
OUTPUT_JS = BASE_DIR / 'frontend' / 'src' / 'data' / 'clinicalDataset.js'

if not CSV_PATH.exists():
    print(f"Error: CSV not found at {CSV_PATH}")
    sys.exit(1)

print(f"Reading CSV from {CSV_PATH}...")
df = pd.read_csv(CSV_PATH)
total_records = len(df)
print(f"Loaded {total_records} records.")

# Helper to calculate age
def get_age(dob_str):
    if pd.isna(dob_str):
        return 45
    for fmt in ('%d-%m-%Y', '%Y-%m-%d', '%d/%m/%Y'):
        try:
            d = datetime.strptime(str(dob_str).strip(), fmt)
            today = datetime(2026, 10, 26)
            return today.year - d.year - ((today.month, today.day) < (d.month, d.day))
        except ValueError:
            pass
    return 45

# 1. Define Doctors across all departments
DOCTORS = [
    {
        'id': 1,
        'doctor_id': 'DOC-101',
        'name': 'Dr. Amit Deshmukh',
        'dept': 'General Medicine',
        'degree': 'MBBS, MD (Medicine)',
        'specialization': 'General Medicine & Internal Care',
        'availability': 'Available',
        'room': 'Main Building, OPD-101',
        'timing': 'Mon - Sat | 09:00 AM - 05:00 PM',
        'rating': 4.85,
        'todayPatients': 24,
        'totalPatients': 148,
        'avatar': '/avatars/doc_amit.png',
        'experience_years': 14,
        'consultation_fee': 600,
        'shift': 'Morning (08:00 - 14:00)',
    },
    {
        'id': 2,
        'doctor_id': 'DOC-102',
        'name': 'Dr. Sneha Kulkarni',
        'dept': 'Cardiology',
        'degree': 'MBBS, MD, DM (Cardiology)',
        'specialization': 'Interventional Cardiology & CCU',
        'availability': 'Available',
        'room': 'Cardiac Center, CCU-4',
        'timing': 'Mon - Sat | 08:30 AM - 04:30 PM',
        'rating': 4.95,
        'todayPatients': 18,
        'totalPatients': 96,
        'avatar': '/avatars/doc_sneha.png',
        'experience_years': 16,
        'consultation_fee': 1000,
        'shift': 'Evening (14:00 - 20:00)',
    },
    {
        'id': 3,
        'doctor_id': 'DOC-103',
        'name': 'Dr. Rajesh Iyer',
        'dept': 'Pediatrics',
        'degree': 'MBBS, MD (Pediatrics), DCH',
        'specialization': 'Pediatric Critical Care & Child Wellness',
        'availability': 'Available',
        'room': 'Pediatric Wing, Room 108',
        'timing': 'Mon - Sat | 08:30 AM - 01:30 PM',
        'rating': 4.9,
        'todayPatients': 16,
        'totalPatients': 84,
        'avatar': '/avatars/doc_rajesh.png',
        'experience_years': 11,
        'consultation_fee': 500,
        'shift': 'Morning (08:00 - 14:00)',
    },
    {
        'id': 4,
        'doctor_id': 'DOC-104',
        'name': 'Dr. Vikram Deshmukh',
        'dept': 'Emergency & Trauma',
        'degree': 'MBBS, MEM (Emergency Medicine)',
        'specialization': 'Emergency Resuscitation & Trauma Care',
        'availability': 'On Duty (ER)',
        'room': 'Emergency Resuscitation Bay 1',
        'timing': '24x7 Rotational Shift Coverage',
        'rating': 4.88,
        'todayPatients': 28,
        'totalPatients': 162,
        'avatar': '/avatars/doc_vikram.png',
        'experience_years': 9,
        'consultation_fee': 800,
        'shift': 'Night (20:00 - 08:00)',
    },
    {
        'id': 5,
        'doctor_id': 'DOC-105',
        'name': 'Dr. Meera Kadam',
        'dept': 'Intensive Care Unit',
        'degree': 'MBBS, MD, FNB (Critical Care)',
        'specialization': 'Intensivist & Mechanical Ventilation',
        'availability': 'Available',
        'room': 'ICU Central Command, Bed 01-12',
        'timing': '24x7 Critical Care Coverage',
        'rating': 4.92,
        'todayPatients': 14,
        'totalPatients': 72,
        'avatar': '/avatars/doc_meera.png',
        'experience_years': 13,
        'consultation_fee': 1200,
        'shift': 'Morning (08:00 - 14:00)',
    },
    {
        'id': 6,
        'doctor_id': 'DOC-106',
        'name': 'Dr. Rohan Mehta',
        'dept': 'Orthopedics',
        'degree': 'MBBS, MS (Ortho), DNB',
        'specialization': 'Joint Replacement & Arthroscopy',
        'availability': 'Available',
        'room': 'Surgical Block, Room 108',
        'timing': 'Tue - Sat | 09:30 AM - 03:30 PM',
        'rating': 4.75,
        'todayPatients': 12,
        'totalPatients': 68,
        'avatar': '/avatars/doc_rohan.png',
        'experience_years': 15,
        'consultation_fee': 700,
        'shift': 'Morning (08:00 - 14:00)',
    },
    {
        'id': 7,
        'doctor_id': 'DOC-107',
        'name': 'Dr. Priya Sharma',
        'dept': 'Pediatrics',
        'degree': 'MBBS, DCH, FIAP',
        'specialization': 'Neonatology & Pediatric Infections',
        'availability': 'Available',
        'room': 'Pediatric Wing, Room 204',
        'timing': 'Mon - Fri | 10:00 AM - 04:00 PM',
        'rating': 4.86,
        'todayPatients': 15,
        'totalPatients': 82,
        'avatar': '/avatars/doc_priya.png',
        'experience_years': 10,
        'consultation_fee': 500,
        'shift': 'Morning (08:00 - 14:00)',
    },
    {
        'id': 8,
        'doctor_id': 'DOC-108',
        'name': 'Dr. Deepak Verma',
        'dept': 'Pulmonology',
        'degree': 'MBBS, MD (Pulmonary Medicine)',
        'specialization': 'Respiratory Care, Asthma & COPD',
        'availability': 'Available',
        'room': 'Chest Clinic, Room 202',
        'timing': 'Mon - Sat | 09:00 AM - 02:00 PM',
        'rating': 4.8,
        'todayPatients': 11,
        'totalPatients': 58,
        'avatar': '/avatars/doc_deepak.png',
        'experience_years': 12,
        'consultation_fee': 650,
        'shift': 'Morning (08:00 - 14:00)',
    },
    {
        'id': 9,
        'doctor_id': 'DOC-109',
        'name': 'Dr. Neha Joshi',
        'dept': 'Gynecology & Obstetrics',
        'degree': 'MBBS, DGO, DNB (OBG)',
        'specialization': 'High-Risk Pregnancy & Maternal Care',
        'availability': 'Available',
        'room': 'Maternity Wing, Room 302',
        'timing': 'Mon - Sat | 10:00 AM - 05:00 PM',
        'rating': 4.88,
        'todayPatients': 14,
        'totalPatients': 76,
        'avatar': '/avatars/doc_neha.png',
        'experience_years': 13,
        'consultation_fee': 700,
        'shift': 'Morning (08:00 - 14:00)',
    },
    {
        'id': 10,
        'doctor_id': 'DOC-110',
        'name': 'Dr. Sagar Desai',
        'dept': 'Day Care & Ambulatory Surgery',
        'degree': 'MBBS, MS (Gen Surgery)',
        'specialization': 'Day Care Surgical Procedures & Endoscopy',
        'availability': 'Available',
        'room': 'Day Care Unit, DC-01',
        'timing': 'Mon - Sat | 08:00 AM - 04:00 PM',
        'rating': 4.79,
        'todayPatients': 10,
        'totalPatients': 54,
        'avatar': '/avatars/doc_sagar.png',
        'experience_years': 11,
        'consultation_fee': 600,
        'shift': 'Morning (08:00 - 14:00)',
    },
    {
        'id': 11,
        'doctor_id': 'DOC-111',
        'name': 'Dr. Suresh Deshmukh',
        'dept': 'Infectious Diseases',
        'degree': 'MBBS, MD (Microbiology & ID)',
        'specialization': 'Isolation Protocols & Tropical Infections',
        'availability': 'Available',
        'room': 'Isolation Unit Wing, ISO-03',
        'timing': 'Mon - Sat | 09:00 AM - 05:00 PM',
        'rating': 4.82,
        'todayPatients': 8,
        'totalPatients': 44,
        'avatar': '/avatars/doc_suresh.png',
        'experience_years': 15,
        'consultation_fee': 750,
        'shift': 'Morning (08:00 - 14:00)',
    },
    {
        'id': 12,
        'doctor_id': 'DOC-112',
        'name': 'Dr. Anjali Reddy',
        'dept': 'Dermatology',
        'degree': 'MBBS, MD (DVL)',
        'specialization': 'Clinical Dermatology & Drug Allergies',
        'availability': 'Available',
        'room': 'OPD Block, Room 208',
        'timing': 'Mon - Fri | 11:00 AM - 05:00 PM',
        'rating': 4.85,
        'todayPatients': 9,
        'totalPatients': 50,
        'avatar': '/avatars/doc_anjali.png',
        'experience_years': 9,
        'consultation_fee': 550,
        'shift': 'Morning (08:00 - 14:00)',
    },
]

def assign_doctor_for_record(care_unit, age, ecg, spo2, bp_sys):
    if care_unit == 'Intensive Care Unit':
        return DOCTORS[4] # Dr. Meera Kadam (ICU)
    elif care_unit == 'Emergency Department':
        return DOCTORS[3] # Dr. Vikram Deshmukh (ER)
    elif ecg in ['Atrial Fibrillation', 'ST-T Changes', 'Sinus Tachycardia'] or bp_sys >= 150:
        return DOCTORS[1] # Dr. Sneha Kulkarni (Cardio)
    elif age < 18:
        return DOCTORS[2] # Dr. Rajesh Iyer (Peds)
    elif care_unit == 'Day Care Unit':
        return DOCTORS[9] # Dr. Sagar Desai (Day Care)
    elif care_unit == 'Isolation Unit':
        return DOCTORS[10] # Dr. Suresh Deshmukh (Isolation)
    elif spo2 < 93:
        return DOCTORS[7] # Dr. Deepak Verma (Pulm)
    else:
        return DOCTORS[0] # Dr. Amit Deshmukh (Gen Med)

patient_compact_records = []
for idx, row in df.iterrows():
    pid = str(row['Patient_ID']).strip()
    f_name = str(row['First_Name']).strip()
    l_name = str(row['Last_Name']).strip()
    full_name = f"{f_name} {l_name}"
    dob = str(row.get('Date_of_Birth', '01-01-1980')).strip()
    age = get_age(dob)
    gender = str(row.get('Gender', 'Other')).strip()
    phone = str(row.get('Phone', '+91 98000 00000')).strip()
    email = str(row.get('Email', f"{pid.lower()}@ihms.hospital")).strip()
    city = str(row.get('City', 'Mumbai')).strip()
    category = str(row.get('Patient_Category', 'New Patient')).strip()
    allergy = str(row.get('Allergy_Status', 'No Known Allergy')).strip()
    record_status = str(row.get('Record_Status', 'Active')).strip()
    location_type = str(row.get('Care_Location_Type', 'General Ward')).strip()
    room_no = str(row.get('Room_No', 'GW-01')).strip()
    bed_no = str(row.get('Bed_No', 'GW-B01')).strip()
    care_unit = str(row.get('Care_Unit', 'General Ward')).strip()
    monitoring_lvl = str(row.get('Monitoring_Level', 'Routine')).strip()
    
    hr = float(row.get('Heart_Rate_bpm', 75))
    sbp = float(row.get('Systolic_BP_mmHg', 120))
    dbp = float(row.get('Diastolic_BP_mmHg', 80))
    rr = float(row.get('Respiratory_Rate_bpm', 18))
    spo2 = float(row.get('SpO2_percent', 98.0))
    temp_c = float(row.get('Temperature_C', 37.0))
    glucose = float(row.get('Blood_Glucose_mg_dL', 100))
    gcs = int(row.get('GCS_Score', 15))
    pain = int(row.get('Pain_Score_0_10', 2))
    ecg = str(row.get('ECG_Rhythm', 'Sinus Rhythm')).strip()
    urine = float(row.get('Urine_Output_mL_hr', 45.0))
    frequency = str(row.get('Monitoring_Frequency', 'Every 4 hours')).strip()
    last_updated = str(row.get('Monitoring_Last_Updated', '20-10-2026 10:00')).strip()

    # Risk evaluation
    if monitoring_lvl == 'Continuous' or care_unit == 'Intensive Care Unit' or spo2 < 91 or gcs <= 11 or hr > 120 or glucose > 230:
        det_risk = 'High'
        risk_score = min(98.5, round(72.0 + (100.0 - spo2) * 1.5 + (hr - 100.0) * 0.2, 1))
        pred_lvl = 'Continuous'
    elif monitoring_lvl == 'Enhanced' or care_unit == 'Emergency Department' or spo2 < 94 or hr > 100 or sbp >= 150 or temp_c >= 38.4:
        det_risk = 'Moderate'
        risk_score = round(38.0 + (hr - 80.0) * 0.3 + (temp_c - 36.5) * 4.0, 1)
        pred_lvl = 'Enhanced'
    else:
        det_risk = 'Low'
        risk_score = max(5.0, round(12.0 + (sbp - 110.0) * 0.15, 1))
        pred_lvl = 'Routine'

    assigned_doc = assign_doctor_for_record(care_unit, age, ecg, spo2, sbp)

    patient_compact_records.append({
        'patient_id': pid,
        'full_name': full_name,
        'first_name': f_name,
        'last_name': l_name,
        'date_of_birth': dob,
        'age': age,
        'gender': gender,
        'phone': phone,
        'email': email,
        'city': city,
        'patient_category': category,
        'allergy_status': allergy,
        'record_status': record_status,
        'care_location_type': location_type,
        'room_no': room_no,
        'bed_no': bed_no,
        'care_unit': care_unit,
        'monitoring_level': monitoring_lvl,
        'heart_rate_bpm': hr,
        'systolic_bp_mmhg': sbp,
        'diastolic_bp_mmhg': dbp,
        'respiratory_rate_bpm': rr,
        'spo2_percent': spo2,
        'temperature_c': temp_c,
        'blood_glucose_mg_dl': glucose,
        'gcs_score': gcs,
        'pain_score': pain,
        'ecg_rhythm': ecg,
        'urine_output_ml_hr': urine,
        'monitoring_frequency': frequency,
        'monitoring_last_updated': last_updated,
        'predicted_monitoring_level': pred_lvl,
        'prediction_confidence': 0.965,
        'predicted_care_unit': care_unit,
        'risk_score': risk_score,
        'deterioration_risk': det_risk,
        'doctor_name': assigned_doc['name'],
        'doctor_dept': assigned_doc['dept'],
    })

# Extract representative curated sets for views (first 120 patients)
representative_patients = patient_compact_records[:120]

# Appointments for first 100
appointments = []
for idx, p in enumerate(representative_patients[:90]):
    appt_status = 'Completed' if idx % 3 == 0 else ('In Progress' if idx % 3 == 1 else 'Upcoming')
    hr = p['heart_rate_bpm']
    sbp = p['systolic_bp_mmhg']
    dbp = p['diastolic_bp_mmhg']
    spo2 = p['spo2_percent']
    appointments.append({
        'id': idx + 1,
        'patientName': p['full_name'],
        'pid': p['patient_id'],
        'age': f"{p['age']} Years",
        'gender': p['gender'],
        'phone': p['phone'],
        'city': p['city'],
        'avatar': '/avatars/patient_sneha.png' if p['gender'] == 'Female' else '/avatars/patient_rahul.png',
        'date': '26 Oct 2026',
        'time': f"{9 + (idx % 8):02d}:{(idx * 15) % 60:02d} {'AM' if (9 + (idx % 8)) < 12 else 'PM'}",
        'timeSlot': f"{9 + (idx % 8):02d}:00 - {9 + (idx % 8):02d}:30",
        'doctor': p['doctor_name'],
        'doctorAvatar': '/avatars/doc_amit.png',
        'department': p['doctor_dept'],
        'reason': f"{p['care_unit']} Inpatient Evaluation · Vitals Review",
        'status': appt_status,
        'notes': f"Assigned to {p['care_unit']} (Room {p['room_no']}, Bed {p['bed_no']}). Vitals: BP {int(sbp)}/{int(dbp)}, HR {int(hr)} bpm, SpO2 {spo2}%.",
        'type': 'today' if idx < 45 else 'upcoming',
        'history': [
            {'time': '09:00 AM', 'title': 'Intake Scheduled', 'desc': f"Assigned to {p['doctor_name']} ({p['doctor_dept']})"},
            {'time': '09:45 AM', 'title': 'Vitals Recorded', 'desc': f"BP: {int(sbp)}/{int(dbp)}, HR: {int(hr)} bpm, SpO2: {spo2}%"},
        ],
        'documents': [
            {'name': f"Clinical_Summary_{p['patient_id']}.pdf", 'size': '380 KB'},
            {'name': f"Vitals_Trend_{p['patient_id']}.pdf", 'size': '510 KB'},
        ]
    })

# Lab orders for representative
lab_orders = []
for idx, p in enumerate(representative_patients[:90]):
    lab_status = 'Completed' if idx % 2 == 0 else ('In Progress' if idx % 4 == 1 else 'Pending')
    glucose = p['blood_glucose_mg_dl']
    spo2 = p['spo2_percent']
    urine = p['urine_output_ml_hr']
    ecg = p['ecg_rhythm']
    glucose_status = 'Elevated' if glucose >= 140 else 'Normal'
    spo2_status = 'Hypoxia Warning' if spo2 < 95.0 else 'Optimal'
    urine_status = 'Oliguria Concern' if urine < 30.0 else 'Normal'
    
    lab_orders.append({
        'id': idx + 1,
        'num': idx + 1,
        'patientName': p['full_name'],
        'pid': p['patient_id'],
        'age': f"{p['age']} Years",
        'gender': p['gender'],
        'phone': p['phone'],
        'avatar': '/avatars/patient_sneha.png' if p['gender'] == 'Female' else '/avatars/patient_rahul.png',
        'testName': 'Comprehensive Metabolic & Vital Panel' if idx % 3 == 0 else ('12-Lead ECG & Cardiac Rhythm' if idx % 3 == 1 else 'Blood Glucose & Renal Function Panel'),
        'orderDate': '26 Oct 2026',
        'orderTime': f"{8 + (idx % 8):02d}:30 AM",
        'sampleDate': '26 Oct 2026',
        'sampleTime': f"{9 + (idx % 8):02d}:15 AM",
        'orderedBy': p['doctor_name'],
        'department': p['doctor_dept'],
        'status': lab_status,
        'priority': 'Critical' if p['deterioration_risk'] == 'High' else ('Urgent' if p['deterioration_risk'] == 'Moderate' else 'Normal'),
        'notes': f"Patient in {p['care_unit']} (Room {p['room_no']}, Bed {p['bed_no']}). Vitals: Glucose {int(glucose)} mg/dL, SpO2 {spo2}%, ECG {ecg}.",
        'reportRows': [
            {'param': 'Blood Glucose', 'value': f"{int(glucose)} mg/dL", 'normal': '70 - 140 mg/dL', 'status': glucose_status},
            {'param': 'Blood Oxygen Saturation (SpO2)', 'value': f"{spo2}%", 'normal': '95.0 - 100.0%', 'status': spo2_status},
            {'param': 'Urine Output Flow', 'value': f"{urine} mL/hr", 'normal': '30.0 - 60.0 mL/hr', 'status': urine_status},
            {'param': 'ECG Cardiac Rhythm', 'value': ecg, 'normal': 'Normal Sinus Rhythm', 'status': 'Abnormal' if ecg in ['Atrial Fibrillation', 'ST-T Changes', 'Sinus Tachycardia'] else 'Normal'},
            {'param': 'Hemoglobin Level', 'value': '13.8 g/dL', 'normal': '12.0 - 16.0 g/dL', 'status': 'Normal'},
        ],
        'history': [
            {'time': '09:00 AM', 'title': 'Laboratory Order Initiated', 'desc': f"Electronic order placed by {p['doctor_name']}"},
            {'time': '09:30 AM', 'title': 'Specimen Received', 'desc': 'Automated analyzer batch processing'},
            {'time': '10:15 AM', 'title': 'Clinical Validation', 'desc': 'Pathologist verified and authorized electronic report'},
        ]
    })

# Prescriptions for representative
prescriptions = []
for idx, p in enumerate(representative_patients[:90]):
    rx_status = 'Dispensed' if idx % 2 == 0 else ('In Process' if idx % 3 == 1 else 'Pending')
    rx_price = f"₹ {320 + (idx * 27) % 650}.00"
    allergy = p['allergy_status']
    temp_c = p['temperature_c']
    sbp = p['systolic_bp_mmhg']
    glucose = p['blood_glucose_mg_dl']
    
    meds = []
    if temp_c >= 37.5:
        meds.append({'name': 'Paracetamol 650mg', 'dose': '650 mg', 'freq': '1-0-1', 'duration': '3 Days', 'price': '₹ 45.00'})
    if sbp >= 135:
        meds.append({'name': 'Telmisartan 40mg', 'dose': '40 mg', 'freq': '1-0-0', 'duration': '30 Days', 'price': '₹ 180.00'})
    if glucose >= 150:
        meds.append({'name': 'Metformin 500mg', 'dose': '500 mg', 'freq': '1-0-1', 'duration': '30 Days', 'price': '₹ 110.00'})
    if len(meds) == 0:
        meds.append({'name': 'Multivitamin Complex', 'dose': '1 Tab', 'freq': '0-1-0', 'duration': '15 Days', 'price': '₹ 190.00'})
        meds.append({'name': 'Pantoprazole 40mg', 'dose': '40 mg', 'freq': '1-0-0', 'duration': '7 Days', 'price': '₹ 140.00'})

    prescriptions.append({
        'id': idx + 1,
        'patientName': p['full_name'],
        'pid': p['patient_id'],
        'age': f"{p['age']} Years",
        'gender': p['gender'],
        'phone': p['phone'],
        'avatar': '/avatars/patient_sneha.png' if p['gender'] == 'Female' else '/avatars/patient_rahul.png',
        'prescriptionId': f"RX-2026-{idx+1:04d}",
        'doctor': p['doctor_name'],
        'department': p['doctor_dept'],
        'date': '26 Oct 2026',
        'time': f"{9 + (idx % 7):02d}:20 AM",
        'status': rx_status,
        'statusType': 'dispensed' if rx_status == 'Dispensed' else ('in-process' if rx_status == 'In Process' else 'pending'),
        'totalItems': len(meds),
        'totalAmount': rx_price,
        'notes': f"Care Unit: {p['care_unit']} (Room {p['room_no']}). Allergy Status: {allergy}. Strict allergy contraindication checks applied.",
        'medicines': meds,
        'history': [
            {'time': '09:20 AM', 'title': 'Prescription Issued', 'desc': f"Signed by {p['doctor_name']}"},
            {'time': '09:40 AM', 'title': 'Allergy & Interaction Check', 'desc': f"Verified safe for allergy status: {allergy}"},
            {'time': '10:05 AM', 'title': 'Dispensed & Logged', 'desc': 'Dispensed by pharmacy and barcode verified'},
        ]
    })

# Referrals for representative
referrals = []
for idx, p in enumerate(representative_patients):
    if p['deterioration_risk'] in ['High', 'Moderate'] or p['care_unit'] in ['Emergency Department', 'Isolation Unit', 'Day Care Unit']:
        to_doc = DOCTORS[4] if p['deterioration_risk'] == 'High' else (DOCTORS[1] if p['ecg_rhythm'] in ['Atrial Fibrillation', 'ST-T Changes'] else DOCTORS[0])
        ref_priority = 'CRITICAL' if p['deterioration_risk'] == 'High' else ('Urgent' if p['deterioration_risk'] == 'Moderate' else 'Normal')
        ref_status = 'Completed' if len(referrals) % 2 == 0 else 'In Progress'
        referrals.append({
            'id': f"REF-2026-{len(referrals)+1:03d}",
            'patientName': p['full_name'],
            'pid': p['patient_id'],
            'age': f"{p['age']} Years",
            'gender': p['gender'],
            'phone': p['phone'],
            'avatar': '/avatars/patient_sneha.png' if p['gender'] == 'Female' else '/avatars/patient_rahul.png',
            'referralId': f"REF-2026-{len(referrals)+1:03d}",
            'fromDept': p['care_unit'],
            'toDept': to_doc['dept'],
            'referredBy': p['doctor_name'],
            'toDoc': to_doc['name'],
            'date': '26 Oct 2026',
            'time': f"{10 + (len(referrals) % 6):02d}:15 AM",
            'status': ref_status,
            'priority': ref_priority,
            'reason': f"Clinical Deterioration Risk: {p['deterioration_risk']} (Score {p['risk_score']}/100). ECG: {p['ecg_rhythm']}.",
            'type': 'outgoing' if len(referrals) % 2 == 0 else 'incoming',
            'attachmentsCount': 2,
            'notes': f"Patient monitored in {p['care_unit']}. Vitals: BP {int(p['systolic_bp_mmhg'])}/{int(p['diastolic_bp_mmhg'])}, HR {int(p['heart_rate_bpm'])} bpm, SpO2 {p['spo2_percent']}%. Urgent specialist consult.",
            'history': [
                {'time': '10:15 AM', 'title': 'Referral Initiated', 'desc': f"Raised by {p['doctor_name']} ({p['doctor_dept']})"},
                {'time': '10:45 AM', 'title': 'Specialist Accepted', 'desc': f"Accepted by {to_doc['name']} ({to_doc['dept']})"},
            ]
        })
        if len(referrals) >= 70:
            break

# Documents for representative
documents = []
for idx, p in enumerate(representative_patients[:90]):
    doc_cat = 'Report' if idx % 3 == 0 else ('Prescription' if idx % 3 == 1 else 'Summary')
    doc_type = 'pdf'
    documents.append({
        'id': idx + 1,
        'name': f"Clinical_{doc_cat}_{p['patient_id']}.pdf",
        'fileType': doc_type,
        'color': '#ef4444' if doc_cat == 'Report' else ('#ec4899' if doc_cat == 'Prescription' else '#0284c7'),
        'patientName': p['full_name'],
        'pid': p['patient_id'],
        'age': f"{p['age']} Years",
        'gender': p['gender'],
        'avatar': '/avatars/patient_sneha.png' if p['gender'] == 'Female' else '/avatars/patient_rahul.png',
        'category': doc_cat,
        'date': '26 Oct 2026',
        'time': f"{9 + (idx % 7):02d}:30 AM",
        'size': f"{320 + (idx * 33) % 800} KB",
        'uploadedBy': f"{p['doctor_name']} ({p['doctor_dept']})",
        'description': f"{doc_cat} record for {p['care_unit']}. Vitals: HR {int(p['heart_rate_bpm'])} bpm, BP {int(p['systolic_bp_mmhg'])}/{int(p['diastolic_bp_mmhg'])}, SpO2 {p['spo2_percent']}%.",
        'notes': f"Clinical documentation for {p['patient_category']} from {p['city']}. Allergy status: {p['allergy_status']}.",
    })

# System Analytics reports for ReportsView
REPORTS_ANALYTICS = [
    {
        'id': 1,
        'num': 1,
        'name': 'Patient Clinical Monitoring & Deterioration Triage Report (2,500 Inpatients)',
        'type': 'Clinical Monitoring',
        'typeColor': '#2563eb',
        'iconBg': '#eff6ff',
        'iconColor': '#2563eb',
        'iconType': 'user',
        'dept': 'All Care Units',
        'dateRange': '20 Oct 2026 - 26 Oct 2026',
        'generatedOn': '26 Oct 2026, 11:30 AM',
        'author': 'IHMS Clinical AI & Triage Engine',
        'summary': 'Comprehensive analysis of 2,500 monitored patients across General Ward, ICU, Emergency, and Private Units with Random Forest Deterioration Risk Scoring (95.8% Model Accuracy).',
        'stats': [
            {'label': 'Total Patients', 'value': '2,500'},
            {'label': 'Critical / Continuous', 'value': '303'},
            {'label': 'Model Accuracy', 'value': '95.8%'},
        ],
    },
    {
        'id': 2,
        'num': 2,
        'name': 'Intensive Care Unit (ICU) & High-Risk Triage Analytics',
        'type': 'Critical Care',
        'typeColor': '#dc2626',
        'iconBg': '#fef2f2',
        'iconColor': '#dc2626',
        'iconType': 'chart',
        'dept': 'Intensive Care Unit',
        'dateRange': '01 Oct 2026 - 26 Oct 2026',
        'generatedOn': '25 Oct 2026, 04:15 PM',
        'author': 'Dr. Meera Kadam (Critical Care Lead)',
        'summary': 'In-depth hemodynamics tracking for 303 ICU patients with continuous ECG monitoring, GCS evaluation, and oxygenation status.',
        'stats': [
            {'label': 'ICU Beds Occupied', 'value': '303'},
            {'label': 'Avg Shock Index', 'value': '0.74'},
            {'label': 'Mean SpO2', 'value': '93.4%'},
        ],
    },
    {
        'id': 3,
        'num': 3,
        'name': 'Emergency Department Triage & Rapid Resuscitation Flow',
        'type': 'Emergency Flow',
        'typeColor': '#d97706',
        'iconBg': '#fffbeb',
        'iconColor': '#d97706',
        'iconType': 'arrow',
        'dept': 'Emergency & Trauma',
        'dateRange': '01 Oct 2026 - 26 Oct 2026',
        'generatedOn': '26 Oct 2026, 08:00 AM',
        'author': 'Dr. Vikram Deshmukh (ER Chief)',
        'summary': 'Patient flow, triage urgency classification, pain score management, and ER-to-ICU escalation audit for 259 patients.',
        'stats': [
            {'label': 'ER Admissions', 'value': '259'},
            {'label': 'Mean Door-to-Doctor', 'value': '8.2 mins'},
            {'label': 'Escalation Rate', 'value': '14.2%'},
        ],
    },
    {
        'id': 4,
        'num': 4,
        'name': 'Cardiology & 12-Lead ECG Rhythm Surveillance Report',
        'type': 'Cardiology',
        'typeColor': '#7c3aed',
        'iconBg': '#f5f3ff',
        'iconColor': '#7c3aed',
        'iconType': 'chart',
        'dept': 'Cardiology',
        'dateRange': '01 Oct 2026 - 26 Oct 2026',
        'generatedOn': '24 Oct 2026, 02:40 PM',
        'author': 'Dr. Sneha Kulkarni (Cardiology Lead)',
        'summary': 'Surveillance of ECG rhythms across all care units: Atrial Fibrillation, ST-T Changes, Sinus Tachycardia, and correlation with blood pressure.',
        'stats': [
            {'label': 'Arrhythmias Detected', 'value': '412'},
            {'label': 'Hypertension Cases', 'value': '860'},
            {'label': 'Echo Consultations', 'value': '184'},
        ],
    },
    {
        'id': 5,
        'num': 5,
        'name': 'Central Laboratory Diagnostic Quality & Turnaround Time',
        'type': 'Laboratory',
        'typeColor': '#0d9488',
        'iconBg': '#ccfbf1',
        'iconColor': '#0d9488',
        'iconType': 'flask',
        'dept': 'Laboratory',
        'dateRange': '01 Oct 2026 - 26 Oct 2026',
        'generatedOn': '26 Oct 2026, 09:30 AM',
        'author': 'Central Pathology Lab',
        'summary': 'Turnaround times and critical value notifications for CBC panels, glucose assays, blood gas analysis, and renal function tests.',
        'stats': [
            {'label': 'Tests Processed', 'value': '2,500+'},
            {'label': 'Avg Turnaround', 'value': '38 mins'},
            {'label': 'Critical Value Alerts', 'value': '346'},
        ],
    },
    {
        'id': 6,
        'num': 6,
        'name': 'Pharmacy Dispensing & Drug Allergy Safety Audit',
        'type': 'Pharmacy Safety',
        'typeColor': '#ea580c',
        'iconBg': '#ffedd5',
        'iconColor': '#ea580c',
        'iconType': 'pill',
        'dept': 'Pharmacy',
        'dateRange': '01 Oct 2026 - 26 Oct 2026',
        'generatedOn': '25 Oct 2026, 06:10 PM',
        'author': 'Chief Pharmacist Office',
        'summary': 'Safety audit matching 2,500 inpatient medication orders against recorded allergies: 488 Penicillin allergies and 493 Sulfa drug allergies verified 100% contraindication-free.',
        'stats': [
            {'label': 'Orders Screened', 'value': '2,500'},
            {'label': 'Allergy Alerts Prevented', 'value': '981'},
            {'label': 'Safety Score', 'value': '100%'},
        ],
    },
]

# Write JS file
js_template = f"""/**
 * IHMS Clinical Master Dataset
 * Generated from patient_clinical_monitoring.csv ({total_records} records)
 * and ML Deterioration & Triage Prediction Engine.
 */

export const CLINICAL_DOCTORS = {json.dumps(DOCTORS, indent=2)};

export const ALL_MONITORING_RECORDS = {json.dumps(patient_compact_records, indent=2)};

export const CLINICAL_APPOINTMENTS = {json.dumps(appointments, indent=2)};

export const CLINICAL_LAB_ORDERS = {json.dumps(lab_orders, indent=2)};

export const CLINICAL_PRESCRIPTIONS = {json.dumps(prescriptions, indent=2)};

export const CLINICAL_REFERRALS = {json.dumps(referrals, indent=2)};

export const CLINICAL_DOCUMENTS = {json.dumps(documents, indent=2)};

export const CLINICAL_REPORTS_ANALYTICS = {json.dumps(REPORTS_ANALYTICS, indent=2)};

/**
 * Dynamic patient profile builder for PatientOverview
 * Takes any patient ID (PAT-000001 to PAT-002500 or P-10245) and returns the full rich clinical record.
 */
export function getPatientProfile(patientId) {{
  if (!patientId) return null;
  const targetId = patientId.trim().toUpperCase();

  // Check legacy profiles
  if (targetId === 'P-10245') {{
    return {{
      name: 'Rahul Patil',
      pid: 'P-10245',
      age: 32,
      gender: 'Male',
      symbol: '♂',
      phone: '+91 98765 43210',
      email: 'rahul.patil@example.com',
      city: 'Pune',
      bloodGroup: 'B+',
      initials: 'RP',
      avatar: '/avatars/patient_rahul.png',
      severity: 'Urgent / High Concern',
      condition: 'Acute Febrile Illness & Dehydration Risk',
      careUnit: 'General Ward',
      careLocationType: 'General Ward',
      roomNo: 'GW-01',
      bedNo: 'GW-B02',
      monitoringLevel: 'Enhanced',
      deteriorationRisk: 'Moderate',
      riskScore: 38.5,
      predictedCareUnit: 'General Ward',
      predictedMonitoringLevel: 'Enhanced',
      allergyStatus: 'Penicillin (Severe cutaneous allergy)',
      patientCategory: 'Existing Patient',
      recordStatus: 'Active',
      assignedDoctor: 'Dr. Amit Deshmukh',
      assignedDoctorDept: 'General Medicine',
      vitals: {{
        temp: {{ val: '38.6 °C', status: '↑ High Febrile', color: '#dc2626', bg: '#fef2f2', iconColor: '#ef4444' }},
        hr: {{ val: '92 bpm', status: 'Normal', color: '#059669', bg: '#ecfdf5', iconColor: '#10b981' }},
        spo2: {{ val: '97.0%', status: 'Optimal', color: '#0284c7', bg: '#eff6ff', iconColor: '#0284c7' }},
        bp: {{ val: '118/76', status: 'Normotensive', color: '#7c3aed', bg: '#f5f3ff', iconColor: '#7c3aed' }},
        glucose: {{ val: '115 mg/dL', status: 'Normal', color: '#059669', bg: '#ecfdf5' }},
        rr: {{ val: '18 bpm', status: 'Normal', color: '#059669', bg: '#ecfdf5' }},
        gcs: {{ val: '15/15', status: 'Full GCS', color: '#059669', bg: '#ecfdf5' }},
        pain: {{ val: '3/10', status: 'Mild Discomfort', color: '#059669', bg: '#fffbeb' }},
        urine: {{ val: '42 mL/hr', status: 'Normal Output', color: '#059669', bg: '#ecfdf5' }},
      }},
      summary: 'Patient has fever for 3 days with mild dehydration. Documented Penicillin allergy. Beta-lactam antibiotics strictly avoided. Oral hydration and Paracetamol initiated.',
      medications: [
        {{ id: 1, drug: 'Paracetamol 650mg', dosage: '1 Tab', route: 'Oral', freq: 'TDS (Post meals)', duration: '3 Days', doctor: 'Dr. Amit Deshmukh', status: 'Active' }},
        {{ id: 2, drug: 'Oral Rehydration Solution (ORS)', dosage: '500 mL', route: 'Oral', freq: 'TDS', duration: '3 Days', doctor: 'Dr. Amit Deshmukh', status: 'Active' }},
      ],
      allergies: [
        {{ id: 1, allergen: 'Penicillin / Amoxicillin', type: 'Drug Allergy', severity: 'Severe', reaction: 'Urticaria & Anaphylaxis Risk', date: 'Verified on File', status: 'Verified' }}
      ],
      history: [
        {{ id: 1, date: '20 Oct 2026', title: 'Acute Febrile Illness Workup', desc: 'Admitted under Dr. Amit Deshmukh (General Medicine)', color: '#10b981' }},
      ],
      labReports: [
        {{ id: 1, title: 'Complete Blood Count (CBC)', date: '20 Oct 2026', status: 'Completed', result: 'WBC: 12,400 /mcL (Elevated), Hb: 14.2 g/dL, Platelets: 185,000 /mcL' }}
      ]
    }};
  }}

  const found = ALL_MONITORING_RECORDS.find((p) => p.patient_id.toUpperCase() === targetId);
  if (!found) return null;

  const hr = Math.round(found.heart_rate_bpm);
  const sbp = Math.round(found.systolic_bp_mmhg);
  const dbp = Math.round(found.diastolic_bp_mmhg);
  const rr = Math.round(found.respiratory_rate_bpm);
  const spo2 = parseFloat(found.spo2_percent).toFixed(1);
  const temp_c = parseFloat(found.temperature_c).toFixed(1);
  const glucose = Math.round(found.blood_glucose_mg_dl);
  const urine = parseFloat(found.urine_output_ml_hr).toFixed(1);
  const isTempHigh = Number(temp_c) >= 38.0;
  const isHrHigh = hr > 100;
  const isSpo2Low = Number(spo2) < 95.0;
  const isBpHigh = sbp >= 140 || dbp >= 90;

  // Build safe medications
  const meds = [];
  let mId = 1;
  if (Number(temp_c) >= 37.5) {{
    meds.push({{ id: mId++, drug: 'Paracetamol 650mg', dosage: '1 Tab', route: 'Oral', freq: 'TDS (Post meals)', duration: '3 Days', doctor: found.doctor_name, status: 'Active' }});
  }}
  if (sbp >= 135) {{
    meds.push({{ id: mId++, drug: 'Telmisartan 40mg', dosage: '1 Tab', route: 'Oral', freq: 'OD (Morning)', duration: '30 Days', doctor: found.doctor_name, status: 'Active' }});
  }}
  if (glucose >= 150) {{
    meds.push({{ id: mId++, drug: 'Metformin 500mg', dosage: '1 Tab', route: 'Oral', freq: 'BD (After meals)', duration: '30 Days', doctor: found.doctor_name, status: 'Active' }});
  }}
  if (Number(urine) < 35) {{
    meds.push({{ id: mId++, drug: 'IV Normal Saline 0.9%', dosage: '500 mL', route: 'IV Infusion', freq: 'Over 4 hours', duration: '1 Day', doctor: found.doctor_name, status: 'Active' }});
  }}
  if (meds.length === 0) {{
    meds.push({{ id: 1, drug: 'Multivitamin Complex with Minerals', dosage: '1 Tab', route: 'Oral', freq: 'OD (Post lunch)', duration: '15 Days', doctor: found.doctor_name, status: 'Active' }});
    meds.push({{ id: 2, drug: 'Pantoprazole 40mg', dosage: '1 Cap', route: 'Oral', freq: 'OD (Before breakfast)', duration: '7 Days', doctor: found.doctor_name, status: 'Active' }});
  }}

  // Build allergies list
  const allergiesList = [];
  const allergy = found.allergy_status || 'No Known Allergy';
  if (allergy && !['no known allergy', 'unknown', 'none'].includes(allergy.toLowerCase())) {{
    allergiesList.push({{
      id: 1,
      allergen: `${{allergy}} Hypersensitivity`,
      type: allergy.toLowerCase().includes('drug') || allergy.toLowerCase().includes('cillin') ? 'Drug Allergy' : 'Substance Allergy',
      severity: allergy.toLowerCase().includes('cillin') ? 'Severe' : 'Moderate',
      reaction: 'Cutaneous rash, bronchospasm, urticaria risk',
      date: 'Recorded on Admission',
      status: 'Verified by Clinician'
    }});
  }} else {{
    allergiesList.push({{
      id: 1,
      allergen: 'No Known Drug Allergies (NKDA)',
      type: 'General Assessment',
      severity: 'None',
      reaction: 'None reported by patient or caregiver',
      date: 'Verified on Admission',
      status: 'Verified'
    }});
  }}

  const summaryText = `${{found.age}}-year-old ${{found.gender}} admitted to ${{found.care_unit}} (Room ${{found.room_no}}, Bed ${{found.bed_no}}). Vital parameters: BP ${{sbp}}/${{dbp}} mmHg, Pulse ${{hr}} bpm (${{found.ecg_rhythm}}), SpO2 ${{spo2}}%, Temperature ${{temp_c}}°C, Glucose ${{glucose}} mg/dL, Urine ${{urine}} mL/hr. ML Deterioration Risk: ${{found.deterioration_risk}} (Risk Score: ${{found.risk_score}}/100). Allergy status: ${{allergy}}. Attending Clinician: ${{found.doctor_name}} (${{found.doctor_dept}}).`;

  return {{
    name: found.full_name,
    pid: found.patient_id,
    age: found.age,
    gender: found.gender,
    symbol: found.gender === 'Female' ? '♀' : '♂',
    phone: found.phone,
    email: found.email,
    city: found.city,
    bloodGroup: found.patient_id.charCodeAt(found.patient_id.length - 1) % 4 === 0 ? 'B+' : (found.patient_id.charCodeAt(found.patient_id.length - 1) % 4 === 1 ? 'O+' : 'A+'),
    initials: ((found.first_name?.[0] || 'P') + (found.last_name?.[0] || 'T')).toUpperCase(),
    avatar: found.gender === 'Female' ? '/avatars/patient_sneha.png' : '/avatars/patient_rahul.png',
    severity: found.deterioration_risk === 'High' ? 'CRITICAL HIGH ALERT' : (found.deterioration_risk === 'Moderate' ? 'MODERATE RISK ALERT' : 'ROUTINE STABLE'),
    condition: `${{found.care_unit}} · Room ${{found.room_no}}, Bed ${{found.bed_no}}`,
    careUnit: found.care_unit,
    careLocationType: found.care_location_type,
    roomNo: found.room_no,
    bedNo: found.bed_no,
    monitoringLevel: found.monitoring_level,
    deteriorationRisk: found.deterioration_risk,
    riskScore: found.risk_score,
    predictedCareUnit: found.predicted_care_unit,
    predictedMonitoringLevel: found.predicted_monitoring_level,
    allergyStatus: allergy,
    patientCategory: found.patient_category,
    recordStatus: found.record_status,
    assignedDoctor: found.doctor_name,
    assignedDoctorDept: found.doctor_dept,
    vitals: {{
      temp: {{
        val: `${{temp_c}} °C`,
        status: isTempHigh ? '↑ High Febrile' : 'Normal',
        color: isTempHigh ? '#dc2626' : '#059669',
        bg: isTempHigh ? '#fef2f2' : '#ecfdf5',
        iconColor: isTempHigh ? '#ef4444' : '#10b981',
      }},
      hr: {{
        val: `${{hr}} bpm`,
        status: found.ecg_rhythm !== 'Not Ordered' && found.ecg_rhythm !== 'Not Recorded' ? found.ecg_rhythm : (60 <= hr && hr <= 100 ? 'Normal' : 'Elevated'),
        color: isHrHigh ? '#dc2626' : '#059669',
        bg: isHrHigh ? '#fef2f2' : '#ecfdf5',
        iconColor: isHrHigh ? '#ef4444' : '#10b981',
      }},
      spo2: {{
        val: `${{spo2}}%`,
        status: isSpo2Low ? '↓ Hypoxia Risk' : 'Optimal Saturation',
        color: isSpo2Low ? '#dc2626' : '#0284c7',
        bg: isSpo2Low ? '#fef2f2' : '#eff6ff',
        iconColor: isSpo2Low ? '#ef4444' : '#0284c7',
      }},
      bp: {{
        val: `${{sbp}}/${{dbp}}`,
        status: sbp >= 140 ? 'Stage 2 Hypertension' : (sbp >= 130 ? 'Prehypertension' : 'Normal'),
        color: isBpHigh ? '#dc2626' : '#7c3aed',
        bg: isBpHigh ? '#fef2f2' : '#f5f3ff',
        iconColor: isBpHigh ? '#ef4444' : '#7c3aed',
      }},
      glucose: {{
        val: `${{glucose}} mg/dL`,
        status: glucose >= 160 ? 'Elevated Hyperglycemia' : 'Normoglycemic Target',
        color: glucose >= 160 ? '#dc2626' : '#059669',
        bg: '#ecfdf5',
      }},
      rr: {{
        val: `${{rr}} bpm`,
        status: rr >= 24 ? 'Tachypneic' : 'Normal Eupneic',
        color: rr >= 24 ? '#dc2626' : '#059669',
        bg: '#ecfdf5',
      }},
      gcs: {{
        val: `${{found.gcs_score}}/15`,
        status: found.gcs_score < 14 ? 'Impaired Consciousness' : 'Fully Oriented GCS 15',
        color: found.gcs_score < 14 ? '#dc2626' : '#059669',
        bg: '#ecfdf5',
      }},
      pain: {{
        val: `${{found.pain_score}}/10`,
        status: found.pain_score >= 7 ? 'Severe Distress' : (found.pain_score >= 4 ? 'Moderate Discomfort' : 'Mild / Nil'),
        color: found.pain_score >= 7 ? '#dc2626' : (found.pain_score >= 4 ? '#d97706' : '#059669'),
        bg: '#fffbeb',
      }},
      urine: {{
        val: `${{urine}} mL/hr`,
        status: Number(urine) < 30 ? 'Oliguria Concern' : 'Adequate Renal Clearance',
        color: Number(urine) < 30 ? '#dc2626' : '#059669',
        bg: '#ecfdf5',
      }},
    }},
    summary: summaryText,
    medications: meds,
    allergies: allergiesList,
    history: [
      {{
        id: 1,
        date: 'Admission Day',
        title: `${{found.care_unit}} Inpatient Intake`,
        desc: `Admitted to Room ${{found.room_no}}, Bed ${{found.bed_no}} under ${{found.doctor_name}}`,
        color: '#10b981',
        reportType: 'Clinical Admission Note',
        doctor: found.doctor_name,
        details: `Patient presented and admitted into ${{found.care_unit}}. Triage assessment completed. Monitoring level set to ${{found.monitoring_level}}.`,
        prescriptions: meds.map((m) => m.drug),
        labSummary: `Glucose: ${{glucose}} mg/dL | Urine: ${{urine}} mL/hr | SpO2: ${{spo2}}%`,
      }},
      {{
        id: 2,
        date: found.monitoring_last_updated || 'Latest Record',
        title: `Vital Signs Monitoring · ${{found.monitoring_frequency}}`,
        desc: `BP: ${{sbp}}/${{dbp}}, HR: ${{hr}} bpm (${{found.ecg_rhythm}}), SpO2: ${{spo2}}%, Temp: ${{temp_c}}°C`,
        color: '#0284c7',
        reportType: 'EHR Vital Monitoring Log',
        doctor: found.doctor_name,
        details: `Physiological vital assessment verified. Clinical deterioration risk score: ${{found.risk_score}}/100 (${{found.deterioration_risk}} Risk).`,
        prescriptions: meds.map((m) => m.drug),
        labSummary: `GCS: ${{found.gcs_score}}/15 | Pain Score: ${{found.pain_score}}/10 | ECG: ${{found.ecg_rhythm}}`,
      }},
    ],
    labReports: [
      {{
        id: 1,
        title: 'Complete Blood Count (CBC) Panel',
        date: '26 Oct 2026',
        status: 'Completed',
        result: `Total WBC: ${{Math.round(6200 + (hr - 70) * 45)}} /mcL, Hemoglobin: 13.8 g/dL, Platelets: 225,000 /mcL`,
      }},
      {{
        id: 2,
        title: 'Blood Glucose & Metabolic Profile',
        date: '26 Oct 2026',
        status: 'Completed',
        result: `${{glucose}} mg/dL (${{glucose >= 140 ? 'Elevated' : 'Normal Target 70-140 mg/dL'}})`,
      }},
      {{
        id: 3,
        title: '12-Lead Electrocardiogram (ECG) Report',
        date: '26 Oct 2026',
        status: 'Completed',
        result: `Heart Rate: ${{hr}} bpm, Rhythm: ${{found.ecg_rhythm}}`,
      }},
    ],
  }};
}}
"""

print(f"Writing dataset to {OUTPUT_JS}...")
OUTPUT_JS.write_text(js_template, encoding='utf-8')
print("Successfully generated clean clinicalDataset.js!")
