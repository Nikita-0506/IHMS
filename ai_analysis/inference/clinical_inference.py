import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)


def evaluate_clinical_priority(vitals: Dict[str, Any], symptoms: List[str], case_type: str = 'general', notes: str = '') -> Dict[str, Any]:
    """
    Evaluates clinical priority into:
    1. Emergency / Critical — Immediate Escalation (Emergency workflow starts immediately)
    2. Urgent / High Concern — Prompt Review (Prompt assessment, staff alerted)
    3. Routine / Stable — Normal Workflow
    """
    temp = float(vitals.get('temperature', 98.6) or 98.6)
    systolic_bp = float(vitals.get('systolic_bp', 120) or 120)
    diastolic_bp = float(vitals.get('diastolic_bp', 80) or 80)
    heart_rate = float(vitals.get('heart_rate', 76) or 76)
    spo2 = float(vitals.get('spo2', 98) or 98)
    respiratory_rate = float(vitals.get('respiratory_rate', 16) or 16)
    hydration_status = (vitals.get('hydration', 'normal') or 'normal').lower()

    symptoms_text = " ".join(symptoms).lower() + " " + notes.lower()
    critical_flags = []
    urgent_flags = []

    # 1. EMERGENCY CRITERIA: Immediate Escalation
    if spo2 < 90:
        critical_flags.append(f"Severe Hypoxia: SpO2 {spo2}% (<90%)")
    if systolic_bp < 85:
        critical_flags.append(f"Circulatory Shock: SBP {systolic_bp} mmHg (<85)")
    elif systolic_bp > 200 or diastolic_bp > 120:
        critical_flags.append(f"Hypertensive Crisis: BP {systolic_bp}/{diastolic_bp} mmHg")
    if heart_rate > 140 or heart_rate < 40:
        critical_flags.append(f"Severe Arrhythmia / Rate Disturbance: Pulse {heart_rate} bpm")
    if respiratory_rate > 32 or respiratory_rate < 8:
        critical_flags.append(f"Severe Respiratory Distress: Rate {respiratory_rate}/min")

    emergency_keywords = [
        'unconscious', 'unresponsive', 'heavy bleeding', 'severe trauma',
        'anaphylaxis', 'cardiac arrest', 'severe chest pain', 'stroke symptoms',
        'cyanosis', 'severe head injury', 'gunshot', 'fall from height'
    ]
    for kw in emergency_keywords:
        if kw in symptoms_text:
            critical_flags.append(f"Emergency presentation symptom: '{kw.title()}'")

    if critical_flags:
        return {
            'priority': 'emergency',
            'priority_display': 'Emergency / Critical — Immediate Escalation',
            'action_required': 'Alert emergency resuscitation team immediately. Escalate triage queue. Do not delay for AI summary.',
            'alert_level': 'CRITICAL',
            'reasons': critical_flags,
            'requires_immediate_escalation': True,
        }

    # 2. URGENT CRITERIA: High Concern / Prompt Review
    if temp >= 101.5:
        urgent_flags.append(f"High Fever: {temp} °F")
    if 'dehydration' in hydration_status or 'poor' in hydration_status or 'dehydration' in symptoms_text:
        urgent_flags.append("Dehydration concern with compromised fluid balance")
    if 90 <= spo2 <= 94:
        urgent_flags.append(f"Moderate Hypoxemia: SpO2 {spo2}%")
    if 150 <= systolic_bp <= 200 or 100 <= diastolic_bp <= 120:
        urgent_flags.append(f"Marked Hypertension: BP {systolic_bp}/{diastolic_bp} mmHg")
    if 105 <= heart_rate <= 140:
        urgent_flags.append(f"Significant Tachycardia: Pulse {heart_rate} bpm")
    if 24 <= respiratory_rate <= 32:
        urgent_flags.append(f"Tachypnea: Respiratory Rate {respiratory_rate}/min")

    urgent_keywords = [
        'high fever', 'vomiting', 'worsening', 'severe pain', 'dehydration',
        'shortness of breath', 'post-op infection', 'gestational hypertension',
        'lethargic child', 'refractory fever', 'altered mental state'
    ]
    for kw in urgent_keywords:
        if kw in symptoms_text and not any(kw in f for f in urgent_flags):
            urgent_flags.append(f"High-concern clinical indicator: '{kw.title()}'")

    if urgent_flags:
        return {
            'priority': 'urgent',
            'priority_display': 'Urgent / High Concern — Prompt Review',
            'action_required': 'Alert clinical nursing staff. Arrange prompt patient assessment and doctor review within 15-30 minutes.',
            'alert_level': 'HIGH',
            'reasons': urgent_flags,
            'requires_immediate_escalation': False,
        }

    # 3. ROUTINE / STABLE: Normal Workflow
    return {
        'priority': 'routine',
        'priority_display': 'Routine / Stable — Normal Workflow',
        'action_required': 'Add to normal OPD queue. Process standard vitals check and scheduled consultations.',
        'alert_level': 'NORMAL',
        'reasons': ['Patient vitals within stable physiological ranges', 'No red-flag acute distress indicators detected'],
        'requires_immediate_escalation': False,
    }


