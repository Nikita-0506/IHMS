import React from 'react';

export default function PatientTimeline({ patientId = 'P-10245' }) {
  const patientTimelines = {
    'P-10245': [
      {
        date: '14-Oct-2026 · 10:30 AM',
        type: 'Urgent Walk-in / OPD',
        badge: 'Current Visit',
        badgeClass: 'badge-urgent',
        doctor: 'Dr. Amit Sharma (General Medicine)',
        title: 'Acute Febrile Illness with Dehydration Risk',
        details:
          'Temperature: 102.4°F, BP: 118/76, Heart Rate: 104 bpm, SpO2: 97%. Dry oral mucosa, reduced skin turgor. OCR CBC Report linked showing leukocytosis (WBC 12,400). Immediate rehydration plan started.',
        medications: ['ORS fluid sachets', 'Paracetamol 650mg SOS', 'Normal Saline IV 500ml'],
        accentColor: '#dc2626',
      },
      {
        date: '08-Nov-2025 · 02:15 PM',
        type: 'Scheduled OPD Consultation',
        badge: 'Resolved',
        badgeClass: 'badge-stable',
        doctor: 'Dr. Amit Sharma (General Medicine)',
        title: 'Dyspepsia & Epigastric Burning',
        details:
          'Patient presented with chronic heartburn and acid regurgitation post meals. Abdominal ultrasound normal. Prescribed Pantoprazole 40mg once daily for 4 weeks with dietary modifications.',
        medications: ['Pantoprazole 40mg OD (pre-breakfast)'],
        accentColor: '#0284c7',
      },
      {
        date: '14-May-2024 · 11:00 AM',
        type: 'Initial Outpatient Consultation',
        badge: 'Resolved',
        badgeClass: 'badge-stable',
        doctor: 'Dr. Amit Sharma (General Medicine)',
        title: 'Acute Viral Bronchitis',
        details:
          'Productive cough, chest congestion, low-grade fever. Penicillin allergy confirmed and documented in electronic medical record. Successfully managed with Azithromycin 500mg and Ambroxol syrup.',
        medications: ['Azithromycin 500mg (5 days)', 'Ambroxol syrup'],
        accentColor: '#4338ca',
      },
    ],
    'P-10246': [
      {
        date: '14-Oct-2026 · 11:15 AM',
        type: 'Urgent Inter-Hospital Transfer',
        badge: 'Current Visit',
        badgeClass: 'badge-urgent',
        doctor: 'Dr. Sneha Kulkarni (Cardiology · CCU)',
        title: 'Acute Retrosternal Chest Discomfort · Referral from Ruby Hall Clinic',
        details:
          'Patient transferred with 45 minutes of substernal tightness radiating to left arm. Bedside 12-lead ECG demonstrates 0.5mm ST depression in V4-V6. Cardiac hs-cTnI borderline (0.04 ng/mL). Aspirin avoided due to bronchospasm allergy; started on Clopidogrel alternative.',
        medications: ['Clopidogrel 75mg OD', 'Atorvastatin 40mg HS', 'Serial hs-cTnI protocol'],
        accentColor: '#d97706',
      },
      {
        date: '22-Aug-2024 · 04:30 PM',
        type: 'Pulmonology Outpatient Visit',
        badge: 'Resolved / Maintenance',
        badgeClass: 'badge-stable',
        doctor: 'Dr. R. K. Shinde (Pulmonology)',
        title: 'Bronchial Asthma Evaluation & Allergy Documentation',
        details:
          'Wheezing episode triggered by NSAID exposure. Strict hypersensitivity warning recorded in EMR for Aspirin and Sulfa drugs. Prescribed dry powder inhaler for rescue use.',
        medications: ['Budesonide/Formoterol 200/6mcg PRN'],
        accentColor: '#0284c7',
      },
    ],
    'P-10247': [
      {
        date: '14-Oct-2026 · 09:45 AM',
        type: 'Quarterly Chronic Care Review',
        badge: 'Current Visit',
        badgeClass: 'badge-stable',
        doctor: 'Dr. Amit Sharma (General Medicine)',
        title: 'Essential Hypertension & Dyslipidemia Routine Monitoring',
        details:
          'Asymptomatic routine follow-up. Blood pressure optimal at 132/84 mmHg on Telmisartan. HbA1c 6.8% showing stable glycemic control. Mild LDL elevation (128 mg/dL) managed on Atorvastatin 10mg. Prescription refilled for 90 days.',
        medications: ['Telmisartan 40mg OD', 'Metformin 500mg BD', 'Atorvastatin 10mg HS'],
        accentColor: '#0284c7',
      },
      {
        date: '18-Jun-2026 · 10:00 AM',
        type: 'Scheduled Checkup',
        badge: 'Routine',
        badgeClass: 'badge-stable',
        doctor: 'Dr. Amit Sharma (General Medicine)',
        title: 'Annual Metabolic Panel & Renal Screen',
        details:
          'Serum Creatinine 0.9 mg/dL with normal eGFR (>90 mL/min). Blood pressure 130/82 mmHg. Reinforcement of low-sodium DASH diet adherence.',
        medications: ['Telmisartan 40mg OD', 'Metformin 500mg BD'],
        accentColor: '#4338ca',
      },
      {
        date: '12-Jan-2025 · 11:30 AM',
        type: 'Routine Review',
        badge: 'Routine',
        badgeClass: 'badge-stable',
        doctor: 'Dr. Amit Sharma (General Medicine)',
        title: 'Lipid Regimen Adjustment',
        details:
          'Follow-up after borderline cholesterol findings. Added low-dose Atorvastatin with good patient tolerability.',
        medications: ['Atorvastatin 10mg HS'],
        accentColor: '#64748b',
      },
    ],
    'P-10248': [
      {
        date: '14-Oct-2026 · 12:05 PM',
        type: 'EMS Emergency Resuscitation',
        badge: 'CRITICAL EMERGENCY',
        badgeClass: 'badge-critical',
        doctor: 'Dr. Vikram Deshmukh (Emergency & Trauma Head)',
        title: 'High-Impact Polytrauma · Blunt Thoracic Injury with Hemothorax',
        details:
          'EMS 108 ambulance transfer following high-speed motor vehicle collision. Patient presented with SpO2 88% on room air, severe tachypnea (RR 28), BP 90/60 mmHg, and tachycardia 128 bpm. FAST ultrasound positive for Morison pouch peritoneal fluid. Emergent right tube thoracostomy (32 Fr) and STAT O-Neg RBCs ordered.',
        medications: ['Normal Saline 0.9% Wide-bore IV', 'Tranexamic Acid 1g IV', 'Packed RBCs 2 Units STAT'],
        accentColor: '#dc2626',
      },
    ],
  };

  const timelineEvents = patientTimelines[patientId] || patientTimelines['P-10245'];

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
            Smart Patient Longitudinal Timeline
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            Longitudinal chronological timeline of previous visits, diagnoses, treatments, and laboratory records for
            Patient <b>{patientId}</b>.
          </p>
        </div>
        <span className="badge-stable" style={{ fontSize: '0.8rem' }}>
          {timelineEvents.length} Documented Encounter{timelineEvents.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* Timeline Chain */}
      <div
        style={{
          borderLeft: '3px solid #0284c7',
          paddingLeft: '1.5rem',
          marginLeft: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
        }}
      >
        {timelineEvents.map((evt, idx) => (
          <div key={idx} style={{ position: 'relative' }}>
            {/* Timeline Dot */}
            <div
              style={{
                position: 'absolute',
                left: '-2.05rem',
                top: '0.25rem',
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: evt.accentColor,
                border: '3px solid #ffffff',
                boxShadow: '0 0 0 2px #cbd5e1',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{evt.date}</span>
              <span className={evt.badgeClass}>{evt.badge}</span>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#0284c7',
                  background: '#e0f2fe',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 4,
                  fontWeight: 600,
                }}
              >
                {evt.type}
              </span>
            </div>

            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>
              {evt.title}
            </div>

            <div style={{ fontSize: '0.8rem', color: '#4338ca', fontWeight: 600, marginTop: '0.15rem' }}>
              Treating Clinician: {evt.doctor}
            </div>

            <p style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.45rem', lineHeight: 1.5 }}>
              {evt.details}
            </p>

            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Prescribed / Protocols:</span>
              {evt.medications.map((med, mIdx) => (
                <span
                  key={mIdx}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: 4,
                    padding: '0.15rem 0.5rem',
                    fontSize: '0.74rem',
                    color: '#0f172a',
                    fontWeight: 600,
                  }}
                >
                  {med}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
