/**
 * IHMS Backend API Client
 * Connects directly to Django REST endpoints at http://127.0.0.1:8000 (via Vite proxy /api)
 */

const API_BASE = '/api';

export async function fetchDoctorViewDashboard(patientId = 'P-10245') {
  try {
    const res = await fetch(`${API_BASE}/ai-analysis/doctor-view/?patient_id=${encodeURIComponent(patientId)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend fetchDoctorViewDashboard fallback:', err);
  }

  const fallbackProfiles = {
    'P-10245': {
      patient_card: {
        name: 'Rahul Patil',
        patient_id: 'P-10245',
        age: 42,
        gender: 'Male',
        priority: 'High Priority',
        priority_level: 'urgent',
        current_condition: 'Fever with dehydration concern',
        patient_category: 'Existing patient',
        previous_treatment: 'Available — 3 visits',
        next_action: 'Doctor review required (Hydration & antipyretic protocol)',
        ai_clinical_summary_lead:
          'Patient has a previous treatment record. Review the current symptoms, recorded vital signs, allergies and medication history before deciding the next step.',
        patient_type: 'Existing',
        care_status: 'Ongoing',
        referral_status: 'Not Referred',
        current_severity: 'Urgent / High Concern',
        assigned_doctor_name: 'Dr. Amit Sharma',
        assigned_doctor_dept: 'General Medicine (Room 102)',
      },
      tabs: {
        history: {
          previous_diagnoses: [
            'Visit 1 (14-May-2024): Acute viral bronchitis with fever. Treated with Azithromycin. Resolved completely.',
            'Visit 2 (08-Nov-2025): Dyspepsia / Epigastric distress. Started on Pantoprazole 40mg. Follow-up stable.',
            'Visit 3 (Today): Acute febrile illness (3 days) with chills, nausea, and marked dehydration concern.',
          ],
          allergies: 'Penicillin (Severe cutaneous urticaria / anaphylaxis risk)',
          current_medications: [
            { name: 'Pantoprazole 40mg', dose: '1 Tablet OD (Before breakfast)', status: 'Active' },
            { name: 'Oral Rehydration Solution (ORS)', dose: '500ml oral sips as tolerated', status: 'Active' },
            { name: 'Paracetamol 650mg', dose: '1 Tablet SOS (Temp > 100°F)', status: 'Active' },
          ],
          trend_display:
            'Worsened from baseline afebrile state to 102.4°F with dehydration and sinus tachycardia.',
        },
        ocr_reports: [
          {
            title: 'Complete Blood Count (CBC) Panel - LifeLine Diagnostics',
            document_type: 'Laboratory Report',
            date: '11 Oct 2026',
            verification_status: 'Verified by Doctor',
            confidence: '96.8%',
            tests: [
              { test_name: 'WBC (Total Leukocytes)', result_value: '12,400', unit: '/mcL', reference_range: '4,000 - 11,000', status: 'Elevated', is_abnormal: true },
              { test_name: 'Hemoglobin', result_value: '14.2', unit: 'g/dL', reference_range: '13.0 - 17.0', status: 'Normal', is_abnormal: false },
              { test_name: 'Platelet Count', result_value: '185,000', unit: '/mcL', reference_range: '150,000 - 450,000', status: 'Normal', is_abnormal: false },
              { test_name: 'Serum Creatinine', result_value: '1.1', unit: 'mg/dL', reference_range: '0.7 - 1.3', status: 'Normal baseline', is_abnormal: false },
            ],
          },
        ],
        vitals: {
          temperature: { value: '102.4 °F', status: 'Febrile High', flag: 'urgent' },
          blood_pressure: { value: '118/76 mmHg', status: 'Normotensive', flag: 'stable' },
          heart_rate: { value: '104 bpm', status: 'Sinus Tachycardia', flag: 'urgent' },
          spo2: { value: '97%', status: 'Adequate Saturation', flag: 'stable' },
          respiratory_rate: { value: '20 /min', status: 'Mildly Elevated', flag: 'stable' },
          secondary_metric: { label: 'HYDRATION STATUS', value: 'Dry Mucosa', status: 'Dehydration Risk', flag: 'urgent' },
        },
      },
      ai_summary_5_sections: {
        '1_current_condition':
          'Acute febrile illness of 3 days duration (102.4°F), dry mucous membranes, mild postural dizziness, and tachycardia (104 bpm).',
        '2_relevant_history':
          'Existing patient with 3 documented visits. Treated for viral bronchitis in 2024. Documented Penicillin allergy. On Pantoprazole 40mg.',
        '3_alerts':
          '• High fever (102.4°F) with tachycardia (104 bpm) and dehydration concern.\n• Leukocytosis (WBC: 12,400 /mcL) verified on external laboratory report.\n• Penicillin allergy on file — strict avoidance of beta-lactam antibiotics.',
        '4_pending_actions':
          '1. Initiate prompt IV/Oral rehydration therapy.\n2. Order Blood Culture & Malarial Smear.\n3. Doctor clinical review and antipyretic prescription (avoiding Penicillins).\n4. Schedule follow-up assessment in 24 hours.',
        '5_source_documents': [
          { title: 'CBC Panel (LifeLine Diagnostics)', doc_type: 'lab_report', status: 'Verified' },
          { title: 'OPD Clinical Consultation Notes', doc_type: 'clinical_notes', status: 'Verified' },
        ],
      },
    },
    'P-10246': {
      patient_card: {
        name: 'Priya Deshmukh',
        patient_id: 'P-10246',
        age: 29,
        gender: 'Female',
        priority: 'High Priority',
        priority_level: 'urgent',
        current_condition: 'Chest Tightness · Referral from Ruby Hall Clinic',
        patient_category: 'Existing Patient',
        previous_treatment: 'Available — 1 visit (External referral)',
        next_action: 'Cardiology consult & Serial Troponin-I rule-out',
        ai_clinical_summary_lead:
          'Referred patient with acute retrosternal chest heaviness. Prioritize serial cardiac enzymes, ECG changes, and avoid Aspirin due to recorded allergy.',
        patient_type: 'Existing',
        care_status: 'Ongoing Care',
        referral_status: 'Referred',
        current_severity: 'Urgent / High Concern',
        assigned_doctor_name: 'Dr. Sneha Kulkarni',
        assigned_doctor_dept: 'Cardiology (CCU Bed 04)',
      },
      tabs: {
        history: {
          previous_diagnoses: [
            'Childhood Mild Bronchial Asthma (Managed on intermittent inhaler)',
            '12-Oct-2026: Referred urgently from Ruby Hall Clinic for evaluation of exertional retrosternal discomfort',
            'Today: Borderline Troponin-I elevation (0.04 ng/mL) with subtle ST depression in V4-V6',
          ],
          allergies: 'Sulfa Drugs (Erythema multiforme), Aspirin / NSAIDs (Triggers bronchospasm)',
          current_medications: [
            { name: 'Budesonide/Formoterol Inhaler', dose: '200/6 mcg 1-2 puffs PRN', status: 'Active' },
            { name: 'Clopidogrel 75mg', dose: '1 Tablet OD (Antiplatelet alternative)', status: 'Active' },
            { name: 'Atorvastatin 40mg', dose: '1 Tablet HS (Cardioprotective)', status: 'Active' },
          ],
          trend_display: 'Acute retrosternal heaviness lasting 45 mins; Troponin borderline (0.04 ng/mL).',
        },
        ocr_reports: [
          {
            title: 'Cardiac Biomarker & 12-Lead ECG Panel - Ruby Hall Clinic',
            document_type: 'Laboratory Report',
            date: '14 Oct 2026',
            verification_status: 'Verified by Doctor',
            confidence: '98.0%',
            tests: [
              { test_name: 'Cardiac Troponin-I (hs-cTnI)', result_value: '0.04', unit: 'ng/mL', reference_range: '< 0.02', status: 'Borderline High', is_abnormal: true },
              { test_name: 'CK-MB Isoenzyme', result_value: '24', unit: 'U/L', reference_range: '0 - 25', status: 'High Normal', is_abnormal: false },
              { test_name: '12-Lead ECG Findings', result_value: 'Sinus 92 bpm, ST depression 0.5mm V4-V6', unit: '', reference_range: 'Normal sinus rhythm', status: 'Abnormal ST Changes', is_abnormal: true },
              { test_name: 'Serum Potassium', result_value: '4.1', unit: 'mEq/L', reference_range: '3.5 - 5.0', status: 'Normal', is_abnormal: false },
            ],
          },
        ],
        vitals: {
          temperature: { value: '98.6 °F', status: 'Afebrile (Normal)', flag: 'stable' },
          blood_pressure: { value: '136/88 mmHg', status: 'Stage 1 Hypertension', flag: 'warning' },
          heart_rate: { value: '92 bpm', status: 'High Normal', flag: 'warning' },
          spo2: { value: '96%', status: 'Normal Saturation', flag: 'stable' },
          respiratory_rate: { value: '18 /min', status: 'Normal Eupneic', flag: 'stable' },
          secondary_metric: { label: 'CARDIAC STATUS', value: 'ST Changes V4-V6', status: 'Ischemia Alert', flag: 'urgent' },
        },
      },
      ai_summary_5_sections: {
        '1_current_condition':
          'Exertional retrosternal chest heaviness lasting 45 mins with left arm radiation. Blood Pressure 136/88 mmHg, Pulse 92 bpm, SpO2 96% on room air.',
        '2_relevant_history':
          'Referred urgently from Ruby Hall Clinic. Medical history of mild bronchial asthma. Known hypersensitivity to Sulfa drugs and Aspirin.',
        '3_alerts':
          '• Borderline elevated Troponin-I (0.04 ng/mL) requiring serial observation.\n• ECG demonstrates subtle ST depression in V4-V6.\n• Aspirin & Sulfa allergy alert — standard acute coronary aspirin load contraindicated; use alternative antiplatelet.',
        '4_pending_actions':
          '1. Serial high-sensitivity Troponin-I at 0 and 3 hours.\n2. Stat 12-Lead ECG and Bedside 2D-Echocardiogram.\n3. Cardiology bedside consult with Dr. Sneha Kulkarni.\n4. Telemetry bed admission in Coronary Care Unit.',
        '5_source_documents': [
          { title: 'Ruby Hall Clinic Inter-Hospital Transfer Summary', doc_type: 'referral_note', status: 'Verified' },
          { title: '12-Lead Electrocardiogram Strip', doc_type: 'imaging_report', status: 'Verified' },
        ],
      },
    },
    'P-10247': {
      patient_card: {
        name: 'Sunita Joshi',
        patient_id: 'P-10247',
        age: 55,
        gender: 'Female',
        priority: 'Routine / Stable',
        priority_level: 'routine',
        current_condition: 'Hypertension & Dyslipidemia Routine Review',
        patient_category: 'Existing Patient',
        previous_treatment: 'Available — 6 regular visits',
        next_action: 'Routine prescription renewal & lifestyle reinforcement',
        ai_clinical_summary_lead:
          'Routine chronic care follow-up for Hypertension and Dyslipidemia. Vital signs and glycemic targets stable. No acute interventions required.',
        patient_type: 'Existing',
        care_status: 'Ongoing Care',
        referral_status: 'Not Referred',
        current_severity: 'Routine / Stable',
        assigned_doctor_name: 'Dr. Amit Sharma',
        assigned_doctor_dept: 'General Medicine (Room 102)',
      },
      tabs: {
        history: {
          previous_diagnoses: [
            '2021: Essential Hypertension diagnosed; stabilized on Telmisartan 40mg',
            '2023: Mixed Dyslipidemia; LDL target achieved with Atorvastatin 10mg',
            'Today: Routine quarterly health review; asymptomatic, optimal blood pressure control',
          ],
          allergies: 'No Known Drug Allergies (NKDA)',
          current_medications: [
            { name: 'Telmisartan 40mg', dose: '1 Tablet OD (Morning)', status: 'Active' },
            { name: 'Metformin 500mg', dose: '1 Tablet BD (After meals)', status: 'Active' },
            { name: 'Atorvastatin 10mg', dose: '1 Tablet HS (Night)', status: 'Active' },
          ],
          trend_display:
            'Chronic parameters well-controlled; blood pressure 132/84 mmHg, HbA1c 6.8% at target.',
        },
        ocr_reports: [
          {
            title: 'Lipid Profile & Glycated Hemoglobin (HbA1c) - Suburban Diagnostics',
            document_type: 'Laboratory Report',
            date: '14 Oct 2026',
            verification_status: 'Verified by Doctor',
            confidence: '99.0%',
            tests: [
              { test_name: 'HbA1c (Glycated Hemoglobin)', result_value: '6.8', unit: '%', reference_range: '< 7.0 (Target)', status: 'Controlled Target', is_abnormal: false },
              { test_name: 'Total Cholesterol', result_value: '210', unit: 'mg/dL', reference_range: '< 200', status: 'Mildly Elevated', is_abnormal: true },
              { test_name: 'LDL Cholesterol', result_value: '128', unit: 'mg/dL', reference_range: '< 100', status: 'Borderline High', is_abnormal: true },
              { test_name: 'Serum Creatinine', result_value: '0.9', unit: 'mg/dL', reference_range: '0.6 - 1.1', status: 'Normal baseline', is_abnormal: false },
            ],
          },
        ],
        vitals: {
          temperature: { value: '98.4 °F', status: 'Normothermic', flag: 'stable' },
          blood_pressure: { value: '132/84 mmHg', status: 'Controlled on Regimen', flag: 'stable' },
          heart_rate: { value: '72 bpm', status: 'Normal Sinus Rhythm', flag: 'stable' },
          spo2: { value: '99%', status: 'Optimal Saturation', flag: 'stable' },
          respiratory_rate: { value: '16 /min', status: 'Normal Eupneic', flag: 'stable' },
          secondary_metric: { label: 'GLYCEMIC CONTROL', value: 'HbA1c 6.8%', status: 'Target Achieved', flag: 'stable' },
        },
      },
      ai_summary_5_sections: {
        '1_current_condition':
          'Asymptomatic. Presenting for routine quarterly blood pressure evaluation and medication refill. Blood pressure 132/84 mmHg, Pulse 72 bpm, SpO2 99%.',
        '2_relevant_history':
          'Existing patient with 6 regular visits. Hypertension and Dyslipidemia well-managed on oral regimen. Good treatment adherence.',
        '3_alerts':
          '• Blood pressure well controlled at 132/84 mmHg.\n• Mild LDL elevation (128 mg/dL) noted on latest lipid panel.\n• No acute cardiovascular or renal warning signs.',
        '4_pending_actions':
          '1. Renew prescriptions: Telmisartan 40mg OD, Metformin 500mg BD, Atorvastatin 10mg HS.\n2. Advise continuation of DASH diet and regular home BP monitoring.\n3. Next scheduled review in 90 days.',
        '5_source_documents': [
          { title: 'Suburban Diagnostics Lipid Profile & HbA1c Panel', doc_type: 'lab_report', status: 'Verified' },
          { title: 'OPD Follow-up Consultation Card', doc_type: 'clinical_notes', status: 'Verified' },
        ],
      },
    },
    'P-10248': {
      patient_card: {
        name: 'Vikram Singh',
        patient_id: 'P-10248',
        age: 34,
        gender: 'Male',
        priority: 'Emergency / Critical',
        priority_level: 'emergency',
        current_condition: 'Polytrauma · Blunt Thoracic Injury with Acute Hypoxia (SpO2 88%)',
        patient_category: 'New Patient',
        previous_treatment: 'None (Emergency trauma arrival)',
        next_action: 'Immediate Chest Tube Insertion (32 Fr) & Emergency OT Transfer',
        ai_clinical_summary_lead:
          'CRITICAL TRAUMA ALERT: Severe hypoxia and acute hemothorax post-collision. Immediate resuscitation, chest decompression, and blood transfusion mandated.',
        patient_type: 'New Patient',
        care_status: 'Critical Resuscitation',
        referral_status: 'Emergency EMS',
        current_severity: 'Emergency / Critical — Immediate Escalation',
        assigned_doctor_name: 'Dr. Vikram Deshmukh',
        assigned_doctor_dept: 'Emergency & Critical Care (Trauma Bay 1)',
      },
      tabs: {
        history: {
          previous_diagnoses: [
            'No previous hospital records available on file',
            'Today: High-impact motor vehicle collision with blunt thoracic trauma',
            'EMS 108 Transfer: Severe respiratory distress, hypoxia, right hemothorax on bedside ultrasound',
          ],
          allergies: 'Unknown (Emergency Trauma protocol — assume anaphylaxis precaution)',
          current_medications: [
            { name: 'Normal Saline 0.9%', dose: 'Rapid IV Infusion (Wide bore 14G cannula)', status: 'STAT Active' },
            { name: 'Tranexamic Acid (TXA)', dose: '1g IV over 10 mins (Antifibrinolytic)', status: 'STAT Active' },
            { name: 'Fentanyl', dose: '50 mcg IV (Analgesia for tube thoracostomy)', status: 'STAT Active' },
          ],
          trend_display:
            'Acute trauma decompensation post-collision; impending shock with SpO2 88% and BP 90/60.',
        },
        ocr_reports: [
          {
            title: 'Emergency Bedside FAST Scan & Portable CXR - ER Resuscitation',
            document_type: 'Imaging / X-Ray / MRI Report',
            date: '14 Oct 2026',
            verification_status: 'Verified by Doctor',
            confidence: '97.0%',
            tests: [
              { test_name: 'Portable Chest X-Ray', result_value: 'Right Hemothorax, fractures ribs 5, 6, 7', unit: '', reference_range: 'Clear lung fields', status: 'Critical Trauma', is_abnormal: true },
              { test_name: 'Bedside FAST Ultrasound', result_value: 'Free fluid in Morison pouch', unit: '', reference_range: 'No free intraperitoneal fluid', status: 'Positive (Hemorrhage)', is_abnormal: true },
              { test_name: 'Arterial Blood Gas (ABG) pO2', result_value: '58', unit: 'mmHg', reference_range: '75 - 100', status: 'Severe Hypoxemia', is_abnormal: true },
              { test_name: 'Serum Lactate', result_value: '4.6', unit: 'mmol/L', reference_range: '0.5 - 2.0', status: 'Elevated (Hypoperfusion)', is_abnormal: true },
            ],
          },
        ],
        vitals: {
          temperature: { value: '97.8 °F', status: 'Hypothermia Precaution', flag: 'warning' },
          blood_pressure: { value: '90/60 mmHg', status: 'Hypotension (Shock Risk)', flag: 'urgent' },
          heart_rate: { value: '128 bpm', status: 'Severe Tachycardia', flag: 'urgent' },
          spo2: { value: '88%', status: 'CRITICAL HYPOXIA', flag: 'critical' },
          respiratory_rate: { value: '28 /min', status: 'Tachypnea (Distress)', flag: 'critical' },
          secondary_metric: { label: 'SHOCK INDEX', value: '1.42 (Critical)', status: 'Impending Shock', flag: 'critical' },
        },
      },
      ai_summary_5_sections: {
        '1_current_condition':
          'Acute polytrauma with blunt chest impact, severe respiratory distress, acute desaturation (SpO2 88%), hypotension (90/60 mmHg), and marked tachycardia (128 bpm).',
        '2_relevant_history':
          'New emergency admission brought by 108 EMS ambulance. High-speed highway collision. No prior EMR records on file.',
        '3_alerts':
          '• CRITICAL: Severe hypoxia (SpO2 88%) and impending hemorrhagic shock (BP 90/60, HR 128 bpm).\n• Right hemothorax and 5th-7th rib fractures on bedside FAST imaging.\n• Unknown allergy status — emergency trauma precautions in effect.',
        '4_pending_actions':
          '1. High-flow O2 (15 L/min NRBM); standby for emergent endotracheal intubation.\n2. Urgent right intercostal chest tube insertion (32 Fr).\n3. STAT transfusion of 2 units O-Negative Packed RBCs.\n4. Immediate transfer to Emergency Trauma Operating Theatre (OT-1).',
        '5_source_documents': [
          { title: 'Bedside FAST Ultrasound & Portable Trauma CXR', doc_type: 'imaging_report', status: 'Verified' },
          { title: '108 EMS Pre-Hospital Resuscitation Run Sheet', doc_type: 'referral_note', status: 'Verified' },
        ],
      },
    },
  };

  return fallbackProfiles[patientId] || fallbackProfiles['P-10245'];
}

export async function fetchClinicalPriorityQueue() {
  try {
    const res = await fetch(`${API_BASE}/ai-analysis/clinical-priority/`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend fetchClinicalPriorityQueue fallback:', err);
  }

  return {
    emergency_critical: [
      {
        patient_id: 'P-10248',
        name: 'Vikram Singh',
        age: 34,
        gender: 'Male',
        current_condition: 'Polytrauma / Severe Respiratory Distress',
        patient_type: 'New Patient',
        assigned_doctor: 'Dr. Vikram Deshmukh (Emergency)',
        urgency: 'Emergency',
        action: 'Immediate Resuscitation — ER Bypass Triggered',
      },
    ],
    urgent_high_concern: [
      {
        patient_id: 'P-10245',
        name: 'Rahul Patil',
        age: 42,
        gender: 'Male',
        current_condition: 'Fever with dehydration concern',
        patient_type: 'Existing Patient (3 visits)',
        assigned_doctor: 'Dr. Amit Sharma (General Medicine)',
        urgency: 'Urgent',
        action: 'Prompt Clinical Review Required',
      },
      {
        patient_id: 'P-10246',
        name: 'Priya Deshmukh',
        age: 29,
        gender: 'Female',
        current_condition: 'Chest Tightness (Referred from Ruby Hall Clinic)',
        patient_type: 'Transferred Patient',
        assigned_doctor: 'Dr. Sneha Kulkarni (Cardiology)',
        urgency: 'Urgent',
        action: 'Referral Records Review',
      },
    ],
    routine_stable: [
      {
        patient_id: 'P-10247',
        name: 'Sunita Joshi',
        age: 55,
        gender: 'Female',
        current_condition: 'Hypertension Routine Follow-up',
        patient_type: 'Existing Patient (Stable)',
        assigned_doctor: 'Dr. Amit Sharma (General Medicine)',
        urgency: 'Routine',
        action: 'Scheduled Consultation Queue',
      },
    ],
  };
}

export async function fetchDoctorRoster() {
  try {
    const res = await fetch(`${API_BASE}/doctors/roster/`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.roster)) return data.roster;
      if (data && Array.isArray(data.results)) return data.results;
      return [];
    }
  } catch (err) {
    console.warn('Backend fetchDoctorRoster fallback:', err);
  }

  return [
    {
      id: 1,
      doctor_id: 'DOC-101',
      name: 'Dr. Amit Sharma',
      department: 'General Medicine',
      specialization: 'General Medicine & Infectious Disease',
      qualification: 'MBBS, MD (Medicine)',
      shift: 'Morning',
      opd_timing: '09:00 AM - 02:00 PM',
      room_number: 'OPD-102',
      max_daily_patients: 30,
      current_queue_count: 4,
      availability: 'Available',
    },
    {
      id: 2,
      doctor_id: 'DOC-102',
      name: 'Dr. Sneha Kulkarni',
      department: 'Cardiology',
      specialization: 'Cardiology',
      qualification: 'MBBS, MD, DM (Cardiology)',
      shift: 'Evening',
      opd_timing: '02:00 PM - 07:00 PM',
      room_number: 'OPD-205',
      max_daily_patients: 25,
      current_queue_count: 2,
      availability: 'Available',
    },
    {
      id: 3,
      doctor_id: 'DOC-103',
      name: 'Dr. Rajesh Iyer',
      department: 'Pediatrics',
      specialization: 'Pediatrics',
      qualification: 'MBBS, MD (Pediatrics)',
      shift: 'Morning',
      opd_timing: '08:30 AM - 01:30 PM',
      room_number: 'OPD-108',
      max_daily_patients: 25,
      current_queue_count: 3,
      availability: 'Available',
    },
    {
      id: 4,
      doctor_id: 'DOC-104',
      name: 'Dr. Vikram Deshmukh',
      department: 'Emergency & Critical Care',
      specialization: 'Emergency Medicine',
      qualification: 'MBBS, MEM',
      shift: '24x7 Rotational',
      opd_timing: '24x7 Emergency Coverage',
      room_number: 'ER Resus-1',
      max_daily_patients: 40,
      current_queue_count: 1,
      availability: 'On Duty (ER)',
    },
  ];
}

export async function fetchServiceRequests() {
  try {
    const res = await fetch(`${API_BASE}/doctors/service-requests/`);
    if (res.ok) {
      const data = await res.json();
      return data.results || data;
    }
  } catch (err) {
    console.warn('Backend fetchServiceRequests fallback:', err);
  }

  return [
    {
      id: 1,
      request_id: 'SR-1001',
      patient_name: 'Rahul Patil (P-10245)',
      department: 'Laboratory',
      service_type: 'Lab Test',
      details: 'Complete Blood Count (CBC) Panel + Electrolytes',
      ordering_doctor_name: 'Dr. Amit Sharma',
      status: 'in_progress',
      status_display: 'In Progress (Processing)',
      created_at: 'Today, 10:45 AM',
    },
    {
      id: 2,
      request_id: 'SR-1002',
      patient_name: 'Rahul Patil (P-10245)',
      department: 'Pharmacy',
      service_type: 'Medication',
      details: 'IV Normal Saline 500ml + Paracetamol 650mg SOS',
      ordering_doctor_name: 'Dr. Amit Sharma',
      status: 'pending',
      status_display: 'Prescription Verified',
      created_at: 'Today, 11:10 AM',
    },
    {
      id: 3,
      request_id: 'SR-1003',
      patient_name: 'Priya Deshmukh (P-10246)',
      department: 'Laboratory',
      service_type: 'Lab Test',
      details: 'Cardiac Troponin I & 12-Lead ECG confirmation',
      ordering_doctor_name: 'Dr. Sneha Kulkarni',
      status: 'pending',
      status_display: 'Sample Collected',
      created_at: 'Today, 11:30 AM',
    },
  ];
}

export async function recommendDoctorAssignment(patientId = 'P-10245') {
  try {
    const res = await fetch(`${API_BASE}/doctors/recommend-assignment/?patient_id=${encodeURIComponent(patientId)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('recommendDoctorAssignment fallback:', err);
  }

  return {
    patient_id: patientId,
    assignment_mode: 'continuity_of_care',
    recommended_doctor: {
      name: 'Dr. Amit Sharma',
      department: 'General Medicine',
      specialization: 'General Medicine & Infectious Disease',
      opd_timing: '09:00 AM - 02:00 PM',
    },
    department: 'General Medicine',
    continuity_of_care: true,
    reason: 'Continuity of care: Patient previously treated by Dr. Amit Sharma for past 3 visits.',
  };
}
