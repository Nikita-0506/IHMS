import React, { useState, useRef, useEffect } from 'react';
import { getAvatarFor, saveAvatarFor, subscribeAvatarUpdates } from '../services/avatarStore';
import { getPatientProfile, ALL_MONITORING_RECORDS } from '../data/clinicalDataset';

export default function PatientOverview({
  selectedPatientId = 'P-10245',
  patientData,
  onOpenNewVisitModal,
  onViewDocModal,
  onBack,
}) {
  const [activeSubTab, setActiveSubTab] = useState('history');
  const [checkedActions, setCheckedActions] = useState({ 1: true, 2: false, 3: false, 4: false });
  const [currentPid, setCurrentPid] = useState(selectedPatientId || 'P-10245');
  const patientPhotoInputRef = useRef(null);
  const [photoUpdateTick, setPhotoUpdateTick] = useState(0);

  // Fallback profiles if patientData is loading
  const patientProfiles = {
    'P-10245': {
      name: 'Rahul Patil',
      pid: 'P-10245',
      age: 32,
      gender: 'Male',
      symbol: '♂',
      phone: '+91 98765 43210',
      bloodGroup: 'B+',
      initials: 'RP',
      avatar: '/avatars/patient_rahul.png',
      severity: 'High Concern',
      condition: 'Fever with dehydration',
      vitals: {
        temp: { val: '38.6 °C', status: '↑ High', color: '#dc2626', bg: '#fef2f2', iconColor: '#ef4444' },
        hr: { val: '92 bpm', status: 'Normal', color: '#059669', bg: '#ecfdf5', iconColor: '#10b981' },
        spo2: { val: '97%', status: 'Normal', color: '#0284c7', bg: '#eff6ff', iconColor: '#0284c7' },
        bp: { val: '118/76', status: 'Normal', color: '#7c3aed', bg: '#f5f3ff', iconColor: '#7c3aed' },
      },
      summary:
        'Patient has fever for 3 days with mild dehydration. Previous history shows similar episodes. No chronic illness recorded. Review medication list and latest lab reports.',
    },
    'P-10246': {
      name: 'Priya Deshmukh',
      pid: 'P-10246',
      age: 29,
      gender: 'Female',
      symbol: '♀',
      phone: '+91 98112 55432',
      bloodGroup: 'O+',
      initials: 'PD',
      avatar: '/avatars/patient_priya.png',
      severity: 'Urgent Referral',
      condition: 'Chest tightness · Ruby Hall Clinic',
      vitals: {
        temp: { val: '37.0 °C', status: 'Normal', color: '#059669', bg: '#ecfdf5', iconColor: '#10b981' },
        hr: { val: '94 bpm', status: 'High Normal', color: '#d97706', bg: '#fffbeb', iconColor: '#f59e0b' },
        spo2: { val: '96%', status: 'Normal', color: '#0284c7', bg: '#eff6ff', iconColor: '#0284c7' },
        bp: { val: '136/88', status: 'Elevated', color: '#d97706', bg: '#fffbeb', iconColor: '#f59e0b' },
      },
      summary:
        'Transferred urgently for exertional retrosternal discomfort. Serial Troponin-I borderline (0.04 ng/mL). Known allergy to Aspirin & Sulfa. CCU telemetry admission indicated.',
    },
    'P-10247': {
      name: 'Sunita Joshi',
      pid: 'P-10247',
      age: 55,
      gender: 'Female',
      symbol: '♀',
      phone: '+91 97654 33211',
      bloodGroup: 'A+',
      initials: 'SJ',
      avatar: '/avatars/patient_sunita.png',
      severity: 'Routine / Stable',
      condition: 'Hypertension & Lipid review',
      vitals: {
        temp: { val: '36.8 °C', status: 'Normal', color: '#059669', bg: '#ecfdf5', iconColor: '#10b981' },
        hr: { val: '72 bpm', status: 'Normal', color: '#059669', bg: '#ecfdf5', iconColor: '#10b981' },
        spo2: { val: '99%', status: 'Optimal', color: '#0284c7', bg: '#eff6ff', iconColor: '#0284c7' },
        bp: { val: '132/84', status: 'Controlled', color: '#059669', bg: '#ecfdf5', iconColor: '#10b981' },
      },
      summary:
        'Quarterly chronic review. Blood pressure and glycemic targets well controlled on Telmisartan and Metformin. LDL 128 mg/dL compensated on Atorvastatin. Routine follow-up in 90 days.',
    },
    'P-10248': {
      name: 'Vikram Singh',
      pid: 'P-10248',
      age: 34,
      gender: 'Male',
      symbol: '♂',
      phone: '+91 98220 99881',
      bloodGroup: 'AB+',
      initials: 'VS',
      avatar: '/avatars/patient_vikram.png',
      severity: 'CRITICAL EMERGENCY',
      condition: 'Polytrauma · Blunt thoracic impact',
      vitals: {
        temp: { val: '36.5 °C', status: 'Low Normal', color: '#d97706', bg: '#fffbeb', iconColor: '#f59e0b' },
        hr: { val: '128 bpm', status: 'Severe Tachycardia', color: '#dc2626', bg: '#fef2f2', iconColor: '#ef4444' },
        spo2: { val: '88%', status: 'CRITICAL HYPOXIA', color: '#dc2626', bg: '#fef2f2', iconColor: '#ef4444' },
        bp: { val: '90/60', status: 'Hypotension (Shock)', color: '#dc2626', bg: '#fef2f2', iconColor: '#ef4444' },
      },
      summary:
        'CRITICAL CODE RED: EMS 108 ambulance transfer following high-speed collision. Severe respiratory distress, right hemothorax on FAST ultrasound. Immediate chest tube insertion and STAT blood transfusion ordered.',
    },
    'P-10249': {
      name: 'Ajay Thore',
      pid: 'P-10249',
      age: 48,
      gender: 'Male',
      symbol: '♂',
      phone: '+91 98334 11223',
      bloodGroup: 'B+',
      initials: 'AT',
      avatar: '/avatars/patient_ajay.png',
      severity: 'Moderate',
      condition: 'Chest Pain · OPD Consultation',
      vitals: {
        temp: { val: '37.1 °C', status: 'Normal', color: '#059669', bg: '#ecfdf5', iconColor: '#10b981' },
        hr: { val: '80 bpm', status: 'Normal', color: '#059669', bg: '#ecfdf5', iconColor: '#10b981' },
        spo2: { val: '98%', status: 'Normal', color: '#0284c7', bg: '#eff6ff', iconColor: '#0284c7' },
        bp: { val: '124/82', status: 'Normal', color: '#059669', bg: '#ecfdf5', iconColor: '#10b981' },
      },
      summary:
        'Walk-in consultation for recurrent atypical chest tightness. Resting ECG normal sinus rhythm. Advised 2D Echocardiogram and stress testing.',
    },
  };

  const getMergedProfiles = () => {
    let custom = {};
    try {
      custom = JSON.parse(localStorage.getItem('ihms_custom_patient_profiles') || '{}');
    } catch {
      custom = {};
    }
    return { ...patientProfiles, ...custom };
  };

  const allProfiles = getMergedProfiles();
  const [livePatientProfile, setLivePatientProfile] = useState(null);

  useEffect(() => {
    if (selectedPatientId) {
      setCurrentPid(selectedPatientId);
    }
  }, [selectedPatientId]);

  useEffect(() => {
    if (!currentPid) return;
    const directProfile = getPatientProfile(currentPid);
    if (directProfile) {
      setLivePatientProfile(directProfile);
    } else if (patientProfiles[currentPid]) {
      setLivePatientProfile(null);
      return;
    }

    // Also fetch from live PostgreSQL clinical monitoring dataset
    let isMounted = true;
    fetch(`/api/patients/monitoring/?patient_id=${encodeURIComponent(currentPid)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const item = data?.results?.[0];
        if (isMounted && item) {
          const profile = getPatientProfile(item.patient_id) || {};
          const sbp = Math.round(item.systolic_bp_mmhg || 120);
          const dbp = Math.round(item.diastolic_bp_mmhg || 80);
          const hr = Math.round(item.heart_rate_bpm || 75);
          const rr = Math.round(item.respiratory_rate_bpm || 18);
          const spo2 = item.spo2_percent ? parseFloat(item.spo2_percent).toFixed(1) : '98.0';
          const temp = item.temperature_c ? parseFloat(item.temperature_c).toFixed(1) : '37.0';
          const isHigh = item.deterioration_risk === 'High' || item.predicted_monitoring_level === 'Continuous';
          const isMed = item.deterioration_risk === 'Moderate' || item.predicted_monitoring_level === 'Enhanced';

          setLivePatientProfile({
            ...profile,
            name: item.full_name || `${item.first_name} ${item.last_name}`,
            pid: item.patient_id,
            age: item.age || profile.age || 45,
            gender: item.gender || profile.gender || 'Unknown',
            symbol: (item.gender || profile.gender) === 'Female' ? '♀' : '♂',
            phone: item.phone || profile.phone || '+91 98000 00000',
            bloodGroup: profile.bloodGroup || 'B+',
            city: item.city || profile.city || 'Mumbai',
            initials: ((item.first_name?.[0] || 'P') + (item.last_name?.[0] || 'T')).toUpperCase(),
            avatar: (item.gender || profile.gender) === 'Female' ? '/avatars/patient_sneha.png' : '/avatars/patient_rahul.png',
            severity: isHigh ? 'CRITICAL HIGH ALERT' : isMed ? 'MODERATE RISK' : 'ROUTINE STABLE',
            condition: `${item.care_unit || profile.careUnit} · Bed: ${item.bed_no || profile.bedNo || 'Standard'} (Room: ${item.room_no || profile.roomNo || 'GW-01'})`,
            careUnit: item.care_unit || profile.careUnit,
            roomNo: item.room_no || profile.roomNo,
            bedNo: item.bed_no || profile.bedNo,
            deteriorationRisk: item.deterioration_risk || profile.deteriorationRisk,
            riskScore: item.risk_score || profile.riskScore,
            predictedMonitoringLevel: item.predicted_monitoring_level || profile.predictedMonitoringLevel,
            allergyStatus: item.allergy_status || profile.allergyStatus,
            vitals: {
              temp: { val: `${temp} °C`, status: Number(temp) >= 38 ? '↑ Febrile' : 'Normal', color: Number(temp) >= 38 ? '#dc2626' : '#059669', bg: '#ecfdf5', iconColor: '#10b981' },
              hr: { val: `${hr} bpm`, status: hr > 100 ? 'Tachycardia' : 'Normal', color: hr > 100 ? '#dc2626' : '#059669', bg: '#ecfdf5', iconColor: '#10b981' },
              spo2: { val: `${spo2}%`, status: Number(spo2) < 95 ? 'Hypoxia' : 'Optimal', color: Number(spo2) < 95 ? '#dc2626' : '#0284c7', bg: '#eff6ff', iconColor: '#0284c7' },
              bp: { val: `${sbp}/${dbp}`, status: 'Recorded', color: '#7c3aed', bg: '#f5f3ff', iconColor: '#7c3aed' },
              glucose: profile.vitals?.glucose || { val: `${Math.round(item.blood_glucose_mg_dl || 100)} mg/dL`, status: 'Normal', color: '#059669' },
              rr: profile.vitals?.rr || { val: `${rr} bpm`, status: 'Normal', color: '#059669' },
              urine: profile.vitals?.urine || { val: `${parseFloat(item.urine_output_ml_hr || 45).toFixed(1)} mL/hr`, status: 'Normal', color: '#059669' },
              gcs: profile.vitals?.gcs || { val: `${item.gcs_score || 15}/15`, status: 'Full GCS', color: '#059669' },
              pain: profile.vitals?.pain || { val: `${item.pain_score_0_10 || 2}/10`, status: 'Assessed', color: '#059669' },
            },
            summary: profile.summary || `Patient ${item.full_name} (${item.patient_id}) from ${item.city || 'Inpatient unit'} admitted under ${item.care_unit}. ML Model Prediction: ${item.predicted_monitoring_level || item.monitoring_level}. Clinical Deterioration Risk Score: ${item.risk_score || 15}/100. Allergy status: ${item.allergy_status || 'None reported'}.`,
          });
        }
      })
      .catch((err) => console.warn('Could not fetch live patient profile:', err));

    return () => {
      isMounted = false;
    };
  }, [currentPid]);

  useEffect(() => {
    const unsub = subscribeAvatarUpdates((key) => {
      if (key === currentPid) {
        setPhotoUpdateTick((t) => t + 1);
      }
    });
    return unsub;
  }, [currentPid]);

  const currentPatient =
    livePatientProfile ||
    getPatientProfile(currentPid) ||
    allProfiles[currentPid] ||
    allProfiles['P-10245'];

  useEffect(() => {
    if (currentPatient.medications && currentPatient.medications.length > 0) {
      setMedicationsList(currentPatient.medications);
    }
    if (currentPatient.allergies && currentPatient.allergies.length > 0) {
      setAllergiesList(currentPatient.allergies);
    }
  }, [currentPatient.pid]);

  const patientAvatar = getAvatarFor(currentPatient.pid, currentPatient.avatar);

  const handlePatientPhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        saveAvatarFor(currentPatient.pid, reader.result);
        setPhotoUpdateTick((t) => t + 1);
        alert(`Profile photo for ${currentPatient.name} updated successfully!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const [selectedHistoryDoc, setSelectedHistoryDoc] = useState(null);
  const [showAllHistoryModal, setShowAllHistoryModal] = useState(false);
  const [showAddMedicationModal, setShowAddMedicationModal] = useState(false);
  const [showAddAllergyModal, setShowAddAllergyModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [cameraActiveInModal, setCameraActiveInModal] = useState(false);

  const presetPatientAvatars = [
    { label: 'Rahul', path: '/avatars/patient_rahul.png' },
    { label: 'Priya', path: '/avatars/patient_priya.png' },
    { label: 'Sunita', path: '/avatars/patient_sunita.png' },
    { label: 'Vikram', path: '/avatars/patient_vikram.png' },
    { label: 'Ananya', path: '/avatars/patient_ananya.png' },
    { label: 'Sagar', path: '/avatars/patient_sagar.png' },
    { label: 'Sneha', path: '/avatars/patient_sneha.png' },
    { label: 'Deepak', path: '/avatars/patient_deepak.png' },
  ];

  const [medicationsList, setMedicationsList] = useState([
    { id: 1, drug: 'Paracetamol 650mg', dosage: '1 Tab', route: 'Oral', freq: 'TDS (3x / day)', duration: '5 Days', doctor: 'Dr. Amit Deshmukh', status: 'Active' },
    { id: 2, drug: 'Pantoprazole 40mg', dosage: '1 Cap', route: 'Oral', freq: 'OD (Before breakfast)', duration: '14 Days', doctor: 'Dr. Rohan Mehta', status: 'Active' },
    { id: 3, drug: 'ORS Hydration Sachet', dosage: '1 Sachet in 1L', route: 'Oral', freq: 'PRN (As needed)', duration: '3 Days', doctor: 'Dr. Amit Deshmukh', status: 'Completed' },
    { id: 4, drug: 'Multivitamin & Zinc', dosage: '1 Tab', route: 'Oral', freq: 'OD (Post lunch)', duration: '30 Days', doctor: 'Dr. Sneha Kulkarni', status: 'Active' },
  ]);

  const [allergiesList, setAllergiesList] = useState([
    { id: 1, allergen: 'Penicillin / Amoxicillin', type: 'Drug Allergy', severity: 'Severe', reaction: 'Anaphylaxis, Urticaria', date: '10 Feb 2024', status: 'Verified' },
    { id: 2, allergen: 'Aspirin & NSAIDs', type: 'Drug Allergy', severity: 'High', reaction: 'Bronchospasm, Facial Angioedema', date: '18 Nov 2023', status: 'Verified' },
    { id: 3, allergen: 'Sulfa Drugs (Sulfonamides)', type: 'Drug Allergy', severity: 'Moderate', reaction: 'Cutaneous Maculopapular Rash', date: '04 Jul 2022', status: 'Verified' },
    { id: 4, allergen: 'Shellfish & Seafood', type: 'Food Allergy', severity: 'Moderate', reaction: 'Gastrointestinal Distress, Hives', date: '12 Jan 2021', status: 'Reported' },
  ]);

  const historyItems = [
    {
      id: 1,
      date: '12 Sep 2026',
      title: 'Viral fever – Treated, recovered',
      desc: 'Prescribed Paracetamol, hydration advised',
      color: '#10b981',
      reportType: 'Clinical Encounter Note & Lab Report',
      doctor: 'Dr. Sneha Kulkarni (General Medicine)',
      details: 'Patient presented with high-grade pyrexia (39.1°C), chills, and body aches for 2 days. Complete Blood Count (CBC) was performed showing mild leukopenia. Oral hydration and antipyretics initiated. Full symptomatic recovery in 72 hours.',
      prescriptions: ['Tab Paracetamol 650mg TDS x 3 days', 'ORS Hydration Sachet 1 pack/L'],
      labSummary: 'Hb: 13.5 g/dL | WBC: 4.8 x 10^3/µL | Platelets: 210 x 10^3/µL',
    },
    {
      id: 2,
      date: '15 Jun 2026',
      title: 'Gastritis – Medication given',
      desc: 'Prescribed Pantoprazole',
      color: '#0284c7',
      reportType: 'Gastroenterology Consultation Report',
      doctor: 'Dr. Rohan Mehta (Gastroenterology)',
      details: 'Patient reported epigastric burning pain and dyspepsia after spicy food intake. Abdominal ultrasound normal with no gallstones. Diagnosis: Acute Erythematous Gastritis.',
      prescriptions: ['Cap Pantoprazole 40mg OD Before Breakfast x 14 days', 'Syrup Mucaine Gel 10ml TDS'],
      labSummary: 'H. Pylori Stool Antigen: Negative | Serum Amylase: Normal',
    },
    {
      id: 3,
      date: '19 Jan 2026',
      title: 'Fever – Similar episode',
      desc: 'Recovered in 3 days',
      color: '#ef4444',
      reportType: 'OPD Acute Illness Record',
      doctor: 'Dr. Amit Deshmukh (General Medicine)',
      details: 'Brief episode of febrile illness following seasonal weather change. Rapid Malaria Ag (Pf/Pv) test negative, Dengue NS1 Ag negative. Symptomatic treatment provided.',
      prescriptions: ['Tab Dolo 650mg SOS', 'Vitamin C 500mg OD x 5 days'],
      labSummary: 'Dengue NS1: Non-Reactive | Malarial Parasite Smear: Negative',
    },
    {
      id: 4,
      date: 'Past',
      title: 'No chronic illness recorded',
      desc: 'Past history reviewed',
      color: '#94a3b8',
      reportType: 'Comprehensive Health Screening & Baseline EHR',
      doctor: 'Dr. Vikram Patil (Health Checkup Wing)',
      details: 'Annual executive health checkup completed. Normal cardiovascular, respiratory, and abdominal examinations. No hypertension, diabetes mellitus, or coronary artery disease.',
      prescriptions: ['Routine lifestyle advice and dietary counseling.'],
      labSummary: 'Fasting Blood Sugar: 88 mg/dL | Serum Creatinine: 0.9 mg/dL | ECG: Normal Sinus Rhythm',
    },
  ];

  const toggleAction = (id) => {
    setCheckedActions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="ihms-scroll-viewport">
      {/* Hidden file input for patient photo change */}
      <input
        type="file"
        ref={patientPhotoInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={handlePatientPhotoUpload}
      />


      {/* Top Breadcrumb & Actions Bar */}
      <div className="patient-overview-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onBack && (
            <button
              type="button"
              className="page-header-back-btn"
              onClick={onBack}
              title="Go Back"
              style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#eff6ff';
                e.currentTarget.style.borderColor = '#93c5fd';
                e.currentTarget.style.color = '#2563eb';
                e.currentTarget.style.transform = 'translateX(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#1e293b';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
          )}
          <div>
            <div className="patient-overview-breadcrumbs">
              Patients &gt; <b>{currentPatient.pid}</b>
            </div>
            <h2 className="patient-overview-title">Patient Overview</h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Select Patient:</span>
            <select
              value={currentPid}
              onChange={(e) => setCurrentPid(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#0f172a',
                maxWidth: '280px',
                cursor: 'pointer',
              }}
              title="Select any patient from the clinical monitoring dataset"
            >
              <option value="P-10245">Rahul Patil (P-10245)</option>
              {ALL_MONITORING_RECORDS.slice(0, 500).map((p) => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.patient_id} - {p.full_name} ({p.care_unit})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="btn-table-action"
            style={{
              background: '#2563eb',
              color: '#ffffff',
              borderColor: '#2563eb',
              padding: '0.55rem 1rem',
              fontSize: '0.84rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '8px',
            }}
            onClick={onOpenNewVisitModal}
          >
            <span>+</span> New Visit
          </button>
        </div>
      </div>

      {/* Patient Profile Header Card */}
      <div className="patient-profile-top-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Avatar Container with Camera Badge */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={patientAvatar}
              alt={currentPatient.name}
              className="patient-avatar-large"
              style={{
                objectFit: 'cover',
                border: '3px solid #93c5fd',
                width: 74,
                height: 74,
                borderRadius: '50%',
                cursor: 'pointer',
              }}
              onClick={() => setShowPhotoModal(true)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/avatars/patient_rahul.png';
              }}
            />
            <button
              type="button"
              onClick={() => setShowPhotoModal(true)}
              title="Click to change patient photo"
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: '#2563eb',
                color: '#ffffff',
                border: '2px solid #ffffff',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {currentPatient.name} <span style={{ color: '#2563eb' }}>{currentPatient.symbol}</span>
              </h3>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '3px' }}>
              <span>{currentPatient.pid}</span>
              <span style={{ margin: '0 0.5rem' }}>|</span>
              <span>{currentPatient.age} years</span>
              <span style={{ margin: '0 0.5rem' }}>|</span>
              <span>{currentPatient.gender}</span>
              <span style={{ margin: '0 0.5rem' }}>|</span>
              <span>{currentPatient.phone}</span>
              {currentPatient.city && (
                <>
                  <span style={{ margin: '0 0.5rem' }}>|</span>
                  <span>📍 {currentPatient.city}</span>
                </>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center', marginTop: '6px', fontSize: '0.78rem' }}>
              <div>
                Blood Group: <b style={{ color: '#dc2626' }}>{currentPatient.bloodGroup}</b>
              </div>
              {currentPatient.careUnit && (
                <div style={{ background: '#eff6ff', color: '#1e40af', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                  🏥 {currentPatient.careUnit} (Room: {currentPatient.roomNo || 'GW-01'}, Bed: {currentPatient.bedNo || 'B-01'})
                </div>
              )}
              {currentPatient.assignedDoctor && (
                <div style={{ background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                  👨‍⚕️ Attending: {currentPatient.assignedDoctor}
                </div>
              )}
              {currentPatient.allergyStatus && (
                <div style={{
                  background: currentPatient.allergyStatus.toLowerCase().includes('known') || currentPatient.allergyStatus.toLowerCase().includes('none') ? '#ecfdf5' : '#fef2f2',
                  color: currentPatient.allergyStatus.toLowerCase().includes('known') || currentPatient.allergyStatus.toLowerCase().includes('none') ? '#059669' : '#dc2626',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '4px',
                  fontWeight: 700
                }}>
                  ⚠️ Allergy: {currentPatient.allergyStatus}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Severity Alert Box */}
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#dc2626' }}>
              {currentPatient.severity}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#b91c1c', fontWeight: 600 }}>
              {currentPatient.condition}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Vital Metric Cards Row */}
      <div className="patient-vitals-grid">
        {/* Temperature */}
        <div className="vital-metric-card">
          <div className="vital-icon-circle" style={{ background: currentPatient.vitals.temp.bg, color: currentPatient.vitals.temp.iconColor }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
            </svg>
          </div>
          <div className="vital-body">
            <div className="v-label">Temperature</div>
            <div className="v-value">{currentPatient.vitals.temp.val}</div>
            <div className="v-status" style={{ color: currentPatient.vitals.temp.color }}>
              {currentPatient.vitals.temp.status}
            </div>
          </div>
        </div>

        {/* Heart Rate */}
        <div className="vital-metric-card">
          <div className="vital-icon-circle" style={{ background: currentPatient.vitals.hr.bg, color: currentPatient.vitals.hr.iconColor }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
              <polyline points="12 11 12 15 15 15" />
            </svg>
          </div>
          <div className="vital-body">
            <div className="v-label">Heart Rate</div>
            <div className="v-value">{currentPatient.vitals.hr.val}</div>
            <div className="v-status" style={{ color: currentPatient.vitals.hr.color }}>
              {currentPatient.vitals.hr.status}
            </div>
          </div>
        </div>

        {/* SpO2 */}
        <div className="vital-metric-card">
          <div className="vital-icon-circle" style={{ background: currentPatient.vitals.spo2.bg, color: currentPatient.vitals.spo2.iconColor }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
          <div className="vital-body">
            <div className="v-label">SpO₂</div>
            <div className="v-value">{currentPatient.vitals.spo2.val}</div>
            <div className="v-status" style={{ color: currentPatient.vitals.spo2.color }}>
              {currentPatient.vitals.spo2.status}
            </div>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="vital-metric-card">
          <div className="vital-icon-circle" style={{ background: currentPatient.vitals.bp.bg, color: currentPatient.vitals.bp.iconColor }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="vital-body">
            <div className="v-label">BP</div>
            <div className="v-value">{currentPatient.vitals.bp.val}</div>
            <div className="v-status" style={{ color: currentPatient.vitals.bp.color }}>
              {currentPatient.vitals.bp.status}
            </div>
          </div>
        </div>
      </div>

      {/* Extended Physiological Parameters from CSV */}
      <div className="patient-vitals-grid" style={{ marginTop: '0.75rem' }}>
        {/* Blood Glucose */}
        <div className="vital-metric-card">
          <div className="vital-icon-circle" style={{ background: '#fef3c7', color: '#d97706' }}>
            <span style={{ fontSize: '1.1rem' }}>🩸</span>
          </div>
          <div className="vital-body">
            <div className="v-label">Blood Glucose</div>
            <div className="v-value">{currentPatient.vitals.glucose?.val || '98 mg/dL'}</div>
            <div className="v-status" style={{ color: currentPatient.vitals.glucose?.color || '#059669' }}>
              {currentPatient.vitals.glucose?.status || 'Normal'}
            </div>
          </div>
        </div>

        {/* Respiratory Rate */}
        <div className="vital-metric-card">
          <div className="vital-icon-circle" style={{ background: '#ecfdf5', color: '#059669' }}>
            <span style={{ fontSize: '1.1rem' }}>🫁</span>
          </div>
          <div className="vital-body">
            <div className="v-label">Respiratory Rate</div>
            <div className="v-value">{currentPatient.vitals.rr?.val || '18 bpm'}</div>
            <div className="v-status" style={{ color: currentPatient.vitals.rr?.color || '#059669' }}>
              {currentPatient.vitals.rr?.status || 'Normal'}
            </div>
          </div>
        </div>

        {/* Urine Output */}
        <div className="vital-metric-card">
          <div className="vital-icon-circle" style={{ background: '#eff6ff', color: '#0284c7' }}>
            <span style={{ fontSize: '1.1rem' }}>💧</span>
          </div>
          <div className="vital-body">
            <div className="v-label">Urine Output</div>
            <div className="v-value">{currentPatient.vitals.urine?.val || '48 mL/hr'}</div>
            <div className="v-status" style={{ color: currentPatient.vitals.urine?.color || '#059669' }}>
              {currentPatient.vitals.urine?.status || 'Normal Output'}
            </div>
          </div>
        </div>

        {/* GCS & Pain Score */}
        <div className="vital-metric-card">
          <div className="vital-icon-circle" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <span style={{ fontSize: '1.1rem' }}>⚡</span>
          </div>
          <div className="vital-body">
            <div className="v-label">GCS / Pain Score</div>
            <div className="v-value">GCS {currentPatient.vitals.gcs?.val || '15/15'} · Pain {currentPatient.vitals.pain?.val || '0/10'}</div>
            <div className="v-status" style={{ color: '#7c3aed' }}>
              ECG: {currentPatient.vitals.hr?.status || 'Sinus Rhythm'}
            </div>
          </div>
        </div>
      </div>

      {/* AI Clinical Summary Banner */}
      <div className="ai-clinical-summary-box">
        <div className="ai-summary-header">
          <div className="ai-summary-tag">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <span>AI Clinical Summary</span>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
            Generated on 14 Oct 2026, 10:32 AM
          </span>
        </div>
        <p style={{ fontSize: '0.86rem', color: '#1e293b', lineHeight: 1.6 }}>
          {currentPatient.summary}
        </p>
      </div>

      {/* Patient Subtabs Navigation Strip */}
      <div className="patient-tabs-row">
        <button
          type="button"
          className={`patient-tab-btn ${activeSubTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('history')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
          </svg>
          History
        </button>

        <button
          type="button"
          className={`patient-tab-btn ${activeSubTab === 'ocr' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('ocr')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          </svg>
          OCR Reports
        </button>

        <button
          type="button"
          className={`patient-tab-btn ${activeSubTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('timeline')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Visit Timeline
        </button>

        <button
          type="button"
          className={`patient-tab-btn ${activeSubTab === 'medications' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('medications')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z" />
          </svg>
          Medications
        </button>

        <button
          type="button"
          className={`patient-tab-btn ${activeSubTab === 'allergies' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('allergies')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06" />
          </svg>
          Allergies
        </button>
      </div>

      {/* Tab 1: History (Relevant Medical History & Pending Actions) */}
      {activeSubTab === 'history' && (
        <div className="patient-bottom-grid">
          {/* Relevant Medical History */}
          <div className="white-box-card" style={{ marginBottom: 0 }}>
            <div className="box-card-header">
              <div className="box-card-header-left">
                <div style={{ color: '#2563eb' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 8 14" />
                  </svg>
                </div>
                <div>
                  <h3>Relevant Medical History</h3>
                </div>
              </div>
              <span
                className="link-view-all"
                onClick={() => setShowAllHistoryModal(true)}
                style={{ cursor: 'pointer', fontWeight: 700 }}
                title="Click to view full archived medical history"
              >
                View All
              </span>
            </div>

            <div className="history-chain-list">
              {historyItems.map((item) => (
                <div key={item.id} className="history-chain-item">
                  <span className="history-node-bullet" style={{ borderColor: item.color }}></span>
                  <span className="history-node-date" style={{ color: item.color === '#94a3b8' ? '#94a3b8' : undefined }}>{item.date}</span>
                  <div className="history-node-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="h-title">{item.title}</div>
                      <button
                        type="button"
                        onClick={() => setSelectedHistoryDoc(item)}
                        title="Click to open medical encounter document"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          borderRadius: '4px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </button>
                    </div>
                    <div className="h-sub">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Actions Checklist */}
          <div className="white-box-card" style={{ marginBottom: 0 }}>
            <div className="box-card-header">
              <div className="box-card-header-left">
                <div style={{ color: '#2563eb' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <div>
                  <h3>Pending Actions</h3>
                </div>
              </div>
            </div>

            <div className="pending-actions-list">
              <div className="action-checkbox-item" onClick={() => toggleAction(1)}>
                <div className="action-check-left">
                  <input
                    type="checkbox"
                    checked={checkedActions[1]}
                    onChange={() => {}}
                    style={{ accentColor: '#2563eb', width: 16, height: 16 }}
                  />
                  <span style={{ textDecoration: checkedActions[1] ? 'line-through' : 'none', color: checkedActions[1] ? '#94a3b8' : '#0f172a' }}>
                    Review uploaded lab report
                  </span>
                </div>
                <span className="priority-chip priority-high">High</span>
              </div>

              <div className="action-checkbox-item" onClick={() => toggleAction(2)}>
                <div className="action-check-left">
                  <input
                    type="checkbox"
                    checked={checkedActions[2]}
                    onChange={() => {}}
                    style={{ accentColor: '#2563eb', width: 16, height: 16 }}
                  />
                  <span style={{ textDecoration: checkedActions[2] ? 'line-through' : 'none', color: checkedActions[2] ? '#94a3b8' : '#0f172a' }}>
                    Confirm current medication
                  </span>
                </div>
                <span className="priority-chip priority-medium">Medium</span>
              </div>

              <div className="action-checkbox-item" onClick={() => toggleAction(3)}>
                <div className="action-check-left">
                  <input
                    type="checkbox"
                    checked={checkedActions[3]}
                    onChange={() => {}}
                    style={{ accentColor: '#2563eb', width: 16, height: 16 }}
                  />
                  <span style={{ textDecoration: checkedActions[3] ? 'line-through' : 'none', color: checkedActions[3] ? '#94a3b8' : '#0f172a' }}>
                    Check hydration status
                  </span>
                </div>
                <span className="priority-chip priority-medium">Medium</span>
              </div>

              <div className="action-checkbox-item" onClick={() => toggleAction(4)}>
                <div className="action-check-left">
                  <input
                    type="checkbox"
                    checked={checkedActions[4]}
                    onChange={() => {}}
                    style={{ accentColor: '#2563eb', width: 16, height: 16 }}
                  />
                  <span style={{ textDecoration: checkedActions[4] ? 'line-through' : 'none', color: checkedActions[4] ? '#94a3b8' : '#0f172a' }}>
                    Doctor verification required
                  </span>
                </div>
                <span className="priority-chip priority-high">High</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: OCR Reports */}
      {activeSubTab === 'ocr' && (
        <div className="white-box-card" style={{ marginTop: '0.5rem' }}>
          <div className="box-card-header" style={{ marginBottom: '1.25rem' }}>
            <div className="box-card-header-left">
              <div style={{ color: '#2563eb' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>OCR Clinical Reports & Scanned Documents</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Automated entity extraction and verified laboratory reports</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-table-action"
              onClick={onViewDocModal}
              style={{ background: '#2563eb', color: '#ffffff', borderColor: '#2563eb', fontWeight: 700 }}
            >
              📄 Open Document Viewer
            </button>
          </div>

          <div className="ihms-table-container">
            <table className="ihms-clinical-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Category</th>
                  <th>Uploaded Date</th>
                  <th>OCR Confidence</th>
                  <th>Extraction Status</th>
                  <th style={{ textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#dc2626', fontSize: '1.1rem' }}>📄</span>
                      <span>Lab Report - CBC.pdf</span>
                    </div>
                  </td>
                  <td>Complete Blood Count</td>
                  <td>14 Oct 2026, 10:35 AM</td>
                  <td><span style={{ background: '#ecfdf5', color: '#059669', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem' }}>99.4% High</span></td>
                  <td><span className="priority-chip priority-low" style={{ background: '#ecfdf5', color: '#059669' }}>Processed</span></td>
                  <td style={{ textAlign: 'center' }}>
                    <button type="button" className="btn-table-action" onClick={onViewDocModal}>
                      View Document →
                    </button>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#2563eb', fontSize: '1.1rem' }}>🖼️</span>
                      <span>Chest X-Ray Imaging (PA View).jpg</span>
                    </div>
                  </td>
                  <td>Radiology / Imaging</td>
                  <td>12 Oct 2026, 04:15 PM</td>
                  <td><span style={{ background: '#ecfdf5', color: '#059669', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem' }}>98.8% High</span></td>
                  <td><span className="priority-chip priority-low" style={{ background: '#ecfdf5', color: '#059669' }}>Processed</span></td>
                  <td style={{ textAlign: 'center' }}>
                    <button type="button" className="btn-table-action" onClick={onViewDocModal}>
                      View Document →
                    </button>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#d97706', fontSize: '1.1rem' }}>📝</span>
                      <span>Emergency Referral Summary.pdf</span>
                    </div>
                  </td>
                  <td>External Transfer Note</td>
                  <td>08 Oct 2026, 11:20 AM</td>
                  <td><span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem' }}>99.1% High</span></td>
                  <td><span className="priority-chip priority-medium" style={{ background: '#eff6ff', color: '#1d4ed8' }}>Verified</span></td>
                  <td style={{ textAlign: 'center' }}>
                    <button type="button" className="btn-table-action" onClick={onViewDocModal}>
                      View Document →
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Visit Timeline */}
      {activeSubTab === 'timeline' && (
        <div className="white-box-card" style={{ marginTop: '0.5rem' }}>
          <div className="box-card-header" style={{ marginBottom: '1.25rem' }}>
            <div className="box-card-header-left">
              <div style={{ color: '#2563eb' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Visit & Consultation Timeline</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Chronological history of patient visits, appointments and clinical encounters</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-table-action"
              onClick={onOpenNewVisitModal}
              style={{ background: '#2563eb', color: '#ffffff', borderColor: '#2563eb', fontWeight: 700 }}
            >
              + Schedule Follow-up Visit
            </button>
          </div>

          <div className="history-chain-list">
            <div className="history-chain-item">
              <span className="history-node-bullet" style={{ borderColor: '#2563eb' }}></span>
              <span className="history-node-date" style={{ color: '#2563eb', fontWeight: 700 }}>14 Oct 2026</span>
              <div className="history-node-content" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="h-title" style={{ fontSize: '0.98rem' }}>OPD Consultation & Fever Re-evaluation</div>
                  <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Attending: Dr. Amit Deshmukh</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.4rem', lineHeight: 1.5 }}>
                  Patient attended OPD reporting reduced fever spikes. Hydration status normal. Vitals recorded: BP 118/76 mmHg, SpO2 97%, HR 92 bpm. Lab report for CBC reviewed and added to EHR.
                </div>
              </div>
            </div>

            <div className="history-chain-item">
              <span className="history-node-bullet" style={{ borderColor: '#10b981' }}></span>
              <span className="history-node-date">12 Sep 2026</span>
              <div className="history-node-content" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="h-title" style={{ fontSize: '0.98rem' }}>Acute Viral Syndrome · Walk-in ER Visit</div>
                  <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Attending: Dr. Sneha Kulkarni</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.4rem', lineHeight: 1.5 }}>
                  High fever with dehydration, body fatigue. Received 500ml Ringer Lactate IV infusion and Tab Paracetamol 650mg. Discharged home after vital stabilization.
                </div>
              </div>
            </div>

            <div className="history-chain-item">
              <span className="history-node-bullet" style={{ borderColor: '#0284c7' }}></span>
              <span className="history-node-date">15 Jun 2026</span>
              <div className="history-node-content" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="h-title" style={{ fontSize: '0.98rem' }}>Gastroenterology Evaluation · OPD Clinic</div>
                  <span style={{ background: '#eff6ff', color: '#0284c7', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Attending: Dr. Rohan Mehta</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.4rem', lineHeight: 1.5 }}>
                  Epigastric burn and acidity. Abdominal ultrasound carried out showing clear parenchyma. Pantoprazole 40mg initiated for 14-day cycle.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Medications */}
      {activeSubTab === 'medications' && (
        <div className="white-box-card" style={{ marginTop: '0.5rem' }}>
          <div className="box-card-header" style={{ marginBottom: '1.25rem' }}>
            <div className="box-card-header-left">
              <div style={{ color: '#2563eb' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M10.5 20.5l10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7z" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Active Prescriptions & Current Medications</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Medications currently administered or prescribed to this patient</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-table-action"
              onClick={() => setShowAddMedicationModal(true)}
              style={{ background: '#2563eb', color: '#ffffff', borderColor: '#2563eb', fontWeight: 700 }}
            >
              + Add Prescription
            </button>
          </div>

          <div className="ihms-table-container">
            <table className="ihms-clinical-table">
              <thead>
                <tr>
                  <th>Drug Name</th>
                  <th>Dosage</th>
                  <th>Route</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Prescribed By</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {medicationsList.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 700, color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ color: '#2563eb' }}>💊</span>
                        <span>{m.drug}</span>
                      </div>
                    </td>
                    <td>{m.dosage}</td>
                    <td>{m.route}</td>
                    <td>{m.freq}</td>
                    <td>{m.duration}</td>
                    <td style={{ color: '#475569' }}>{m.doctor}</td>
                    <td>
                      <span
                        style={{
                          background: m.status === 'Active' ? '#ecfdf5' : '#f1f5f9',
                          color: m.status === 'Active' ? '#059669' : '#64748b',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                        }}
                      >
                        ● {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Allergies */}
      {activeSubTab === 'allergies' && (
        <div className="white-box-card" style={{ marginTop: '0.5rem' }}>
          <div className="box-card-header" style={{ marginBottom: '1.25rem' }}>
            <div className="box-card-header-left">
              <div style={{ color: '#dc2626' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Documented Allergies & Critical Adverse Reactions</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Contraindicated substances and hypersensitivity records</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-table-action"
              onClick={() => setShowAddAllergyModal(true)}
              style={{ background: '#dc2626', color: '#ffffff', borderColor: '#dc2626', fontWeight: 700 }}
            >
              + Record Allergy Alert
            </button>
          </div>

          <div className="ihms-table-container">
            <table className="ihms-clinical-table">
              <thead>
                <tr>
                  <th>Allergen / Substance</th>
                  <th>Classification</th>
                  <th>Severity Level</th>
                  <th>Observed Clinical Reaction</th>
                  <th>Documented Date</th>
                  <th>Verification</th>
                </tr>
              </thead>
              <tbody>
                {allergiesList.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 800, color: '#dc2626' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>⚠️</span>
                        <span>{a.allergen}</span>
                      </div>
                    </td>
                    <td>{a.type}</td>
                    <td>
                      <span
                        style={{
                          background: a.severity === 'Severe' ? '#fef2f2' : a.severity === 'High' ? '#fff7ed' : '#fefce8',
                          color: a.severity === 'Severe' ? '#dc2626' : a.severity === 'High' ? '#c2410c' : '#a16207',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                        }}
                      >
                        ● {a.severity}
                      </span>
                    </td>
                    <td style={{ color: '#334155' }}>{a.reaction}</td>
                    <td style={{ color: '#64748b' }}>{a.date}</td>
                    <td>
                      <span style={{ background: '#ecfdf5', color: '#059669', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.74rem' }}>
                        ✓ {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* POPUP MODAL 1: Single Clinical Encounter Document (Clicked from Document Icons) */}
      {selectedHistoryDoc && (
        <div className="modal-backdrop-overlay" onClick={() => setSelectedHistoryDoc(null)}>
          <div className="modal-window-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-window-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.25rem' }}>📄</span>
                <div>
                  <h3 style={{ margin: 0 }}>Clinical Encounter Record</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Date of Record: {selectedHistoryDoc.date}</span>
                </div>
              </div>
              <button type="button" className="btn-modal-close" onClick={() => setSelectedHistoryDoc(null)}>✕</button>
            </div>

            <div className="modal-window-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800 }}>Encounter Diagnosis</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{selectedHistoryDoc.title}</div>
                <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>Attending Physician: {selectedHistoryDoc.doctor}</div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>Clinical Notes & Observations</h4>
                <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.6, margin: 0, background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '8px' }}>
                  {selectedHistoryDoc.details}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>Diagnostic & Lab Summary</h4>
                <div style={{ fontSize: '0.82rem', color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.65rem 0.85rem', borderRadius: '8px', fontWeight: 600 }}>
                  ✓ {selectedHistoryDoc.labSummary}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>Prescriptions & Therapy</h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.82rem', color: '#1e293b' }}>
                  {selectedHistoryDoc.prescriptions.map((rx, idx) => (
                    <li key={idx} style={{ marginBottom: '0.25rem' }}>{rx}</li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  className="btn-table-action"
                  onClick={() => setSelectedHistoryDoc(null)}
                >
                  Close Window
                </button>
                <button
                  type="button"
                  className="btn-table-action"
                  style={{ background: '#2563eb', color: '#ffffff', borderColor: '#2563eb', fontWeight: 700 }}
                  onClick={() => {
                    setSelectedHistoryDoc(null);
                    if (onViewDocModal) onViewDocModal();
                  }}
                >
                  📄 View Full Signed PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: View All Medical History Archive */}
      {showAllHistoryModal && (
        <div className="modal-backdrop-overlay" onClick={() => setShowAllHistoryModal(false)}>
          <div className="modal-window-card" style={{ maxWidth: '780px', width: '92vw' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-window-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.25rem' }}>📚</span>
                <div>
                  <h3 style={{ margin: 0 }}>Complete Medical History Archive</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Patient: {currentPatient.name} ({currentPatient.pid})</span>
                </div>
              </div>
              <button type="button" className="btn-modal-close" onClick={() => setShowAllHistoryModal(false)}>✕</button>
            </div>

            <div className="modal-window-body" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 600 }}>Showing all 4 recorded clinical admissions and outpatient encounters:</span>
                <button
                  type="button"
                  className="btn-table-action"
                  onClick={() => alert('Medical Record Summary exported as PDF!')}
                  style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe', fontWeight: 700 }}
                >
                  📥 Export Record Summary
                </button>
              </div>

              <div className="history-chain-list">
                {historyItems.map((item) => (
                  <div key={item.id} className="history-chain-item" style={{ marginBottom: '1.25rem' }}>
                    <span className="history-node-bullet" style={{ borderColor: item.color }}></span>
                    <span className="history-node-date" style={{ fontWeight: 700, color: item.color === '#94a3b8' ? '#64748b' : item.color }}>
                      {item.date}
                    </span>
                    <div className="history-node-content" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="h-title" style={{ fontSize: '1rem', color: '#0f172a' }}>{item.title}</div>
                        <span style={{ fontSize: '0.75rem', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, color: '#334155' }}>
                          {item.reportType}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, marginTop: '2px' }}>
                        Physician: {item.doctor}
                      </div>
                      <p style={{ fontSize: '0.82rem', color: '#334155', margin: '0.5rem 0', lineHeight: 1.5 }}>
                        {item.details}
                      </p>
                      <div style={{ fontSize: '0.78rem', color: '#059669', background: '#ecfdf5', padding: '0.4rem 0.65rem', borderRadius: '6px', fontWeight: 600 }}>
                        Lab: {item.labSummary}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 3: Add Medication */}
      {showAddMedicationModal && (
        <div className="modal-backdrop-overlay" onClick={() => setShowAddMedicationModal(false)}>
          <div className="modal-window-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-window-header">
              <h3>Prescribe Medication</h3>
              <button type="button" className="btn-modal-close" onClick={() => setShowAddMedicationModal(false)}>✕</button>
            </div>
            <form
              className="modal-window-body"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const newDrug = {
                  id: Date.now(),
                  drug: formData.get('drug'),
                  dosage: formData.get('dosage'),
                  route: formData.get('route') || 'Oral',
                  freq: formData.get('freq'),
                  duration: formData.get('duration'),
                  doctor: 'Dr. Amit Deshmukh',
                  status: 'Active',
                };
                setMedicationsList((prev) => [newDrug, ...prev]);
                setShowAddMedicationModal(false);
                alert('Prescription successfully saved and sent to Hospital Pharmacy!');
              }}
            >
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Drug / Medicine Name *</label>
                <input type="text" name="drug" required placeholder="e.g. Amoxicillin 500mg" className="ihms-input-field" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Dosage *</label>
                  <input type="text" name="dosage" required placeholder="e.g. 1 Tablet" className="ihms-input-field" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Route</label>
                  <select name="route" className="ihms-input-field" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="Oral">Oral (PO)</option>
                    <option value="IV Infusion">IV Infusion</option>
                    <option value="IM Injection">IM Injection</option>
                    <option value="Topical">Topical</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Frequency *</label>
                  <input type="text" name="freq" required placeholder="e.g. TDS (3 times / day)" className="ihms-input-field" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Duration *</label>
                  <input type="text" name="duration" required placeholder="e.g. 7 Days" className="ihms-input-field" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn-table-action" onClick={() => setShowAddMedicationModal(false)}>Cancel</button>
                <button type="submit" className="btn-table-action" style={{ background: '#2563eb', color: '#fff', borderColor: '#2563eb', fontWeight: 700 }}>Save & Prescribe</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL 4: Record Allergy Alert */}
      {showAddAllergyModal && (
        <div className="modal-backdrop-overlay" onClick={() => setShowAddAllergyModal(false)}>
          <div className="modal-window-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-window-header">
              <h3 style={{ color: '#dc2626' }}>⚠️ Record New Allergy Alert</h3>
              <button type="button" className="btn-modal-close" onClick={() => setShowAddAllergyModal(false)}>✕</button>
            </div>
            <form
              className="modal-window-body"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const newAllergy = {
                  id: Date.now(),
                  allergen: formData.get('allergen'),
                  type: formData.get('type') || 'Drug Allergy',
                  severity: formData.get('severity') || 'High',
                  reaction: formData.get('reaction'),
                  date: 'Today',
                  status: 'Verified',
                };
                setAllergiesList((prev) => [newAllergy, ...prev]);
                setShowAddAllergyModal(false);
                alert('Allergy alert recorded and flagged across clinical charts!');
              }}
            >
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Allergen / Substance *</label>
                <input type="text" name="allergen" required placeholder="e.g. Ciprofloxacin" className="ihms-input-field" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Allergy Type</label>
                  <select name="type" className="ihms-input-field" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="Drug Allergy">Drug Allergy</option>
                    <option value="Food Allergy">Food Allergy</option>
                    <option value="Environmental">Environmental</option>
                    <option value="Latex / Contact">Latex / Contact</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Severity</label>
                  <select name="severity" className="ihms-input-field" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    <option value="Severe">Severe (Anaphylaxis Risk)</option>
                    <option value="High">High</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Mild">Mild</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Observed Reaction Symptoms *</label>
                <input type="text" name="reaction" required placeholder="e.g. Generalized urticaria and pruritus" className="ihms-input-field" style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="btn-table-action" onClick={() => setShowAddAllergyModal(false)}>Cancel</button>
                <button type="submit" className="btn-table-action" style={{ background: '#dc2626', color: '#fff', borderColor: '#dc2626', fontWeight: 700 }}>Record Alert</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Update Patient Profile Photo (Image 2) */}
      {showPhotoModal && (
        <div className="modal-backdrop-overlay" onClick={() => setShowPhotoModal(false)}>
          <div className="modal-window-card" style={{ maxWidth: '580px', width: '92vw' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-window-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.25rem' }}>📷</span>
                <div>
                  <h3 style={{ margin: 0 }}>Update Patient Profile Photo</h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Upload custom photo, snap with camera, or select from curated AI medical portraits
                  </span>
                </div>
              </div>
              <button type="button" className="btn-modal-close" onClick={() => setShowPhotoModal(false)}>✕</button>
            </div>

            <div className="modal-window-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
              {/* Current Photo Preview Card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <img
                  src={patientAvatar}
                  alt={currentPatient.name}
                  style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover', border: '3px solid #2563eb' }}
                />
                <div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>{currentPatient.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Patient ID: {currentPatient.pid} · {currentPatient.gender}, {currentPatient.age} yrs</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn-table-action"
                      style={{ background: '#2563eb', color: '#ffffff', borderColor: '#2563eb', fontWeight: 700, fontSize: '0.76rem' }}
                      onClick={() => patientPhotoInputRef.current && patientPhotoInputRef.current.click()}
                    >
                      📁 Upload From Device
                    </button>
                    <button
                      type="button"
                      className="btn-table-action"
                      style={{ background: '#eff6ff', color: '#1d4ed8', borderColor: '#bfdbfe', fontWeight: 700, fontSize: '0.76rem' }}
                      onClick={() => setCameraActiveInModal(!cameraActiveInModal)}
                    >
                      📷 {cameraActiveInModal ? 'Hide Camera' : 'Open Camera'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Camera Viewfinder (if opened) */}
              {cameraActiveInModal && (
                <div style={{ background: '#0f172a', borderRadius: '12px', padding: '1rem', textAlign: 'center', marginBottom: '1.25rem', border: '2px dashed #3b82f6' }}>
                  <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>📸</div>
                    <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.88rem' }}>Webcam Active · Ready to Capture</div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>Center patient face within guide frame</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button
                      type="button"
                      className="btn-table-action"
                      style={{ background: '#2563eb', color: '#fff', borderColor: '#2563eb', fontWeight: 700 }}
                      onClick={() => {
                        saveAvatarFor(currentPatient.pid, '/avatars/patient_rahul.png');
                        setPhotoUpdateTick((t) => t + 1);
                        setCameraActiveInModal(false);
                        setShowPhotoModal(false);
                        alert(`Photo captured from camera and saved for ${currentPatient.name}!`);
                      }}
                    >
                      📸 Snap & Set as Photo
                    </button>
                    <button
                      type="button"
                      className="btn-table-action"
                      onClick={() => setCameraActiveInModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Curated AI Avatars Presets */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Or Select Pre-Configured High-Definition AI Portrait:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  {presetPatientAvatars.map((preset) => (
                    <div
                      key={preset.path}
                      onClick={() => {
                        saveAvatarFor(currentPatient.pid, preset.path);
                        setPhotoUpdateTick((t) => t + 1);
                        setShowPhotoModal(false);
                        alert(`Selected "${preset.label}" portrait for ${currentPatient.name}!`);
                      }}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '0.6rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.4rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#2563eb';
                        e.currentTarget.style.background = '#eff6ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.background = '#f8fafc';
                      }}
                    >
                      <img
                        src={preset.path}
                        alt={preset.label}
                        style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid #93c5fd' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/avatars/patient_rahul.png';
                        }}
                      />
                      <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a' }}>{preset.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <button type="button" className="btn-table-action" onClick={() => setShowPhotoModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