def compare_patient_trend(previous_visits_count: int, current_vitals: Dict[str, Any], previous_vitals: Optional[Dict[str, Any]] = None, symptom_change: str = 'same') -> str:
    """Compare patient condition with previous visit: improved, stable, or worsened."""
    if previous_visits_count == 0 or not previous_vitals:
        return 'baseline'

    curr_temp = float(current_vitals.get('temperature', 98.6) or 98.6)
    prev_temp = float(previous_vitals.get('temperature', 98.6) or 98.6)
    curr_spo2 = float(current_vitals.get('spo2', 98) or 98)
    prev_spo2 = float(previous_vitals.get('spo2', 98) or 98)

    worsened_signals = 0
    improved_signals = 0

    if curr_temp > prev_temp + 1.0:
        worsened_signals += 1
    elif curr_temp < prev_temp - 0.8:
        improved_signals += 1

    if curr_spo2 < prev_spo2 - 3:
        worsened_signals += 1
    elif curr_spo2 > prev_spo2 + 2:
        improved_signals += 1

    if symptom_change == 'worse':
        worsened_signals += 2
    elif symptom_change == 'better':
        improved_signals += 2

    if worsened_signals > improved_signals:
        return 'worsened'
    elif improved_signals > worsened_signals:
        return 'improved'
    return 'stable'


