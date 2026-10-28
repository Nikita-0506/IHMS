import re
import hashlib
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# Standard Reference Ranges for Clinical Validation
REFERENCE_RANGES = {
    'hemoglobin': {'min': 12.0, 'max': 17.5, 'unit': 'g/dL', 'name': 'Hemoglobin'},
    'wbc': {'min': 4000, 'max': 11000, 'unit': '/cumm', 'name': 'WBC Count'},
    'rbc': {'min': 4.0, 'max': 6.0, 'unit': 'million/cumm', 'name': 'RBC Count'},
    'platelets': {'min': 150000, 'max': 450000, 'unit': '/cumm', 'name': 'Platelet Count'},
    'creatinine': {'min': 0.6, 'max': 1.2, 'unit': 'mg/dL', 'name': 'Serum Creatinine'},
    'blood_urea': {'min': 15, 'max': 40, 'unit': 'mg/dL', 'name': 'Blood Urea Nitrogen'},
    'fasting_sugar': {'min': 70, 'max': 100, 'unit': 'mg/dL', 'name': 'Fasting Blood Sugar'},
    'postprandial_sugar': {'min': 90, 'max': 140, 'unit': 'mg/dL', 'name': 'Postprandial Sugar'},
    'total_bilirubin': {'min': 0.2, 'max': 1.2, 'unit': 'mg/dL', 'name': 'Total Bilirubin'},
    'sgpt_alt': {'min': 7, 'max': 56, 'unit': 'U/L', 'name': 'SGPT / ALT'},
    'sgot_ast': {'min': 10, 'max': 40, 'unit': 'U/L', 'name': 'SGOT / AST'},
    'crp': {'min': 0.0, 'max': 5.0, 'unit': 'mg/L', 'name': 'C-Reactive Protein (CRP)'},
    'esr': {'min': 0, 'max': 20, 'unit': 'mm/hr', 'name': 'ESR'},
    'sodium': {'min': 135, 'max': 145, 'unit': 'mEq/L', 'name': 'Serum Sodium'},
    'potassium': {'min': 3.5, 'max': 5.1, 'unit': 'mEq/L', 'name': 'Serum Potassium'},
    'spo2': {'min': 95, 'max': 100, 'unit': '%', 'name': 'Oxygen Saturation (SpO2)'},
}

COMMON_MEDICATIONS = [
    'paracetamol', 'amoxicillin', 'azithromycin', 'ciprofloxacin', 'cefixime',
    'metformin', 'glimepiride', 'telmisartan', 'amlodipine', 'atorvastatin',
    'pantoprazole', 'omeprazole', 'cetirizine', 'montelukast', 'salbutamol',
    'ibuprofen', 'tramadol', 'ondansetron', 'ceftriaxone', 'dextrose', 'normal saline',
    'ors', 'zinc sulfate', 'insulin', 'heparin', 'aspirin', 'clopidogrel'
]


