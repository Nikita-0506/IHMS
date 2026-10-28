import os
import sys
import django
from datetime import date, datetime, timedelta

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_ai.settings')
django.setup()

from accounts.models import User
from patients.models import Patient, PatientReport
from doctors.models import Doctor, ServiceRequest
from appointments.models import Appointment
from ai_analysis.models import MedicalDocument, AIClinicalSummary, ClinicalAuditLog
from ai_analysis.inference.clinical_inference import generate_structured_ai_summary
from ai_analysis.ocr_scanner.document_ocr import process_ocr_pipeline


def seed():
    print("--- Seeding Clinical Demo Data for IHMS ---")

    # 1. Create Admin
    admin_user, _ = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@ihms.hospital',
            'first_name': 'System',
            'last_name': 'Administrator',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
            'is_verified': True,
            'is_active': True,
        }
    )
    admin_user.set_password('Admin@12345')
    admin_user.save()
    print("Admin user ready: admin / Admin@12345")

    # 2. Create Doctors
    doctors_data = [
        {
            'username': 'dr_sharma',
            'email': 'dr.sharma@ihms.hospital',
            'first_name': 'Amit',
            'last_name': 'Sharma',
            'doc_id': 'DOC-101',
            'specialization': 'General Medicine & Infectious Disease',
            'department': 'General Medicine',
            'qualification': 'MBBS, MD (Medicine)',
            'experience': 14,
            'fee': 600.00,
            'license': 'MCI-48192',
            'shift': 'morning',
            'opd': '09:00 AM - 02:00 PM',
            'room': 'OPD-102',
            'availability': 'available',
        },
        {
            'username': 'dr_kulkarni',
            'email': 'dr.kulkarni@ihms.hospital',
            'first_name': 'Sneha',
            'last_name': 'Kulkarni',
            'doc_id': 'DOC-102',
            'specialization': 'Cardiology',
            'department': 'Cardiology',
            'qualification': 'MBBS, MD, DM (Cardiology)',
            'experience': 16,
            'fee': 1000.00,
            'license': 'MCI-51203',
            'shift': 'evening',
            'opd': '02:00 PM - 07:00 PM',
            'room': 'OPD-205',
            'availability': 'available',
        },
        {
            'username': 'dr_iyer',
            'email': 'dr.iyer@ihms.hospital',
            'first_name': 'Rajesh',
            'last_name': 'Iyer',
            'doc_id': 'DOC-103',
            'specialization': 'Pediatrics',
            'department': 'Pediatrics',
            'qualification': 'MBBS, MD (Pediatrics), DCH',
            'experience': 11,
            'fee': 500.00,
            'license': 'MCI-67341',
            'shift': 'morning',
            'opd': '08:30 AM - 01:30 PM',
            'room': 'OPD-108',
            'availability': 'busy',
        },
        {
            'username': 'dr_deshmukh',
            'email': 'dr.deshmukh@ihms.hospital',
            'first_name': 'Vikram',
            'last_name': 'Deshmukh',
            'doc_id': 'DOC-104',
            'specialization': 'Emergency & Trauma Care',
            'department': 'Emergency & Critical Care',
            'qualification': 'MBBS, MEM (Emergency Medicine)',
            'experience': 9,
            'fee': 800.00,
            'license': 'MCI-79812',
            'shift': 'night',
            'opd': '24x7 ER Coverage',
            'room': 'ER-Resus-1',
            'availability': 'available',
        },
    ]

    doctor_objs = {}
    for d in doctors_data:
        u, _ = User.objects.get_or_create(
            username=d['username'],
            defaults={
                'email': d['email'],
                'first_name': d['first_name'],
                'last_name': d['last_name'],
                'role': 'doctor',
                'is_staff': True,
                'is_verified': True,
                'is_active': True,
            }
        )
        u.set_password('Doctor@12345')
        u.save()

        doc, _ = Doctor.objects.get_or_create(
            user=u,
            defaults={
                'doctor_id': d['doc_id'],
                'specialization': d['specialization'],
                'department': d['department'],
                'qualification': d['qualification'],
                'experience_years': d['experience'],
                'consultation_fee': d['fee'],
                'license_number': d['license'],
                'shift': d['shift'],
                'opd_timing': d['opd'],
                'room_number': d['room'],
                'availability': d['availability'],
                'is_active': True,
            }
        )
        doctor_objs[d['username']] = doc
        print(f"Doctor ready: Dr. {u.get_full_name()} ({d['department']})")

    # 3. Create Patients (Including Rahul Patil P-10245)
    patient_records = [
        {
            'username': 'rahul_patil',
            'email': 'rahul.patil@example.com',
            'first_name': 'Rahul',
            'last_name': 'Patil',
            'pid': 'P-10245',
            'age': 42,
            'dob': date(1984, 5, 14),
            'gender': 'male',
            'blood_group': 'B+',
            'phone': '9823456789',
            'patient_type': 'existing',
            'care_status': 'ongoing',
            'referral_status': 'not_referred',
            'current_severity': 'urgent',
            'current_condition': 'Fever with dehydration concern',
            'med_history': 'Type 2 Diabetes Mellitus (managed on Metformin), Seasonal Bronchial Asthma',
            'allergies': 'Penicillin (mild urticarial rash)',
            'assigned_doctor': doctor_objs['dr_sharma'],
        },
        {
            'username': 'priya_deshmukh',
            'email': 'priya.deshmukh@example.com',
            'first_name': 'Priya',
            'last_name': 'Deshmukh',
            'pid': 'P-10246',
            'age': 34,
            'dob': date(1992, 8, 22),
            'gender': 'female',
            'blood_group': 'O+',
            'phone': '9876543210',
            'patient_type': 'existing',
            'care_status': 'ongoing',
            'referral_status': 'referred',
            'current_severity': 'urgent',
            'current_condition': 'Referral · Records pending verification',
            'med_history': 'Refractory abdominal pain, hypokalemia',
            'allergies': 'Sulfa drugs',
            'referring_hospital': 'District Community Health Hospital, Satara',
            'referring_doctor': 'Dr. Anand Patil (Surgeon)',
            'transfer_reason': 'Specialist evaluation for unresolving right iliac fossa pain',
            'last_dose_taken': 'Tramadol 50mg IV at 06:00 AM',
            'assigned_doctor': doctor_objs['dr_sharma'],
        },
        {
            'username': 'sunita_joshi',
            'email': 'sunita.joshi@example.com',
            'first_name': 'Sunita',
            'last_name': 'Joshi',
            'pid': 'P-10247',
            'age': 58,
            'dob': date(1968, 3, 10),
            'gender': 'female',
            'blood_group': 'A+',
            'phone': '9123456780',
            'patient_type': 'existing',
            'care_status': 'ongoing',
            'referral_status': 'not_referred',
            'current_severity': 'routine',
            'current_condition': 'Routine follow-up — Hypertension review',
            'med_history': 'Essential Hypertension (controlled on Amlodipine 5mg)',
            'allergies': 'None known',
            'assigned_doctor': doctor_objs['dr_kulkarni'],
        },
        {
            'username': 'vikram_singh_er',
            'email': 'vikram.singh@example.com',
            'first_name': 'Vikram',
            'last_name': 'Singh',
            'pid': 'P-10248',
            'age': 29,
            'dob': date(1997, 11, 3),
            'gender': 'male',
            'blood_group': 'O-',
            'phone': '9988776655',
            'patient_type': 'new',
            'care_status': 'initial_assessment',
            'referral_status': 'not_referred',
            'current_severity': 'emergency',
            'current_condition': 'Accident / Severe Trauma — Blunt thoracic injury with hypoxia (SpO2 88%)',
            'med_history': 'None known',
            'allergies': 'None reported',
            'assigned_doctor': doctor_objs['dr_deshmukh'],
        },
    ]

    patient_objs = {}
    for p in patient_records:
        u, _ = User.objects.get_or_create(
            username=p['username'],
            defaults={
                'email': p['email'],
                'first_name': p['first_name'],
                'last_name': p['last_name'],
                'role': 'patient',
                'is_verified': True,
                'is_active': True,
            }
        )
        u.set_password('Patient@12345')
        u.save()

        pat = getattr(u, 'patient_profile', None)
        if not pat:
            pat = Patient.objects.create(
                user=u,
                patient_id=p['pid'],
                date_of_birth=p['dob'],
                gender=p['gender'],
                blood_group=p['blood_group'],
                emergency_contact='9800000000',
                address='Pune, Maharashtra',
            )
        pat.patient_id = p['pid']
        pat.blood_group = p['blood_group']
        pat.gender = p['gender']
        pat.date_of_birth = p['dob']
        pat.phone_number = p['phone']
        pat.emergency_contact = '9800000000'
        pat.address = 'Pune, Maharashtra'
        pat.medical_history = p['med_history']
        pat.allergies = p['allergies']
        pat.patient_type = p['patient_type']
        pat.care_status = p['care_status']
        pat.referral_status = p['referral_status']
        pat.current_severity = p['current_severity']
        pat.current_condition = p['current_condition']
        pat.referring_hospital = p.get('referring_hospital')
        pat.referring_doctor = p.get('referring_doctor')
        pat.transfer_reason = p.get('transfer_reason')
        pat.last_dose_taken = p.get('last_dose_taken')
        pat.assigned_doctor = p.get('assigned_doctor')
        pat.status = 'critical' if p['current_severity'] == 'emergency' else 'admitted'
        pat.save()
        patient_objs[p['pid']] = pat
        print(f"Patient ready: {pat.user.get_full_name()} ({pat.patient_id}) - Severity: {pat.current_severity}")

    # 4. Create Appointments for Today
    today = date.today()
    rahul = patient_objs['P-10245']
    priya = patient_objs['P-10246']
    sunita = patient_objs['P-10247']
    vikram = patient_objs['P-10248']

    appts_data = [
        (rahul, doctor_objs['dr_sharma'], '10:00:00', 'High fever, dry mouth, weakness for 4 days', 'pending', 2),
        (priya, doctor_objs['dr_sharma'], '11:15:00', 'Transfer case: unresolving lower abdominal pain', 'pending', 2),
        (sunita, doctor_objs['dr_kulkarni'], '12:00:00', 'Scheduled 3-month blood pressure and ECG review', 'confirmed', 0),
        (vikram, doctor_objs['dr_deshmukh'], '09:30:00', 'Emergency trauma room intake', 'emergency', 3),
    ]

    for p, doc, t_str, symp, stat, prio in appts_data:
        t = datetime.strptime(t_str, '%H:%M:%S').time()
        Appointment.objects.get_or_create(
            patient=p,
            doctor=doc,
            date=today,
            time=t,
            defaults={
                'symptoms': symp,
                'status': stat,
                'priority_level': prio,
            }
        )

    # 5. Create OCR Documents for Rahul Patil (P-10245)
    ocr_cbc_text = """
    METROPOLIS CLINICAL DIAGNOSTIC LABORATORY
    Patient Name: Rahul Patil
    Patient ID: P-10245
    Age: 42 Years    Gender: Male
    Ref by: Dr. Amit Sharma
    Date: 2026-10-12

    HAEMATOLOGY INVESTIGATION REPORT
    Hemoglobin : 13.8 g/dL          (Ref: 12.0 - 17.5 g/dL)
    WBC Count  : 12400 /cumm        (Ref: 4000 - 11000 /cumm)  *HIGH*
    Platelets  : 210000 /cumm       (Ref: 150000 - 450000 /cumm)
    ESR        : 28 mm/hr           (Ref: 0 - 20 mm/hr)        *HIGH*
    Serum Creatinine : 1.0 mg/dL    (Ref: 0.6 - 1.2 mg/dL)
    Fasting Blood Sugar : 118 mg/dL (Ref: 70 - 100 mg/dL)      *HIGH*

    Interpretation: Mild leukocytosis with raised inflammatory markers. Hydration monitoring recommended.
    """
    parsed_cbc = process_ocr_pipeline(ocr_cbc_text, 'lab_report', rahul)

    doc_cbc, _ = MedicalDocument.objects.get_or_create(
        document_id='DOC-OCR-10245-01',
        defaults={
            'patient': rahul,
            'document_type': 'lab_report',
            'title': 'Complete Blood Count & Metabolic Profile',
            'raw_text': ocr_cbc_text,
            'ocr_confidence': 0.96,
            'verification_status': 'verified',
            'verified_by': admin_user,
            'verified_at': datetime.now(),
            'extracted_data': parsed_cbc,
            'doctor_notes': 'Verified: WBC 12,400 confirmed indicating acute bacterial/viral inflammatory response.',
        }
    )

    ocr_rx_text = """
    DR. S. K. DESHMUKH CLINIC
    Patient: Rahul Patil    Date: 09/10/2026
    Rx:
    1. Paracetamol 650mg tablet - 1 TDS x 3 days
    2. Pantoprazole 40mg - 1 OD before breakfast
    3. ORS sachet - 1 packet in 1 litre water daily
    Advised: Plenty of fluids, review if fever > 101 F.
    """
    parsed_rx = process_ocr_pipeline(ocr_rx_text, 'prescription', rahul)

    doc_rx, _ = MedicalDocument.objects.get_or_create(
        document_id='DOC-OCR-10245-02',
        defaults={
            'patient': rahul,
            'document_type': 'prescription',
            'title': 'External Primary Clinic Prescription',
            'raw_text': ocr_rx_text,
            'ocr_confidence': 0.91,
            'verification_status': 'verified',
            'verified_by': doctor_objs['dr_sharma'].user,
            'verified_at': datetime.now(),
            'extracted_data': parsed_rx,
            'doctor_notes': 'Reviewed previous medication. Paracetamol 650mg given with oral rehydration.',
        }
    )

    # 6. Generate 5-Section AI Clinical Summary for Rahul Patil (P-10245)
    rahul_vitals = {
        'temperature': 101.8,
        'systolic_bp': 124,
        'diastolic_bp': 82,
        'heart_rate': 104,
        'spo2': 97,
        'respiratory_rate': 20,
        'hydration': 'Mild dehydration (dry tongue & oral mucosa)',
    }
    rahul_symptoms = ['Persistent high fever (4 days)', 'Fatigue and muscle soreness', 'Reduced oral intake and dehydration concern']
    
    summary_data = generate_structured_ai_summary(
        patient=rahul,
        current_vitals=rahul_vitals,
        current_symptoms=rahul_symptoms,
        case_type='fever',
        ocr_reports_data=[doc_cbc.extracted_data, doc_rx.extracted_data],
        previous_visit_count=3,
        previous_vitals={'temperature': 98.6, 'systolic_bp': 120, 'diastolic_bp': 80, 'heart_rate': 78, 'spo2': 99},
        additional_notes='Patient has 3 previous visits on record. Review current vitals, recorded allergies and hydration.',
    )

    ai_sum, _ = AIClinicalSummary.objects.get_or_create(
        patient=rahul,
        defaults={
            'doctor': doctor_objs['dr_sharma'],
            'case_type': 'fever',
            'priority_level': 'urgent',
            'trend_comparison': summary_data['trend_comparison'],
            'current_condition': summary_data['summary_sections']['1_current_condition'],
            'relevant_history': summary_data['summary_sections']['2_relevant_history'],
            'alerts': summary_data['summary_sections']['3_alerts'],
            'pending_actions': summary_data['summary_sections']['4_pending_actions'],
            'source_documents': summary_data['summary_sections']['5_source_documents'],
            'vitals_snapshot': rahul_vitals,
            'risk_score': summary_data['risk_score'],
            'ai_confidence': summary_data['confidence'],
            'doctor_reviewed': False,
        }
    )

    # Clinical Audit Log
    ClinicalAuditLog.objects.create(
        patient=rahul,
        model_name='IHMS-ClinicalInference-v2.1',
        model_version='2.1.0',
        input_features={'vitals': rahul_vitals, 'symptoms': rahul_symptoms, 'previous_visits': 3},
        output_summary={'priority': 'urgent', 'trend': summary_data['trend_comparison'], 'risk_score': 72.0},
        verification_status='pending_doctor_review',
    )

    # 7. Service Requests (Demonstrating Service Coordination: Consult -> Lab -> Pharmacy)
    # Lab Request
    ServiceRequest.objects.get_or_create(
        request_id='LAB-261012-001',
        defaults={
            'patient': rahul,
            'ordering_doctor': doctor_objs['dr_sharma'],
            'service_type': 'laboratory',
            'department': 'Pathology & Microbiology',
            'priority': 'urgent',
            'status': 'in_progress',
            'details': 'Serum Electrolytes (Na+, K+, Cl-), Dengue NS1 Antigen, Urine Routine',
            'responsible_team': 'Central Diagnostic Lab',
        }
    )

    # Pharmacy Request
    ServiceRequest.objects.get_or_create(
        request_id='PHM-261012-001',
        defaults={
            'patient': rahul,
            'ordering_doctor': doctor_objs['dr_sharma'],
            'service_type': 'pharmacy',
            'department': 'Hospital Pharmacy',
            'priority': 'routine',
            'status': 'dispensed',
            'details': 'IV Normal Saline 500ml x 1 bottle, Paracetamol Infusion 100ml, ORS sachets x 3',
            'result_summary': 'Dispensed by Pharmacist Manoj Patil at 10:45 AM. Batch NS-994.',
            'responsible_team': 'Main OPD Pharmacy',
        }
    )

    print("--- Successfully seeded all IHMS demo data! ---")


if __name__ == '__main__':
    seed()