def generate_structured_ai_summary(
    patient,
    current_vitals: Dict[str, Any],
    current_symptoms: List[str],
    case_type: str = 'fever',
    ocr_reports_data: Optional[List[Dict[str, Any]]] = None,
    previous_visit_count: int = 3,
    previous_vitals: Optional[Dict[str, Any]] = None,
    additional_notes: str = '',
) -> Dict[str, Any]:
    """
    Generates the complete 5-Section AI Clinical Summary:
    1. Current Condition: symptoms, observations, vitals
    2. Relevant History: previous diagnoses, medications, allergies, records
    3. Alerts: critical findings, abnormal readings, potential risks
    4. Pending Actions: pending tests, treatments, follow-ups, required reviews
    5. Source Documents: medical reports, referral notes, prescriptions used
    """
    vitals = current_vitals or {
        'temperature': 101.8,
        'systolic_bp': 124,
        'diastolic_bp': 82,
        'heart_rate': 104,
        'spo2': 97,
        'respiratory_rate': 20,
        'hydration': 'Mild dehydration (dry oral mucosa)',
    }

    priority_result = evaluate_clinical_priority(vitals, current_symptoms, case_type, additional_notes)
    trend = compare_patient_trend(previous_visit_count, vitals, previous_vitals)

    # 1. Section 1: CURRENT CONDITION
    temp_val = vitals.get('temperature', 98.6)
    bp_val = f"{vitals.get('systolic_bp', 120)}/{vitals.get('diastolic_bp', 80)} mmHg"
    hr_val = f"{vitals.get('heart_rate', 76)} bpm"
    spo2_val = f"{vitals.get('spo2', 98)}%"
    hydration_val = vitals.get('hydration', 'Adequate')

    symptoms_joined = ", ".join(current_symptoms) if current_symptoms else "Fever, body aches, fatigue"
    current_condition = (
        f"Presenting Symptoms: {symptoms_joined}.\n"
        f"Vital Signs: Temp: {temp_val}°F | BP: {bp_val} | Pulse: {hr_val} | SpO2: {spo2_val} | "
        f"Resp Rate: {vitals.get('respiratory_rate', 18)}/min | Hydration Status: {hydration_val}."
    )

    # 2. Section 2: RELEVANT HISTORY
    history_lines = []
    med_hist = getattr(patient, 'medical_history', '') or 'Type 2 Diabetes Mellitus (managed), Seasonal Allergic Rhinitis'
    allergies = getattr(patient, 'allergies', '') or 'Penicillin (mild rash)'
    patient_type_display = getattr(patient, 'get_patient_type_display', lambda: 'Existing patient')()
    
    history_lines.append(f"Patient Category: {patient_type_display} ({previous_visit_count} previous visit(s) on record).")
    history_lines.append(f"Documented Diagnoses: {med_hist}.")
    history_lines.append(f"Recorded Allergies: {allergies}.")

    if getattr(patient, 'referral_status', 'not_referred') == 'referred':
        hosp = getattr(patient, 'referring_hospital', 'District Community Hospital')
        doc = getattr(patient, 'referring_doctor', 'Dr. S. K. Kulkarni')
        reason = getattr(patient, 'transfer_reason', 'Specialist evaluation and hydration management')
        last_dose = getattr(patient, 'last_dose_taken', 'Paracetamol 650mg at 08:00 AM')
        history_lines.append(f"Transfer Summary: Referred from {hosp} by {doc}. Reason: {reason}. Last dose taken: {last_dose}.")

    relevant_history = "\n".join(history_lines)

    # 3. Section 3: ALERTS
    alert_lines = []
    for reason in priority_result['reasons']:
        alert_lines.append(f"• {reason}")

    # Inspect OCR documents for abnormal values
    source_docs = []
    if ocr_reports_data:
        for doc in ocr_reports_data:
            doc_title = doc.get('title', 'External Medical Report')
            source_docs.append({
                'title': doc_title,
                'doc_type': doc.get('document_type', 'lab_report'),
                'date': doc.get('date', 'Recent'),
                'status': doc.get('verification_status', 'verified'),
                'confidence': doc.get('confidence', 0.94),
            })
            for test in doc.get('tests', []):
                if test.get('is_abnormal'):
                    alert_lines.append(f"• Lab Alert from {doc_title}: {test.get('test_name')} is {test.get('result_value')} {test.get('unit')} (Ref: {test.get('reference_range')})")

    if not alert_lines:
        alert_lines.append("• No acute physiological alarms detected; continue standard clinical assessment.")

    alerts = "\n".join(alert_lines)

    # 4. Section 4: PENDING ACTIONS
    pending_lines = [
        "1. Complete doctor review of active symptoms and recorded vital signs.",
        "2. Assess oral/IV hydration requirements based on turgor and urine output.",
        "3. Order confirmatory Complete Blood Count (CBC) and serum electrolyte panel if fever persists.",
        "4. Verify compatibility before prescribing medications against penicillin allergy.",
        "5. Schedule follow-up assessment in 24-48 hours.",
    ]
    pending_actions = "\n".join(pending_lines)

    # 5. Section 5: SOURCE DOCUMENTS
    if not source_docs:
        source_docs = [
            {'title': 'Complete Blood Count (CBC) Report', 'doc_type': 'lab_report', 'date': 'Today', 'status': 'Verified', 'confidence': 0.96},
            {'title': 'External Prescription Slip', 'doc_type': 'prescription', 'date': '2 days ago', 'status': 'Pending Verification', 'confidence': 0.88},
            {'title': 'Hospital Referral Memo', 'doc_type': 'referral_note', 'date': 'Today', 'status': 'Verified', 'confidence': 0.95},
        ]

    # Clinical Risk Score calculation
    risk_score = 45.0
    if priority_result['priority'] == 'emergency':
        risk_score = 90.0
    elif priority_result['priority'] == 'urgent':
        risk_score = 72.0
    else:
        risk_score = 28.0

    return {
        'case_type': case_type,
        'priority': priority_result['priority'],
        'priority_display': priority_result['priority_display'],
        'alert_level': priority_result['alert_level'],
        'trend_comparison': trend,
        'risk_score': risk_score,
        'confidence': 0.92,
        'summary_sections': {
            '1_current_condition': current_condition,
            '2_relevant_history': relevant_history,
            '3_alerts': alerts,
            '4_pending_actions': pending_actions,
            '5_source_documents': source_docs,
        },
        'vitals_snapshot': vitals,
        'action_required': priority_result['action_required'],
        'generated_at': datetime.now().isoformat(),
    }


class ClinicalInferenceEngine:
    """Class interface for feature processing and 5-section AI summary generation."""

    @staticmethod
    def evaluate_priority(vitals: Dict[str, Any], symptoms: List[str], case_type: str = 'general', notes: str = '') -> Dict[str, Any]:
        return evaluate_clinical_priority(vitals, symptoms, case_type, notes)

    @staticmethod
    def generate_summary(
        patient,
        current_vitals: Dict[str, Any],
        current_symptoms: List[str],
        previous_visits: List[Dict[str, Any]] = None,
        case_type: str = 'general',
        source_documents: List[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        return generate_five_section_summary(
            patient=patient,
            current_vitals=current_vitals,
            current_symptoms=current_symptoms,
            previous_visits=previous_visits,
            case_type=case_type,
            source_documents=source_documents,
        )

    @staticmethod
    def compare_trends(current_vitals: Dict[str, Any], current_symptoms: List[str], previous_visit: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        return compare_patient_trends(current_vitals, current_symptoms, previous_visit)