def extract_raw_text(file_obj, filename: str) -> str:
    """Extract raw text from uploaded document (PDF or image)."""
    filename_lower = filename.lower()
    
    # Try text reading if plain text
    if filename_lower.endswith('.txt'):
        try:
            return file_obj.read().decode('utf-8', errors='ignore')
        except Exception:
            return ""

    # PDF extraction
    if filename_lower.endswith('.pdf'):
        try:
            import pypdf
            reader = pypdf.PdfReader(file_obj)
            extracted = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted.append(text)
            if extracted:
                return "\n".join(extracted)
        except Exception as e:
            logger.warning(f"pypdf extraction failed or not installed: {e}")

    # Image extraction with pytesseract if available
    if any(filename_lower.endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.webp', '.tiff']):
        try:
            from PIL import Image
            import pytesseract
            img = Image.open(file_obj)
            return pytesseract.image_to_string(img)
        except Exception as e:
            logger.warning(f"pytesseract extraction unavailable: {e}")

    # If stream read was consumed, attempt fallback text extraction
    try:
        file_obj.seek(0)
        raw_bytes = file_obj.read()
        # Extract ASCII strings
        text_matches = re.findall(rb'[A-Za-z0-9\s\.\,\:\;\-\_\/\%\(\)]{4,}', raw_bytes)
        decoded = [m.decode('ascii', errors='ignore') for m in text_matches]
        if decoded:
            return "\n".join(decoded)
    except Exception:
        pass

    return ""


def calculate_document_checksum(content: bytes) -> str:
    """Compute sha256 checksum to detect duplicate documents."""
    return hashlib.sha256(content).hexdigest()


def parse_lab_tests(text: str) -> List[Dict[str, Any]]:
    """Extract test names, results, units, and reference ranges."""
    results = []
    lines = text.splitlines()

    for line in lines:
        cleaned = line.strip()
        if not cleaned:
            continue

        for test_key, ref_info in REFERENCE_RANGES.items():
            pattern = re.compile(rf'(?i)\b({re.escape(ref_info["name"])}|{re.escape(test_key)})\b[:\s\-]*([0-9]+(?:\.[0-9]+)?)')
            match = pattern.search(cleaned)
            if match:
                val_str = match.group(2)
                try:
                    val = float(val_str)
                    is_abnormal = val < ref_info['min'] or val > ref_info['max']
                    is_critical = val < (ref_info['min'] * 0.7) or val > (ref_info['max'] * 1.5)
                    results.append({
                        'test_key': test_key,
                        'test_name': ref_info['name'],
                        'result_value': val,
                        'unit': ref_info['unit'],
                        'reference_range': f"{ref_info['min']} - {ref_info['max']} {ref_info['unit']}",
                        'is_abnormal': is_abnormal,
                        'is_critical': is_critical,
                        'status': 'Critical Alert' if is_critical else ('Abnormal' if is_abnormal else 'Normal'),
                        'confidence': 0.94,
                    })
                except ValueError:
                    continue

    # Deduplicate by test_key keeping latest
    deduped = {}
    for item in results:
        deduped[item['test_key']] = item
    return list(deduped.values())


def parse_medications(text: str) -> List[Dict[str, Any]]:
    """Extract medication names, dosages, and frequency."""
    medications = []
    lines = text.splitlines()

    for line in lines:
        cleaned = line.strip()
        for med in COMMON_MEDICATIONS:
            if re.search(rf'(?i)\b{re.escape(med)}\b', cleaned):
                # Search for dosage like 500mg, 10ml, 1 tablet
                dosage_match = re.search(r'([0-9]+\s*(?:mg|ml|mcg|gm|tablet|cap|puff))', cleaned, re.IGNORECASE)
                dosage = dosage_match.group(1) if dosage_match else 'As directed'

                # Search for frequency like BD, TDS, OD, twice daily, every 8 hours
                freq_match = re.search(r'\b(OD|BD|TDS|QID|SOS|HS|STAT|once daily|twice daily|thrice daily)\b', cleaned, re.IGNORECASE)
                frequency = freq_match.group(1).upper() if freq_match else 'Once daily'

                # Assess clarity
                is_unclear = '?' in cleaned or len(cleaned) < 5
                medications.append({
                    'medicine_name': med.title(),
                    'dosage': dosage,
                    'frequency': frequency,
                    'raw_line': cleaned,
                    'is_unclear': is_unclear,
                    'confidence': 0.70 if is_unclear else 0.92,
                })

    # Deduplicate medications
    seen = set()
    unique_meds = []
    for m in medications:
        key = m['medicine_name'].lower()
        if key not in seen:
            seen.add(key)
            unique_meds.append(m)
    return unique_meds


def parse_metadata_fields(text: str) -> Dict[str, Any]:
    """Extract patient ID, dates, doctor, hospital from document text."""
    metadata = {
        'patient_id_extracted': None,
        'patient_name_extracted': None,
        'document_date_extracted': None,
        'referring_doctor': None,
        'referring_hospital': None,
    }

    # Patient ID pattern like P-10245, PID-1234, MRN-4567
    pid_match = re.search(r'\b(P-\d+|PID-\d+|MRN-\d+|PAT-\d+)\b', text, re.IGNORECASE)
    if pid_match:
        metadata['patient_id_extracted'] = pid_match.group(1).upper()

    # Patient Name pattern like Patient Name: Rahul Patil
    name_match = re.search(r'(?i)patient\s*(?:name)?[:\s\-]+([A-Za-z\s]{3,30})', text)
    if name_match:
        candidate_name = name_match.group(1).strip()
        if candidate_name.lower() not in ['id', 'age', 'gender', 'male', 'female']:
            metadata['patient_name_extracted'] = candidate_name.title()

    # Date pattern like DD/MM/YYYY or YYYY-MM-DD
    date_match = re.search(r'\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b', text)
    if date_match:
        metadata['document_date_extracted'] = date_match.group(1)

    # Referring Doctor pattern like Dr. Anil Deshmukh or Ref by: Dr. ...
    doc_match = re.search(r'(?i)(?:ref(?:erred)?\s*(?:by|to)|doctor|physician)[:\s\-]+(Dr\.?\s+[A-Za-z\s]{3,30})', text)
    if doc_match:
        metadata['referring_doctor'] = doc_match.group(1).strip()

    # Referring Hospital pattern
    hosp_match = re.search(r'(?i)(?:hospital|clinic|center|centre)[:\s\-]+([A-Za-z\s]{3,40}(?:Hospital|Clinic|Care|Medical))', text)
    if hosp_match:
        metadata['referring_hospital'] = hosp_match.group(1).strip()

    return metadata


def process_ocr_pipeline(raw_text: str, document_type: str = 'lab_report', registered_patient=None) -> Dict[str, Any]:
    """
    Complete OCR Verification Pipeline:
    1. Text extraction & parsing
    2. Lab tests & reference ranges interpretation
    3. Medication extraction with dosage & frequency
    4. Identity matching with registered patient
    5. Unit & anomaly validation
    6. Conflict flagging
    """
    metadata = parse_metadata_fields(raw_text)
    tests = parse_lab_tests(raw_text)
    medications = parse_medications(raw_text)

    # Missing fields assessment
    missing_fields = []
    if not metadata['document_date_extracted']:
        missing_fields.append("Document Date missing or unreadable")
    if not metadata['patient_id_extracted'] and not metadata['patient_name_extracted']:
        missing_fields.append("Patient identifier not detected in document header")

    # Conflict and verification flags
    flags = []
    confidence_penalties = 0.0

    # 1. Identity match check
    if registered_patient:
        extracted_pid = metadata['patient_id_extracted']
        if extracted_pid and extracted_pid != registered_patient.patient_id:
            flags.append(f"Patient ID mismatch: Document has {extracted_pid}, active patient is {registered_patient.patient_id}")
            confidence_penalties += 0.20

    # 2. Medication clarity check
    for med in medications:
        if med['is_unclear']:
            flags.append(f"Unclear prescription name or dosage for: {med['medicine_name']}")
            confidence_penalties += 0.10

    # 3. Abnormal lab value flags
    abnormal_tests = [t for t in tests if t['is_abnormal']]
    for t in abnormal_tests:
        if t['is_critical']:
            flags.append(f"CRITICAL TEST ALERT: {t['test_name']} is {t['result_value']} {t['unit']} (Ref: {t['reference_range']})")
        else:
            flags.append(f"Abnormal test: {t['test_name']} is {t['result_value']} {t['unit']}")

    # 4. Overall extraction confidence
    base_confidence = 0.92
    if not tests and not medications:
        base_confidence = 0.65
        flags.append("No structured clinical tests or medications parsed from text")

    overall_confidence = max(0.40, min(0.99, round(base_confidence - confidence_penalties, 2)))

    # Verification status suggestion
    verification_status = 'pending_verification'
    if any('mismatch' in f.lower() or 'unclear' in f.lower() for f in flags):
        verification_status = 'flagged_conflict'
    elif overall_confidence >= 0.88 and not flags:
        verification_status = 'verified'

    return {
        'metadata': metadata,
        'tests': tests,
        'medications': medications,
        'flags': flags,
        'missing_fields': missing_fields,
        'abnormal_count': len(abnormal_tests),
        'total_tests_extracted': len(tests),
        'total_meds_extracted': len(medications),
        'ocr_confidence': overall_confidence,
        'verification_status': verification_status,
        'parsed_at': datetime.now().isoformat(),
        'requires_doctor_review': True,
    }


class ClinicalDocumentOCRScanner:
    """Convenience class interface for OCR extraction and pipeline processing."""

    @staticmethod
    def process_pipeline(raw_text: str, document_type: str = 'lab_report', registered_patient=None) -> Dict[str, Any]:
        return process_ocr_pipeline(raw_text, document_type, registered_patient)

    @staticmethod
    def extract_text(file_obj, filename: str) -> str:
        return extract_raw_text(file_obj, filename)

    @staticmethod
    def hash_content(text: str) -> str:
        return calculate_content_hash(text)
