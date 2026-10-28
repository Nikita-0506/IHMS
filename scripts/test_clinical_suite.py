import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hospital_ai.settings')
django.setup()

from django.test import RequestFactory
from patients.models import Patient
from doctors.models import Doctor, ServiceRequest
from ai_analysis.models import MedicalDocument, AIClinicalSummary, ClinicalAuditLog
from ai_analysis.views import DoctorViewDashboardAPIView, ClinicalPriorityQueueAPIView, OCRVerifyAPIView
from doctors.views import DoctorCoordinationRosterAPIView, DoctorAssignmentRecommendAPIView, ServiceRequestListCreateAPIView

rf = RequestFactory()

print("="*60)
print("RUNNING IHMS CLINICAL INTEGRATION VALIDATION SUITE")
print("="*60)

# 1. Test Rahul Patil (P-10245) Doctor View Dashboard
rahul = Patient.objects.filter(patient_id='P-10245').first()
assert rahul is not None, "Rahul Patil (P-10245) not found!"
print(f"[PASS] Found Patient: {rahul.user.get_full_name()} ({rahul.patient_id})")
print(f"  Age/Gender: {rahul.age}/{rahul.gender} | Priority: {rahul.current_severity} | Condition: {rahul.current_condition}")
print(f"  Separate Fields: type={rahul.patient_type}, care={rahul.care_status}, referral={rahul.referral_status}")

req = rf.get('/api/ai-analysis/doctor-view/', {'patient_id': 'P-10245'})
view = DoctorViewDashboardAPIView.as_view()
res = view(req)
assert res.status_code == 200, f"DoctorViewDashboard failed with {res.status_code}"
data = res.data
print("[PASS] DoctorViewDashboard API response 200 OK:")
print(f"  Patient Card: {data['patient_card']['name']} | {data['patient_card']['priority']}")
print(f"  AI Lead: {data['patient_card']['ai_clinical_summary_lead']}")
print(f"  5-Section keys: {list(data['ai_summary_5_sections'].keys())}")
print(f"  OCR reports count: {len(data['tabs']['ocr_reports'])}")
print(f"  Vitals: Temp={data['tabs']['vitals']['temperature']['value']}, Pulse={data['tabs']['vitals']['heart_rate']['value']}")

# 2. Test Clinical Priority Queue
req_pq = rf.get('/api/ai-analysis/clinical-priority/')
res_pq = ClinicalPriorityQueueAPIView.as_view()(req_pq)
assert res_pq.status_code == 200
pq_data = res_pq.data
print("[PASS] ClinicalPriorityQueue API 200 OK:")
print(f"  Emergency Patients (Bypass queue): {len(pq_data['emergency_critical'])}")
print(f"  Urgent Patients: {len(pq_data['urgent_high_concern'])}")
print(f"  Routine Patients: {len(pq_data['routine_stable'])}")

# 3. Test Doctor Coordination Roster
req_dr = rf.get('/api/doctors/roster/')
res_dr = DoctorCoordinationRosterAPIView.as_view()(req_dr)
assert res_dr.status_code == 200
print(f"[PASS] Doctor Coordination Roster API 200 OK: {len(res_dr.data)} doctors on duty/available")

# 4. Test Smart Doctor Assignment
req_rec = rf.get('/api/doctors/recommend-assignment/', {'patient_id': 'P-10245'})
res_rec = DoctorAssignmentRecommendAPIView.as_view()(req_rec)
assert res_rec.status_code == 200
rec_data = res_rec.data
print(f"[PASS] Doctor Assignment Recommendation API 200 OK:")
doc_name = rec_data['recommended_doctor']['name'] if rec_data.get('recommended_doctor') else 'None'
print(f"  Assigned doctor: {doc_name} | Dept: {rec_data['department']}")
print(f"  Assignment rationale: {rec_data['reason']}")

# 5. Test Emergency Trauma Bypass Recommendation
trauma_pt = Patient.objects.filter(patient_id='P-10248').first()
if trauma_pt:
    req_er = rf.get('/api/doctors/recommend-assignment/', {'patient_id': 'P-10248'})
    res_er = DoctorAssignmentRecommendAPIView.as_view()(req_er)
    assert res_er.status_code == 200
    print(f"[PASS] Emergency Bypass Recommendation: {res_er.data['reason']}")

# 6. Test Service Requests API
req_sr = rf.get('/api/doctors/service-requests/')
res_sr = ServiceRequestListCreateAPIView.as_view()(req_sr)
assert res_sr.status_code == 200
sr_count = res_sr.data.get('count', len(res_sr.data))
print(f"[PASS] Service Requests API 200 OK: {sr_count} active service requests across departments")

print("="*60)
print("ALL TESTS PASSED WITH 100% SUCCESS!")
print("="*60)
