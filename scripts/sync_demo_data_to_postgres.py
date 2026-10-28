import os
import sys
import sqlite3
from pathlib import Path
from datetime import datetime

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_ai.settings')

import django
django.setup()

from accounts.models import User
from patients.models import Patient
from doctors.models import Doctor, ServiceRequest
from ai_analysis.models import MedicalDocument, AIClinicalSummary, ClinicalAuditLog

sqlite_db = BASE_DIR / 'db.sqlite3'
if not sqlite_db.exists():
    print("No SQLite db found.")
    sys.exit(0)

conn = sqlite3.connect(sqlite_db)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

print("Syncing demo users, doctors, and clinical suite records from SQLite to PostgreSQL...")

# 1. Accounts Users
cur.execute("SELECT * FROM accounts_user")
users = cur.fetchall()
for u in users:
    User.objects.update_or_create(
        id=u['id'],
        defaults={
            'username': u['username'],
            'email': u['email'],
            'first_name': u['first_name'],
            'last_name': u['last_name'],
            'role': u['role'],
            'is_staff': bool(u['is_staff']),
            'is_superuser': bool(u['is_superuser']),
            'is_active': bool(u['is_active']),
            'password': u['password'],
            'phone_number': u['phone_number'],
            'address': u['address'],
        }
    )
print(f"  Synced {len(users)} users.")

# 2. Doctors
cur.execute("SELECT * FROM doctors_doctor")
doctors = cur.fetchall()
for d in doctors:
    u = User.objects.filter(id=d['user_id']).first()
    if u:
        Doctor.objects.update_or_create(
            id=d['id'],
            defaults={
                'user': u,
                'doctor_id': d['doctor_id'] if 'doctor_id' in d.keys() and d['doctor_id'] else f"DOC-{u.username}",
                'specialization': d['specialization'],
                'department': d['department'],
                'qualification': d['qualification'],
                'experience_years': d['experience_years'],
                'consultation_fee': d['consultation_fee'],
                'license_number': d['license_number'],
                'availability': d['availability'],
                'current_queue_count': d['current_queue_count'] if 'current_queue_count' in d.keys() else 0,
                'room_number': d['room_number'] if 'room_number' in d.keys() and d['room_number'] else 'OPD-101',
                'shift': d['shift'] if 'shift' in d.keys() and d['shift'] else 'morning',
            }
        )
print(f"  Synced {len(doctors)} doctors.")

# 3. Patients
cur.execute("SELECT * FROM patients_patient")
patients = cur.fetchall()
for p in patients:
    u = User.objects.filter(id=p['user_id']).first()
    if u:
        doc = Doctor.objects.filter(id=p['assigned_doctor_id']).first() if 'assigned_doctor_id' in p.keys() and p['assigned_doctor_id'] else None
        Patient.objects.update_or_create(
            user=u,
            defaults={
                'patient_id': p['patient_id'],
                'blood_group': p['blood_group'],
                'gender': p['gender'],
                'date_of_birth': p['date_of_birth'],
                'phone_number': p['phone_number'],
                'emergency_contact': p['emergency_contact'],
                'address': p['address'],
                'medical_history': p['medical_history'],
                'allergies': p['allergies'],
                'insurance': p['insurance'],
                'status': p['status'],
                'patient_type': p['patient_type'] if 'patient_type' in p.keys() else 'new',
                'care_status': p['care_status'] if 'care_status' in p.keys() else 'ongoing',
                'referral_status': p['referral_status'] if 'referral_status' in p.keys() else 'not_referred',
                'current_severity': p['current_severity'] if 'current_severity' in p.keys() else 'routine',
                'current_condition': p['current_condition'] if 'current_condition' in p.keys() else '',
                'assigned_doctor': doc,
            }
        )
print(f"  Synced {len(patients)} patients.")

# 4. Service Requests
try:
    cur.execute("SELECT * FROM doctors_servicerequest")
    srs = cur.fetchall()
    for sr in srs:
        pt = Patient.objects.filter(id=sr['patient_id']).first()
        req_by = User.objects.filter(id=sr['requested_by_id']).first()
        if pt and req_by:
            ServiceRequest.objects.update_or_create(
                request_id=sr['request_id'],
                defaults={
                    'patient': pt,
                    'requested_by': req_by,
                    'service_type': sr['service_type'],
                    'department': sr['department'],
                    'priority': sr['priority'],
                    'status': sr['status'],
                    'clinical_note': sr['clinical_note'],
                }
            )
    print(f"  Synced {len(srs)} service requests.")
except Exception as e:
    print(f"  Service requests note: {e}")

# 5. Medical Documents & AI Summaries
try:
    cur.execute("SELECT * FROM ai_analysis_medicaldocument")
    mds = cur.fetchall()
    for md in mds:
        # Match patient by patient_id
        cur2 = conn.cursor()
        cur2.execute("SELECT patient_id FROM patients_patient WHERE id=?", (md['patient_id'],))
        row = cur2.fetchone()
        pt = Patient.objects.filter(patient_id=row['patient_id']).first() if row else None
        v_by = User.objects.filter(id=md['verified_by_id']).first() if md['verified_by_id'] else None
        import json
        ext_data = json.loads(md['extracted_data']) if md['extracted_data'] else {}
        MedicalDocument.objects.update_or_create(
            document_id=md['document_id'],
            defaults={
                'patient': pt,
                'document_type': md['document_type'],
                'title': md['title'],
                'raw_text': md['raw_text'],
                'ocr_confidence': md['ocr_confidence'],
                'verification_status': md['verification_status'],
                'verified_by': v_by,
                'extracted_data': ext_data,
                'doctor_notes': md['doctor_notes'],
                'is_duplicate': bool(md['is_duplicate']),
            }
        )
    print(f"  Synced {len(mds)} medical documents.")
except Exception as e:
    print(f"  Medical documents note: {e}")

try:
    cur.execute("SELECT * FROM ai_analysis_aiclinicalsummary")
    summaries = cur.fetchall()
    for s in summaries:
        cur2 = conn.cursor()
        cur2.execute("SELECT patient_id FROM patients_patient WHERE id=?", (s['patient_id'],))
        row = cur2.fetchone()
        pt = Patient.objects.filter(patient_id=row['patient_id']).first() if row else None
        if pt:
            import json
            sec_dict = json.loads(s['sections']) if s['sections'] else {}
            AIClinicalSummary.objects.update_or_create(
                patient=pt,
                defaults={
                    'lead_summary': s['lead_summary'],
                    'sections': sec_dict,
                    'clinical_status': s['clinical_status'],
                    'source_document_count': s['source_document_count'],
                    'is_current': bool(s['is_current']),
                }
            )
    print(f"  Synced {len(summaries)} AI clinical summaries.")
except Exception as e:
    print(f"  AI clinical summaries note: {e}")

conn.close()
print("PostgreSQL sync of demo suite records complete!")
