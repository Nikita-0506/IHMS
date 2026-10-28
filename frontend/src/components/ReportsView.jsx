import React, { useState, useEffect } from 'react';
import { ALL_MONITORING_RECORDS, CLINICAL_REPORTS_ANALYTICS } from '../data/clinicalDataset';

export default function ReportsView({ onOpenPdfModal, onNavigateTab }) {
  // Top Sub-View Switcher: 'clinical_tracker' (2,500 CSV records) vs 'analytics' (System reports)
  const [activeSubView, setActiveSubView] = useState('clinical_tracker');

  // Tab 1 (Analytics) Filters & State
  const [reportType, setReportType] = useState('All Reports');
  const [dateRange, setDateRange] = useState('01 Oct 2026 - 14 Oct 2026');
  const [department, setDepartment] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [visitsRange, setVisitsRange] = useState('Last 7 Days');
  const [selectedReport, setSelectedReport] = useState(null);
  const [modalTab, setModalTab] = useState('overview');

  // Tab 2 (Patient Clinical Monitoring & Parameter Tracker) State
  const [patientSearch, setPatientSearch] = useState('');
  const [patientCareUnit, setPatientCareUnit] = useState('All Care Units');
  const [patientRiskLevel, setPatientRiskLevel] = useState('All Risk Levels');
  const [patientPage, setPatientPage] = useState(1);
  const [patientPageSize, setPatientPageSize] = useState(20);
  const [totalMonitoredCount, setTotalMonitoredCount] = useState(2500);
  const [criticalAlertsCount, setCriticalAlertsCount] = useState(346);
  const [mlModelInfo, setMlModelInfo] = useState({
    name: 'RandomForestClassifier (Patient Deterioration & Triage)',
    accuracy: 95.8,
    macro_f1: 0.884,
    db_concordance: 99.16,
    status: 'Active & Synced to PostgreSQL',
    dataset: 'patient_clinical_monitoring.csv (2,500 records)',
  });
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [selectedPatientModal, setSelectedPatientModal] = useState(null);
  const [patientModalTab, setPatientModalTab] = useState('vitals');

  // Doctor Generate Clinical Report Modal State
  const [isGenerateReportModalOpen, setIsGenerateReportModalOpen] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState('');
  const [reportFormData, setReportFormData] = useState({
    patient_id: 'PAT-002501',
    first_name: '',
    last_name: '',
    age: '',
    gender: 'Female',
    care_unit: 'General Ward',
    bed_no: 'GW 505',
    doctor_name: 'Dr. Amit Deshmukh',
    systolic_bp_mmhg: '120',
    diastolic_bp_mmhg: '80',
    spo2_percent: '98.5',
    blood_glucose_mg_dl: '100',
    heart_rate_bpm: '76',
    respiratory_rate_bpm: '18',
    temperature_c: '37.0',
    gcs_score: '15',
    pain_score: '2',
    urine_output_ml_hr: '50.0',
    ecg_rhythm: 'Sinus Rhythm',
    monitoring_level: 'Routine',
    deterioration_risk: 'Low',
    clinical_notes: '',
  });

  // Initial High-Fidelity Fallback Patient Records (Image 1 Dataset)
  const fallbackPatients = ALL_MONITORING_RECORDS;

  const [patientsData, setPatientsData] = useState(fallbackPatients);

  // Fetch Live Patient Monitoring Data from API
  useEffect(() => {
    let isMounted = true;
    const fetchPatients = async () => {
      setIsLoadingPatients(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', patientPage.toString());
        queryParams.set('page_size', patientPageSize.toString());

        if (patientSearch.trim()) {
          queryParams.set('search', patientSearch.trim());
        }
        if (patientCareUnit !== 'All Care Units') {
          queryParams.set('care_unit', patientCareUnit);
        }
        if (patientRiskLevel !== 'All Risk Levels') {
          if (patientRiskLevel === 'Routine') queryParams.set('deterioration_risk', 'Low');
          else if (patientRiskLevel === 'Enhanced') queryParams.set('deterioration_risk', 'Moderate');
          else if (patientRiskLevel === 'Critical') queryParams.set('deterioration_risk', 'High');
        }

        const res = await fetch(`/api/patients/monitoring/?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.results && data.results.length > 0) {
              setPatientsData(data.results);
            }
            if (data.count) {
              setTotalMonitoredCount(data.count);
            }
          }
        }
      } catch (err) {
        console.warn('Using client-side fallback monitoring data', err);
        // Instant full client-side search & filtering over 2,500 records
        let filtered = ALL_MONITORING_RECORDS;
        if (patientSearch.trim()) {
          const s = patientSearch.trim().toLowerCase();
          filtered = filtered.filter(p => (p.full_name?.toLowerCase().includes(s) || p.patient_id?.toLowerCase().includes(s) || p.city?.toLowerCase().includes(s)));
        }
        if (patientCareUnit !== 'All Care Units') {
          filtered = filtered.filter(p => p.care_unit === patientCareUnit);
        }
        if (patientRiskLevel !== 'All Risk Levels') {
          if (patientRiskLevel === 'Routine') filtered = filtered.filter(p => p.deterioration_risk === 'Low');
          else if (patientRiskLevel === 'Enhanced') filtered = filtered.filter(p => p.deterioration_risk === 'Moderate');
          else if (patientRiskLevel === 'Critical') filtered = filtered.filter(p => p.deterioration_risk === 'High');
        }
        if (isMounted) {
          setTotalMonitoredCount(filtered.length);
          const start = (patientPage - 1) * patientPageSize;
          setPatientsData(filtered.slice(start, start + patientPageSize));
        }
      } finally {
        if (isMounted) setIsLoadingPatients(false);
      }
    };

    fetchPatients();
    return () => {
      isMounted = false;
    };
  }, [patientPage, patientPageSize, patientSearch, patientCareUnit, patientRiskLevel]);

  // Fetch Live Summary Statistics from API
  useEffect(() => {
    let isMounted = true;
    fetch('/api/patients/monitoring/stats/')
      .then((r) => (r.ok ? r.json() : null))
      .then((stats) => {
        if (isMounted && stats) {
          if (stats.total_patients) setTotalMonitoredCount(stats.total_patients);
          if (stats.critical_alerts) setCriticalAlertsCount(stats.critical_alerts);
          if (stats.ml_model) setMlModelInfo(stats.ml_model);
        }
      })
      .catch((err) => console.warn('Monitoring stats fetch fallback:', err));
    return () => {
      isMounted = false;
    };
  }, []);

  const handleExportDatasetCsv = () => {
    try {
      const records = ALL_MONITORING_RECORDS && ALL_MONITORING_RECORDS.length > 0 ? ALL_MONITORING_RECORDS : patientsData;
      if (records && records.length > 0) {
        const headers = [
          'Patient_ID', 'First_Name', 'Last_Name', 'Date_of_Birth', 'Gender',
          'Phone', 'Email', 'City', 'Patient_Category', 'Allergy_Status',
          'Created_At', 'Record_Status', 'Care_Location_Type', 'Room_No',
          'Bed_No', 'Care_Unit', 'Monitoring_Level', 'Heart_Rate_bpm',
          'Systolic_BP_mmHg', 'Diastolic_BP_mmHg', 'Respiratory_Rate_bpm',
          'SpO2_percent', 'Temperature_C', 'Blood_Glucose_mg_dL', 'GCS_Score',
          'Pain_Score_0_10', 'ECG_Rhythm', 'Urine_Output_mL_hr',
          'Monitoring_Frequency', 'Deterioration_Risk', 'Risk_Score'
        ];
        const rows = records.map((p) => [
          p.patient_id, p.first_name, p.last_name, p.date_of_birth, p.gender,
          p.phone, p.email, p.city, p.patient_category, `"${p.allergy_status || ''}"`,
          p.created_at, p.record_status, `"${p.care_location_type || ''}"`, p.room_no,
          p.bed_no, `"${p.care_unit || ''}"`, p.monitoring_level, p.heart_rate_bpm,
          p.systolic_bp_mmhg, p.diastolic_bp_mmhg, p.respiratory_rate_bpm,
          p.spo2_percent, p.temperature_c, p.blood_glucose_mg_dl, p.gcs_score,
          p.pain_score_0_10, `"${p.ecg_rhythm || ''}"`, p.urine_output_ml_hr,
          `"${p.monitoring_frequency || ''}"`, p.deterioration_risk, p.risk_score
        ]);
        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `patient_clinical_monitoring_dataset_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
    } catch (e) {
      console.warn('Direct CSV download fallback error:', e);
    }
    window.location.href = '/api/patients/monitoring/export-csv/';
  };

  // Tab 1 Reports List
  const reportsList = CLINICAL_REPORTS_ANALYTICS;

  // Filtering for Tab 1
  const filteredReports = reportsList.filter((r) => {
    if (reportType !== 'All Reports' && r.type.toLowerCase() !== reportType.toLowerCase()) {
      return false;
    }
    if (department !== 'All Departments' && r.dept !== department && r.dept !== 'All Departments') {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.dept.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Download Individual Patient HTML Report
  const handleDownloadPatientReport = (patientId) => {
    const downloadUrl = `/patients/reports/${patientId}/download/`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${patientId}_clinical_report.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderRowIcon = (iconType, color) => {
    switch (iconType) {
      case 'user':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case 'calendar':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case 'flask':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2v7.31a2 2 0 0 1-.58 1.42L3 17.15A2 2 0 0 0 4.41 20.6h15.18A2 2 0 0 0 21 17.15l-6.42-6.42A2 2 0 0 1 14 9.31V2" />
          </svg>
        );
      case 'pill':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
            <path d="m8.5 8.5 7 7" />
          </svg>
        );
      case 'arrow':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        );
      case 'chart':
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        );
    }
  };

  const handleGenerateReportSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReport(true);

    const fName = reportFormData.first_name.trim() || 'Patient';
    const lName = reportFormData.last_name.trim() || 'Record';
    const fullName = `${fName} ${lName}`.trim();
    const pid = reportFormData.patient_id.trim() || `PAT-00${Math.floor(2500 + Math.random() * 900)}`;

    const newRecord = {
      patient_id: pid,
      first_name: fName,
      last_name: lName,
      full_name: fullName,
      age: parseInt(reportFormData.age, 10) || 45,
      gender: reportFormData.gender,
      care_unit: reportFormData.care_unit,
      care_location_type: reportFormData.care_unit,
      bed_no: reportFormData.bed_no.trim() || 'GW 505',
      systolic_bp_mmhg: parseFloat(reportFormData.systolic_bp_mmhg) || 120.0,
      diastolic_bp_mmhg: parseFloat(reportFormData.diastolic_bp_mmhg) || 80.0,
      spo2_percent: parseFloat(reportFormData.spo2_percent) || 98.0,
      blood_glucose_mg_dl: parseFloat(reportFormData.blood_glucose_mg_dl) || 100.0,
      heart_rate_bpm: parseFloat(reportFormData.heart_rate_bpm) || 75.0,
      respiratory_rate_bpm: parseFloat(reportFormData.respiratory_rate_bpm) || 18.0,
      temperature_c: parseFloat(reportFormData.temperature_c) || 37.0,
      gcs_score: parseInt(reportFormData.gcs_score, 10) || 15,
      pain_score: parseInt(reportFormData.pain_score, 10) || 2,
      urine_output_ml_hr: parseFloat(reportFormData.urine_output_ml_hr) || 45.0,
      ecg_rhythm: reportFormData.ecg_rhythm,
      monitoring_level: reportFormData.monitoring_level,
      deterioration_risk: reportFormData.deterioration_risk,
      clinical_notes: reportFormData.clinical_notes || 'Patient vitals evaluated by attending doctor.',
      doctor_name: reportFormData.doctor_name || 'Dr. Amit Deshmukh',
      created_at_record: new Date().toISOString(),
      city: 'Pune',
    };

    try {
      await fetch('/api/patients/monitoring/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: newRecord.patient_id,
          first_name: newRecord.first_name,
          last_name: newRecord.last_name,
          age: newRecord.age,
          gender: newRecord.gender,
          care_unit: newRecord.care_unit,
          care_location_type: newRecord.care_unit,
          bed_no: newRecord.bed_no,
          systolic_bp_mmhg: newRecord.systolic_bp_mmhg,
          diastolic_bp_mmhg: newRecord.diastolic_bp_mmhg,
          spo2_percent: newRecord.spo2_percent,
          blood_glucose_mg_dl: newRecord.blood_glucose_mg_dl,
          heart_rate_bpm: newRecord.heart_rate_bpm,
          respiratory_rate_bpm: newRecord.respiratory_rate_bpm,
          temperature_c: newRecord.temperature_c,
          gcs_score: newRecord.gcs_score,
          pain_score: newRecord.pain_score,
          urine_output_ml_hr: newRecord.urine_output_ml_hr,
          ecg_rhythm: newRecord.ecg_rhythm,
          monitoring_level: newRecord.monitoring_level,
          deterioration_risk: newRecord.deterioration_risk,
        }),
      });
    } catch (err) {
      console.warn('Sync to backend API failed, updating client-side tracker state:', err);
    }

    setPatientsData((prev) => [newRecord, ...prev]);
    setTotalMonitoredCount((prev) => prev + 1);
    if (newRecord.monitoring_level === 'High Risk' || newRecord.monitoring_level === 'Critical') {
      setCriticalAlertsCount((prev) => prev + 1);
    }

    setActiveSubView('clinical_tracker');
    setIsSubmittingReport(false);
    setIsGenerateReportModalOpen(false);

    // Automatically open the newly generated patient clinical report modal
    setSelectedPatientModal(newRecord);

    setFormSuccessMessage(`Clinical Monitoring Report generated successfully for ${newRecord.patient_id} (${newRecord.full_name})!`);
    setTimeout(() => setFormSuccessMessage(''), 7000);
  };

  const handleFillSampleReportData = () => {
    setReportFormData({
      patient_id: `PAT-00${Math.floor(2500 + Math.random() * 900)}`,
      first_name: 'Siddharth',
      last_name: 'Kulkarni',
      age: '48',
      gender: 'Male',
      care_unit: 'General Ward',
      bed_no: 'GW 508',
      doctor_name: 'Dr. Amit Deshmukh',
      systolic_bp_mmhg: '124',
      diastolic_bp_mmhg: '82',
      spo2_percent: '98.2',
      blood_glucose_mg_dl: '108',
      heart_rate_bpm: '78',
      respiratory_rate_bpm: '17',
      temperature_c: '36.9',
      gcs_score: '15',
      pain_score: '2',
      urine_output_ml_hr: '52.0',
      ecg_rhythm: 'Sinus Rhythm',
      monitoring_level: 'Routine',
      deterioration_risk: 'Low',
      clinical_notes: 'Post-operative monitoring stable. Vitals normal. Regular diet initiated.',
    });
  };

  return (
    <div className="ihms-scroll-viewport reports-view-page">
      {/* 1. Page Header */}
      <div className="reports-top-header">
        <div className="reports-header-left">
          <button
            type="button"
            className="reports-header-back-btn"
            onClick={() => {
              if (activeSubView === 'clinical_tracker') {
                setActiveSubView('analytics');
              } else if (onNavigateTab) {
                onNavigateTab('dashboard');
              }
            }}
            title={activeSubView === 'clinical_tracker' ? 'Back to System & Department Reports' : 'Back to Dashboard'}
            aria-label="Back"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="reports-header-icon-box">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="12" width="4" height="9" rx="1.5" fill="#0066ff" />
              <rect x="10" y="6" width="4" height="15" rx="1.5" fill="#0066ff" />
              <rect x="17" y="9" width="4" height="12" rx="1.5" fill="#0066ff" />
            </svg>
          </div>
          <div className="reports-header-text">
            <h2 className="reports-main-title">Reports</h2>
            <p className="reports-main-desc">Generate and view reports to gain insights and improve patient care</p>
          </div>
        </div>

        <div className="reports-header-right">
          <img
            src="/mascot_reports.png"
            alt="Reports Mascot"
            className="reports-header-mascot"
          />
          <button
            type="button"
            className="reports-generate-btn"
            onClick={() => {
              setReportFormData(prev => ({
                ...prev,
                patient_id: `PAT-00${Math.floor(2500 + Math.random() * 900)}`,
                first_name: '',
                last_name: '',
                age: '',
              }));
              setIsGenerateReportModalOpen(true);
            }}
            title="Open Doctor Clinical Report Entry Form"
          >
            <span className="reports-plus-icon">+</span> Generate Report
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {formSuccessMessage && (
        <div className="report-success-banner">
          <div className="report-success-content">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{formSuccessMessage}</span>
          </div>
          <button type="button" onClick={() => setFormSuccessMessage('')} className="report-success-close">✕</button>
        </div>
      )}

      {/* 2. Unified In-Built View Mode Switcher (Seamless Tab Control) */}
      <div className="reports-mode-switcher-container">
        <div className="reports-mode-switcher">
          <button
            type="button"
            className={`reports-mode-tab ${activeSubView === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveSubView('analytics')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            System & Department Reports
          </button>

          <button
            type="button"
            className={`reports-mode-tab ${activeSubView === 'clinical_tracker' ? 'active' : ''}`}
            onClick={() => setActiveSubView('clinical_tracker')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            Patient Clinical Monitoring & Parameter Tracker
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: SYSTEM & DEPARTMENT ANALYTICS REPORTS (IMAGE 2 UI)                */}
      {/* ========================================================================= */}
      {activeSubView === 'analytics' && (
        <>
          {/* Four KPI Metric Cards Row */}
          <div className="reports-kpi-grid">
            {/* Total Patients */}
            <div className="reports-kpi-card" onClick={() => setActiveSubView('clinical_tracker')} style={{ cursor: 'pointer' }} title="Click to view Patient Parameter Tracker">
              <div className="reports-kpi-icon-circle bg-blue-light">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="reports-kpi-info">
                <div className="reports-kpi-val-row">
                  <span className="reports-kpi-number">1,248</span>
                  <span className="reports-kpi-trend-pill">↑ 12%</span>
                  <span className="reports-kpi-trend-note">vs last month</span>
                </div>
                <div className="reports-kpi-label">Total Patients</div>
              </div>
            </div>

            {/* Appointments */}
            <div className="reports-kpi-card">
              <div className="reports-kpi-icon-circle bg-green-light">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="reports-kpi-info">
                <div className="reports-kpi-val-row">
                  <span className="reports-kpi-number">320</span>
                  <span className="reports-kpi-trend-pill">↑ 8%</span>
                  <span className="reports-kpi-trend-note">vs last month</span>
                </div>
                <div className="reports-kpi-label">Appointments</div>
              </div>
            </div>

            {/* Lab Tests */}
            <div className="reports-kpi-card">
              <div className="reports-kpi-icon-circle bg-purple-light">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 2v7.31a2 2 0 0 1-.58 1.42L3 17.15A2 2 0 0 0 4.41 20.6h15.18A2 2 0 0 0 21 17.15l-6.42-6.42A2 2 0 0 1 14 9.31V2" />
                </svg>
              </div>
              <div className="reports-kpi-info">
                <div className="reports-kpi-val-row">
                  <span className="reports-kpi-number">186</span>
                  <span className="reports-kpi-trend-pill">↑ 15%</span>
                  <span className="reports-kpi-trend-note">vs last month</span>
                </div>
                <div className="reports-kpi-label">Lab Tests</div>
              </div>
            </div>

            {/* Pharmacy Orders */}
            <div className="reports-kpi-card">
              <div className="reports-kpi-icon-circle bg-peach-light">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
                  <path d="m8.5 8.5 7 7" />
                </svg>
              </div>
              <div className="reports-kpi-info">
                <div className="reports-kpi-val-row">
                  <span className="reports-kpi-number">154</span>
                  <span className="reports-kpi-trend-pill">↑ 10%</span>
                  <span className="reports-kpi-trend-note">vs last month</span>
                </div>
                <div className="reports-kpi-label">Pharmacy Orders</div>
              </div>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="reports-filters-toolbar">
            <div className="reports-filter-col">
              <label className="reports-filter-label">Report Type</label>
              <div className="reports-select-box">
                <select
                  value={reportType}
                  onChange={(e) => {
                    setReportType(e.target.value);
                    if (e.target.value === 'Patient') {
                      setActiveSubView('clinical_tracker');
                    }
                  }}
                  className="reports-select-control"
                >
                  <option value="All Reports">All Reports</option>
                  <option value="Patient">Patient</option>
                  <option value="Appointment">Appointment</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Referral">Referral</option>
                  <option value="Department">Department</option>
                </select>
                <svg className="reports-select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            <div className="reports-filter-col">
              <label className="reports-filter-label">Date Range</label>
              <div className="reports-select-box reports-date-box">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="reports-select-control"
                >
                  <option value="01 Oct 2026 - 14 Oct 2026">01 Oct 2026 - 14 Oct 2026</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="Current Quarter">Current Quarter</option>
                </select>
              </div>
            </div>

            <div className="reports-filter-col">
              <label className="reports-filter-label">Department</label>
              <div className="reports-select-box">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="reports-select-control"
                >
                  <option value="All Departments">All Departments</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                </select>
                <svg className="reports-select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            <div className="reports-filter-buttons">
              <button type="button" className="reports-apply-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Apply Filters
              </button>
              <button
                type="button"
                className="reports-reset-btn"
                onClick={() => {
                  setReportType('All Reports');
                  setDateRange('01 Oct 2026 - 14 Oct 2026');
                  setDepartment('All Departments');
                  setSearchQuery('');
                }}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Upper Row: Two Analytics Charts */}
          <div className="reports-charts-row">
            {/* Left Chart: Patient Visits Area/Line Chart */}
            <div className="reports-chart-card patient-visits-card">
              <div className="reports-card-header">
                <div className="reports-card-title-flex">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="12" width="3.5" height="9" rx="1" fill="#0066ff" />
                    <rect x="9.5" y="6" width="3.5" height="15" rx="1" fill="#0066ff" />
                    <rect x="16" y="9" width="3.5" height="12" rx="1" fill="#0066ff" />
                  </svg>
                  <h3 className="reports-card-title">Patient Visits</h3>
                </div>
                <div className="reports-dropdown-badge">
                  <select
                    value={visitsRange}
                    onChange={(e) => setVisitsRange(e.target.value)}
                    className="reports-chart-select"
                  >
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 14 Days">Last 14 Days</option>
                    <option value="This Month">This Month</option>
                  </select>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              <div className="reports-chart-viewport">
                <svg viewBox="0 0 540 190" className="reports-area-svg">
                  <defs>
                    <linearGradient id="patientVisitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0066ff" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#0066ff" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="36" y1="25" x2="520" y2="25" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="36" y1="55" x2="520" y2="55" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="36" y1="85" x2="520" y2="85" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="36" y1="115" x2="520" y2="115" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="36" y1="145" x2="520" y2="145" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="36" y1="165" x2="520" y2="165" stroke="#e2e8f0" strokeWidth="1" />

                  {/* Y Axis Numbers */}
                  <text x="24" y="29" fontSize="10" fill="#94a3b8" textAnchor="end">50</text>
                  <text x="24" y="59" fontSize="10" fill="#94a3b8" textAnchor="end">40</text>
                  <text x="24" y="89" fontSize="10" fill="#94a3b8" textAnchor="end">30</text>
                  <text x="24" y="119" fontSize="10" fill="#94a3b8" textAnchor="end">20</text>
                  <text x="24" y="149" fontSize="10" fill="#94a3b8" textAnchor="end">10</text>
                  <text x="24" y="169" fontSize="10" fill="#94a3b8" textAnchor="end">0</text>

                  {/* Gradient Area */}
                  <path
                    d="M 50 120 L 125 98 L 200 106 L 275 80 L 350 98 L 425 65 L 500 80 L 500 165 L 50 165 Z"
                    fill="url(#patientVisitGradient)"
                  />

                  {/* Smooth Line */}
                  <path
                    d="M 50 120 L 125 98 L 200 106 L 275 80 L 350 98 L 425 65 L 500 80"
                    fill="none"
                    stroke="#0066ff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Data points */}
                  {[
                    { cx: 50, cy: 120, day: '8 Oct' },
                    { cx: 125, cy: 98, day: '9 Oct' },
                    { cx: 200, cy: 106, day: '10 Oct' },
                    { cx: 275, cy: 80, day: '11 Oct' },
                    { cx: 350, cy: 98, day: '12 Oct' },
                    { cx: 425, cy: 65, day: '13 Oct' },
                    { cx: 500, cy: 80, day: '14 Oct' },
                  ].map((pt, i) => (
                    <g key={i}>
                      <circle cx={pt.cx} cy={pt.cy} r="4" fill="#0066ff" stroke="#ffffff" strokeWidth="2" />
                      <text x={pt.cx} y="180" fontSize="10" fill="#64748b" textAnchor="middle">{pt.day}</text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Right Chart: Reports by Department Donut Chart */}
            <div className="reports-chart-card dept-donut-card">
              <div className="reports-card-header">
                <div className="reports-card-title-flex">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="7" height="7" rx="1.5" fill="#0066ff" />
                    <rect x="14" y="4" width="7" height="7" rx="1.5" fill="#0066ff" />
                    <rect x="3" y="13" width="7" height="7" rx="1.5" fill="#0066ff" />
                    <rect x="14" y="13" width="7" height="7" rx="1.5" fill="#0066ff" />
                  </svg>
                  <h3 className="reports-card-title">Reports by Department</h3>
                </div>
              </div>

              <div className="reports-donut-body">
                <div className="reports-donut-graphic">
                  <svg viewBox="0 0 160 160" className="reports-donut-svg">
                    {/* General Medicine 28% */}
                    <circle cx="80" cy="80" r="54" fill="none" stroke="#2563eb" strokeWidth="22" strokeDasharray="95 244" strokeDashoffset="0" />
                    {/* Pediatrics 18% */}
                    <circle cx="80" cy="80" r="54" fill="none" stroke="#10b981" strokeWidth="22" strokeDasharray="61 278" strokeDashoffset="-95" />
                    {/* Orthopedics 15% */}
                    <circle cx="80" cy="80" r="54" fill="none" stroke="#f59e0b" strokeWidth="22" strokeDasharray="51 288" strokeDashoffset="-156" />
                    {/* Dermatology 12% */}
                    <circle cx="80" cy="80" r="54" fill="none" stroke="#0284c7" strokeWidth="22" strokeDasharray="41 298" strokeDashoffset="-207" />
                    {/* Cardiology 10% */}
                    <circle cx="80" cy="80" r="54" fill="none" stroke="#ec4899" strokeWidth="22" strokeDasharray="34 305" strokeDashoffset="-248" />
                    {/* Others 17% */}
                    <circle cx="80" cy="80" r="54" fill="none" stroke="#94a3b8" strokeWidth="22" strokeDasharray="58 281" strokeDashoffset="-282" />

                    {/* Donut Center */}
                    <circle cx="80" cy="80" r="42" fill="#ffffff" />
                    <text x="80" y="78" textAnchor="middle" fontSize="19" fontWeight="800" fill="#0f172a">320</text>
                    <text x="80" y="93" textAnchor="middle" fontSize="10" fontWeight="600" fill="#64748b">Total</text>
                  </svg>
                </div>

                <div className="reports-donut-legend">
                  <div className="reports-legend-item">
                    <span className="reports-legend-dot" style={{ background: '#2563eb' }}></span>
                    <span className="reports-legend-label">General Medicine</span>
                    <span className="reports-legend-percent">28%</span>
                  </div>
                  <div className="reports-legend-item">
                    <span className="reports-legend-dot" style={{ background: '#10b981' }}></span>
                    <span className="reports-legend-label">Pediatrics</span>
                    <span className="reports-legend-percent">18%</span>
                  </div>
                  <div className="reports-legend-item">
                    <span className="reports-legend-dot" style={{ background: '#f59e0b' }}></span>
                    <span className="reports-legend-label">Orthopedics</span>
                    <span className="reports-legend-percent">15%</span>
                  </div>
                  <div className="reports-legend-item">
                    <span className="reports-legend-dot" style={{ background: '#0284c7' }}></span>
                    <span className="reports-legend-label">Dermatology</span>
                    <span className="reports-legend-percent">12%</span>
                  </div>
                  <div className="reports-legend-item">
                    <span className="reports-legend-dot" style={{ background: '#ec4899' }}></span>
                    <span className="reports-legend-label">Cardiology</span>
                    <span className="reports-legend-percent">10%</span>
                  </div>
                  <div className="reports-legend-item">
                    <span className="reports-legend-dot" style={{ background: '#94a3b8' }}></span>
                    <span className="reports-legend-label">Others</span>
                    <span className="reports-legend-percent">17%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lower Row: Reports Table Left + Insights & Quick Reports Right */}
          <div className="reports-bottom-row">
            {/* Left Column: Reports Table Card */}
            <div className="reports-table-card">
              <div className="reports-table-header">
                <div className="reports-table-title-group">
                  <div className="reports-table-icon-wrap">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <line x1="10" y1="9" x2="8" y2="9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="reports-table-title">Reports</h3>
                    <p className="reports-table-subtitle">Access and download various reports</p>
                  </div>
                </div>

                <div className="reports-search-box">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="reports-search-field"
                  />
                </div>
              </div>

              <div className="reports-table-container">
                <table className="reports-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '4%' }}>#</th>
                      <th style={{ width: '22%' }}>Report Name</th>
                      <th style={{ width: '10%' }}>Type</th>
                      <th style={{ width: '16%' }}>Department</th>
                      <th style={{ width: '22%' }}>Date Range</th>
                      <th style={{ width: '20%' }}>Generated On</th>
                      <th style={{ width: '6%', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="reports-table-row">
                        <td className="cell-index">{report.num}</td>
                        <td className="cell-report-name">
                          <div className="report-name-flex">
                            <div
                              className="report-circle-icon"
                              style={{ background: report.iconBg }}
                            >
                              {renderRowIcon(report.iconType, report.iconColor)}
                            </div>
                            <span
                              className="report-title-text"
                              onClick={() => {
                                if (report.type === 'Patient') {
                                  setActiveSubView('clinical_tracker');
                                } else {
                                  setSelectedReport(report);
                                  setModalTab('overview');
                                }
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              {report.name}
                            </span>
                          </div>
                        </td>
                        <td className="cell-type">
                          {report.type === 'Patient' ? (
                            <span
                              className="report-type-interactive-pill"
                              onClick={() => setActiveSubView('clinical_tracker')}
                              title="Open Patient Parameter Tracker"
                            >
                              Patient 🩺
                            </span>
                          ) : (
                            report.type
                          )}
                        </td>
                        <td className="cell-dept">{report.dept}</td>
                        <td className="cell-date">{report.dateRange}</td>
                        <td className="cell-generated">{report.generatedOn}</td>
                        <td className="cell-actions">
                          <div className="reports-action-flex">
                            <button
                              type="button"
                              className="reports-view-pill-btn"
                              onClick={() => {
                                if (report.type === 'Patient') {
                                  setActiveSubView('clinical_tracker');
                                } else {
                                  setSelectedReport(report);
                                  setModalTab('overview');
                                }
                              }}
                            >
                              View
                            </button>
                            <button type="button" className="reports-dots-menu-btn" title="More Options">
                              ⋮
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Insights Banner & Quick Reports Stack */}
            <div className="reports-side-stack">
              {/* Insights for Better Care Banner */}
              <div className="reports-insights-card">
                <div className="insights-badge-pill">
                  <span>💡</span> Insights for Better Care
                </div>
                <h4 className="insights-heading">
                  Generate reports quickly and make data-driven decisions.
                </h4>
                <div className="insights-illustration-wrap">
                  <img
                    src="/mascot_reports.png"
                    alt="Insights Graphic"
                    className="insights-graphic-img"
                  />
                </div>
              </div>

              {/* Quick Reports Widget */}
              <div className="reports-quick-card">
                <div className="reports-quick-header">
                  <span className="quick-lightning-icon">⚡</span>
                  <h4 className="quick-title">Quick Reports</h4>
                </div>

                <div className="reports-quick-list">
                  <div
                    className="reports-quick-item"
                    onClick={() => setActiveSubView('clinical_tracker')}
                    title="Directly opens Clinical Patient Tracker"
                  >
                    <div className="quick-item-left">
                      <div className="quick-icon-circle bg-blue-light">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <span className="quick-item-name">Patient Report</span>
                    </div>
                    <span className="quick-chevron">›</span>
                  </div>

                  <div
                    className="reports-quick-item"
                    onClick={() => setSelectedReport(reportsList[1])}
                  >
                    <div className="quick-item-left">
                      <div className="quick-icon-circle bg-purple-light">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                      <span className="quick-item-name">Appointment Report</span>
                    </div>
                    <span className="quick-chevron">›</span>
                  </div>

                  <div
                    className="reports-quick-item"
                    onClick={() => setSelectedReport(reportsList[2])}
                  >
                    <div className="quick-item-left">
                      <div className="quick-icon-circle bg-amber-light">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10 2v7.31a2 2 0 0 1-.58 1.42L3 17.15A2 2 0 0 0 4.41 20.6h15.18A2 2 0 0 0 21 17.15l-6.42-6.42A2 2 0 0 1 14 9.31V2" />
                        </svg>
                      </div>
                      <span className="quick-item-name">Lab Report</span>
                    </div>
                    <span className="quick-chevron">›</span>
                  </div>

                  <div
                    className="reports-quick-item"
                    onClick={() => setSelectedReport(reportsList[3])}
                  >
                    <div className="quick-item-left">
                      <div className="quick-icon-circle bg-red-light">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
                          <path d="m8.5 8.5 7 7" />
                        </svg>
                      </div>
                      <span className="quick-item-name">Pharmacy Report</span>
                    </div>
                    <span className="quick-chevron">›</span>
                  </div>

                  <div
                    className="reports-quick-item"
                    onClick={() => setSelectedReport(reportsList[4])}
                  >
                    <div className="quick-item-left">
                      <div className="quick-icon-circle bg-green-light">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="7" y1="17" x2="17" y2="7" />
                          <polyline points="7 7 17 7 17 17" />
                        </svg>
                      </div>
                      <span className="quick-item-name">Referral Report</span>
                    </div>
                    <span className="quick-chevron">›</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: PATIENT CLINICAL MONITORING & PARAMETER TRACKER (IN-BUILT UI)     */}
      {/* ========================================================================= */}
      {activeSubView === 'clinical_tracker' && (
        <div className="clinical-tracker-container">


          {/* Top 3 KPI Metrics Row (Matching Image 2) */}
          <div className="reports-kpi-grid clinical-kpi-grid clinical-kpi-3col">
            {/* 1. Total Monitored */}
            <div className="reports-kpi-card clinical-stat-card">
              <div className="clinical-stat-icon-wrap icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="clinical-card-content">
                <span className="clinical-metric-label">TOTAL MONITORED</span>
                <span className="clinical-metric-value text-blue">{Number(totalMonitoredCount).toLocaleString()}</span>
                <span className="clinical-metric-sub">Active Patient Vitals</span>
              </div>
              <div className="clinical-card-corner-badge badge-blue" title="Active Monitoring">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
            </div>

            {/* 2. Critical Alerts */}
            <div className="reports-kpi-card clinical-stat-card">
              <div className="clinical-stat-icon-wrap icon-red">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                  <path d="M4 2C2.8 3.7 2 5.7 2 8" />
                  <path d="M22 8c0-2.3-.8-4.3-2-6" />
                </svg>
              </div>
              <div className="clinical-card-content">
                <span className="clinical-metric-label">CRITICAL ALERTS</span>
                <span className="clinical-metric-value text-red">{criticalAlertsCount}</span>
                <span className="clinical-metric-sub">Requires Urgent Attention</span>
              </div>
              <div className="clinical-card-corner-badge badge-red" title="Critical Alerts Trend">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </div>
            </div>

            {/* 3. Individual Reports Status */}
            <div className="reports-kpi-card clinical-stat-card">
              <div className="clinical-stat-icon-wrap icon-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <path d="m9 15 2 2 4-4" />
                </svg>
              </div>
              <div className="clinical-card-content">
                <span className="clinical-metric-label">INDIVIDUAL REPORTS</span>
                <span className="clinical-metric-value text-green">Active (Ready)</span>
                <span className="clinical-metric-sub">Real Time Parameter Tracking</span>
              </div>
              <div className="clinical-card-corner-badge badge-green" title="Reports Ready">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar (Matching Image 2 with Icons) */}
          <div className="reports-filters-toolbar clinical-filters-toolbar">
            {/* Search Input */}
            <div className="clinical-search-wrapper">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search Patient ID, Name, City, or Ward..."
                value={patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  setPatientPage(1);
                }}
                className="clinical-search-input"
              />
            </div>

            {/* Care Unit Select with Users Icon */}
            <div className="reports-filter-col clinical-filter-col">
              <div className="reports-select-box clinical-select-box">
                <svg className="select-inner-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <select
                  value={patientCareUnit}
                  onChange={(e) => {
                    setPatientCareUnit(e.target.value);
                    setPatientPage(1);
                  }}
                  className="reports-select-control clinical-select-control"
                >
                  <option value="All Care Units">All Care Units</option>
                  <option value="General Ward">General Ward</option>
                  <option value="Private Inpatient Unit">Private Inpatient Unit</option>
                  <option value="Emergency Department">Emergency Department</option>
                  <option value="ICU">ICU</option>
                  <option value="ICU / Critical Care">ICU / Critical Care</option>
                </select>
                <svg className="reports-select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Risk Level Select with Shield Icon */}
            <div className="reports-filter-col clinical-filter-col">
              <div className="reports-select-box clinical-select-box">
                <svg className="select-inner-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <select
                  value={patientRiskLevel}
                  onChange={(e) => {
                    setPatientRiskLevel(e.target.value);
                    setPatientPage(1);
                  }}
                  className="reports-select-control clinical-select-control"
                >
                  <option value="All Risk Levels">All Risk Levels</option>
                  <option value="Routine">Routine</option>
                  <option value="High Risk">High Risk</option>
                  <option value="Enhanced">Enhanced</option>
                  <option value="Critical">Critical</option>
                </select>
                <svg className="reports-select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="reports-filter-buttons clinical-filter-actions">
              <button
                type="button"
                className="reports-apply-btn clinical-apply-btn"
                onClick={() => setPatientPage(1)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Filter
              </button>
              <button
                type="button"
                className="reports-reset-btn clinical-reset-btn"
                onClick={() => {
                  setPatientSearch('');
                  setPatientCareUnit('All Care Units');
                  setPatientRiskLevel('All Risk Levels');
                  setPatientPage(1);
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 16h5v5" />
                </svg>
                Reset
              </button>
            </div>
          </div>

          {/* Clinical Patient Monitoring Table (Matching Image 2 Perfectly) */}
          <div className="reports-table-card clinical-table-card">
            <div className="reports-table-header clinical-table-header">
              <div className="reports-table-title-group">
                <div className="reports-table-icon-wrap bg-blue-light">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div>
                  <h3 className="reports-table-title">Individual Patient Parameter Tracker</h3>
                  <p className="reports-table-subtitle">
                    Real-time physiological stream, deterioration risk, and individualized medical reports
                  </p>
                </div>
              </div>

              <div className="clinical-header-stream-group">
                <div className="clinical-header-stats-badge">
                  <span className="dot-live"></span>
                  <span>Live EHR Stream ({patientsData.length} Shown)</span>
                </div>
                <button
                  type="button"
                  className="clinical-export-csv-btn"
                  onClick={handleExportDatasetCsv}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '0.45rem 1rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#0369a1';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#0284c7';
                    e.currentTarget.style.transform = 'none';
                  }}
                  title="Export complete 2,500 patient monitoring records to CSV"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  className="clinical-reload-stream-btn"
                  onClick={() => setPatientPage(1)}
                  title="Reload Live Stream"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 16h5v5" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="reports-table-container">
              <table className="reports-data-table clinical-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '9%' }}>
                      <div className="th-flex-align">
                        PATIENT ID
                        <svg className="th-sort-arrows" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2">
                          <path d="m7 15 5 5 5-5" />
                          <path d="m7 9 5-5 5 5" />
                        </svg>
                      </div>
                    </th>
                    <th style={{ width: '13%' }}>PATIENT NAME</th>
                    <th style={{ width: '10%' }}>
                      <div className="th-flex-align">
                        AGE / GENDER
                        <svg className="th-sort-arrows" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2">
                          <path d="m7 15 5 5 5-5" />
                          <path d="m7 9 5-5 5 5" />
                        </svg>
                      </div>
                    </th>
                    <th style={{ width: '16%' }}>
                      <div className="th-flex-align">
                        CARE LOCATION
                        <svg className="th-sort-arrows" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2">
                          <path d="m7 15 5 5 5-5" />
                          <path d="m7 9 5-5 5 5" />
                        </svg>
                      </div>
                    </th>
                    <th style={{ width: '8%' }}>
                      <div className="th-flex-align">
                        BP (mmHg)
                        <svg className="th-sort-arrows" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2">
                          <path d="m7 15 5 5 5-5" />
                          <path d="m7 9 5-5 5 5" />
                        </svg>
                      </div>
                    </th>
                    <th style={{ width: '8%' }}>
                      <div className="th-flex-align">
                        SpO₂ (%)
                        <svg className="th-sort-arrows" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2">
                          <path d="m7 15 5 5 5-5" />
                          <path d="m7 9 5-5 5 5" />
                        </svg>
                      </div>
                    </th>
                    <th style={{ width: '9%' }}>
                      <div className="th-flex-align">
                        GLUCOSE (mg/dL)
                        <svg className="th-sort-arrows" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2">
                          <path d="m7 15 5 5 5-5" />
                          <path d="m7 9 5-5 5 5" />
                        </svg>
                      </div>
                    </th>
                    <th style={{ width: '7%' }}>
                      <div className="th-flex-align">
                        HR (bpm)
                        <svg className="th-sort-arrows" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2">
                          <path d="m7 15 5 5 5-5" />
                          <path d="m7 9 5-5 5 5" />
                        </svg>
                      </div>
                    </th>
                    <th style={{ width: '11%' }}>
                      <div className="th-flex-align">
                        MONITORING LEVEL
                        <svg className="th-sort-arrows" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2">
                          <path d="m7 15 5 5 5-5" />
                          <path d="m7 9 5-5 5 5" />
                        </svg>
                      </div>
                    </th>
                    <th style={{ width: '10%', textAlign: 'center' }}>PATIENT REPORT</th>
                    <th style={{ width: '4%', textAlign: 'center' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {patientsData.map((pt, idx) => {
                    const sbp = pt.systolic_bp_mmhg || 120;
                    const dbp = pt.diastolic_bp_mmhg || 80;
                    const spo2 = pt.spo2_percent || 98;
                    const glucose = pt.blood_glucose_mg_dl || 100;
                    const hr = pt.heart_rate_bpm || 75;

                    const monitoringLevel = pt.monitoring_level || 'Routine';
                    const isHighRisk =
                      monitoringLevel === 'High Risk' ||
                      monitoringLevel === 'Critical' ||
                      (pt.deterioration_risk && pt.deterioration_risk.toLowerCase() === 'high');

                    const isIcu =
                      pt.care_unit === 'ICU' ||
                      (pt.care_unit && pt.care_unit.includes('ICU')) ||
                      (pt.bed_no && pt.bed_no.includes('ICU')) ||
                      pt.patient_id === 'PAT-000005';

                    return (
                      <tr key={pt.patient_id || idx} className="reports-table-row clinical-row">
                        {/* Patient ID */}
                        <td className="cell-patient-id">
                          <span
                            className="patient-id-link"
                            onClick={() => {
                              setSelectedPatientModal(pt);
                              setPatientModalTab('vitals');
                            }}
                            title="View patient clinical profile"
                          >
                            {pt.patient_id}
                          </span>
                        </td>

                        {/* Patient Name with Silhouette Avatar */}
                        <td className="cell-patient-name">
                          <div className="patient-name-cell-wrap">
                            <span className="patient-avatar-circle">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                            </span>
                            <span className="patient-name-bold">{pt.full_name}</span>
                          </div>
                        </td>

                        {/* Age / Gender */}
                        <td className="cell-patient-demog">
                          {pt.age}y / {pt.gender}
                        </td>

                        {/* Care Location with Hospital Bed Icon */}
                        <td className="cell-patient-location">
                          {isIcu ? (
                            <div className="location-cell-flex icu-mode">
                              <svg className="bed-icon-svg text-red" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 4v16" />
                                <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                                <path d="M2 17h20" />
                                <circle cx="6" cy="8" r="2" />
                              </svg>
                              <span className="location-unit-text text-red font-bold">ICU</span>
                              <span className="location-bed-code text-cyan">({pt.bed_no || 'ICU-03'})</span>
                            </div>
                          ) : (
                            <div className="location-cell-flex">
                              <svg className="bed-icon-svg text-slate" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 4v16" />
                                <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                                <path d="M2 17h20" />
                                <circle cx="6" cy="8" r="2" />
                              </svg>
                              <span className="location-unit-text">{pt.care_unit}</span>
                              {pt.bed_no && <span className="location-bed-code">({pt.bed_no})</span>}
                            </div>
                          )}
                        </td>

                        {/* Blood Pressure (BP) */}
                        <td className="cell-vital">
                          <span className="vital-num-bold">
                            {Math.round(sbp)}/{Math.round(dbp)}
                          </span>
                        </td>

                        {/* SpO2 */}
                        <td className="cell-vital">
                          <span className="vital-num-bold">
                            {spo2 ? `${parseFloat(spo2).toFixed(1)}%` : '98.0%'}
                          </span>
                        </td>

                        {/* Blood Glucose */}
                        <td className="cell-vital">
                          <span className="vital-num-bold">
                            {Math.round(glucose)}
                          </span>
                        </td>

                        {/* Heart Rate */}
                        <td className="cell-vital">
                          <span className="vital-num-bold">
                            {Math.round(hr)}
                          </span>
                        </td>

                        {/* Monitoring Level */}
                        <td className="cell-level">
                          {isHighRisk ? (
                            <span className="clinical-level-pill pill-high-risk">High Risk</span>
                          ) : (
                            <span className="clinical-level-pill pill-routine">Routine</span>
                          )}
                        </td>

                        {/* Patient Report: Clean Light-Blue Pill Button */}
                        <td className="cell-actions-patient">
                          <button
                            type="button"
                            className="btn-view-report-pill"
                            onClick={() => {
                              setSelectedPatientModal(pt);
                              setPatientModalTab('vitals');
                            }}
                            title="View Individual Patient Report"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                            View Report
                          </button>
                        </td>

                        {/* Actions: Three Dots Menu Button */}
                        <td className="cell-actions-dots">
                          <button
                            type="button"
                            className="btn-table-dots-action"
                            onClick={() => {
                              setSelectedPatientModal(pt);
                              setPatientModalTab('vitals');
                            }}
                            title="More Actions"
                          >
                            ⋮
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {/* Pagination Controls */}
            <div className="clinical-pagination-row">
              <div className="clinical-pagination-info">
                Showing {((patientPage - 1) * patientPageSize) + 1} to{' '}
                {Math.min(patientPage * patientPageSize, totalMonitoredCount)} of {totalMonitoredCount.toLocaleString()} Monitored Inpatients
              </div>

              <div className="clinical-pagination-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="clinical-page-btn"
                  disabled={patientPage <= 1}
                  onClick={() => setPatientPage(1)}
                  title="First Page"
                >
                  « First
                </button>

                <button
                  type="button"
                  className="clinical-page-btn"
                  disabled={patientPage <= 1}
                  onClick={() => setPatientPage((p) => Math.max(1, p - 1))}
                >
                  ‹ Prev
                </button>

                <span className="clinical-page-indicator" style={{ fontWeight: 700, padding: '0 0.4rem', color: '#1e293b' }}>
                  Page {patientPage} of {Math.max(1, Math.ceil(totalMonitoredCount / patientPageSize))}
                </span>

                <button
                  type="button"
                  className="clinical-page-btn"
                  disabled={patientPage >= Math.ceil(totalMonitoredCount / patientPageSize) || patientsData.length < patientPageSize}
                  onClick={() => setPatientPage((p) => p + 1)}
                >
                  Next ›
                </button>

                <button
                  type="button"
                  className="clinical-page-btn"
                  disabled={patientPage >= Math.ceil(totalMonitoredCount / patientPageSize)}
                  onClick={() => setPatientPage(Math.max(1, Math.ceil(totalMonitoredCount / patientPageSize)))}
                  title="Last Page"
                >
                  Last »
                </button>

                <select
                  value={patientPageSize}
                  onChange={(e) => {
                    setPatientPageSize(Number(e.target.value));
                    setPatientPage(1);
                  }}
                  className="clinical-pagesize-select"
                  style={{ fontWeight: 600 }}
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                  <option value={250}>250 / page</option>
                  <option value={500}>500 / page</option>
                  <option value={2500}>All 2,500 Records</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. IN-BUILT INDIVIDUAL PATIENT CLINICAL REPORT MODAL                      */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 4. DAILY PATIENT CLINICAL MONITORING REPORT MODAL (MATCHING IMAGE 2)      */}
      {/* ========================================================================= */}
      {selectedPatientModal && (() => {
        const pt = selectedPatientModal;
        const sbp = Math.round(pt.systolic_bp_mmhg !== undefined ? pt.systolic_bp_mmhg : 89);
        const dbp = Math.round(pt.diastolic_bp_mmhg !== undefined ? pt.diastolic_bp_mmhg : 52);
        const hr = Math.round(pt.heart_rate_bpm !== undefined ? pt.heart_rate_bpm : 98);
        const rr = Math.round(pt.respiratory_rate_bpm !== undefined ? pt.respiratory_rate_bpm : 26);
        const spo2 = pt.spo2_percent ? parseFloat(pt.spo2_percent).toFixed(1) : '90.5';
        const temp = pt.temperature_c ? parseFloat(pt.temperature_c).toFixed(1) : '37.1';
        const glucose = Math.round(pt.blood_glucose_mg_dl !== undefined ? pt.blood_glucose_mg_dl : 177);
        const gcs = pt.gcs_score !== undefined ? pt.gcs_score : 8;
        const pain = pt.pain_score !== undefined ? pt.pain_score : 6;
        const urine = pt.urine_output_ml_hr !== undefined ? parseFloat(pt.urine_output_ml_hr).toFixed(1) : '29.5';
        const rhythm = pt.ecg_rhythm || 'Atrial Fibrillation';
        const riskScore = pt.risk_score !== undefined ? Number(pt.risk_score).toFixed(1) : '95.5';
        const isCritical = Number(riskScore) >= 60 || sbp < 90 || spo2 < 92 || gcs < 10;
        
        // Gauge meter circumference calculation (perimeter 2 * pi * 35 approx 220)
        const strokeDashoffset = Math.max(0, 220 - (220 * Number(riskScore)) / 100);

        return (
          <div className="ihms-modal-backdrop" onClick={() => setSelectedPatientModal(null)}>
            <div className="ihms-modal-card daily-patient-report-modal" onClick={(e) => e.stopPropagation()}>
              {/* Top Navigation & Action Header */}
              <div className="daily-report-nav-header">
                <div className="daily-report-nav-left">
                  <button
                    type="button"
                    className="daily-report-back-btn"
                    onClick={() => setSelectedPatientModal(null)}
                    title="Back to Reports"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <div className="daily-report-title-box">
                    <h2 className="daily-report-main-title">Daily Patient Clinical Monitoring Report</h2>
                    <div className="daily-report-sub-meta">
                      <span>Patient ID: <strong>{pt.patient_id || 'PAT-000018'}</strong></span>
                      <span className="daily-meta-sep">|</span>
                      <span>Date: <strong>24 Oct 2026, 11:54 AM</strong></span>
                    </div>
                  </div>
                </div>

                <div className="daily-report-nav-right">
                  <button
                    type="button"
                    className="daily-report-pdf-btn"
                    onClick={() => handleDownloadPatientReport(pt.patient_id)}
                    title="Save to PDF"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    Save to PDF
                  </button>
                  <button
                    type="button"
                    className="daily-report-close-x"
                    onClick={() => setSelectedPatientModal(null)}
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Patient Demographics Info Strip */}
              <div className="daily-patient-strip">
                <div className="daily-avatar-wrap">
                  <div className="daily-patient-avatar">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#3b82f6">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                </div>

                <div className="daily-strip-col">
                  <span className="daily-strip-label">PATIENT'S FULL NAME</span>
                  <div className="daily-strip-val">{pt.full_name || 'Pranav Jadhav'}</div>
                  <div className="daily-strip-sub">Age: {pt.age || 76} years &nbsp; Gender: {pt.gender || 'Male'}</div>
                </div>

                <div className="daily-strip-col">
                  <span className="daily-strip-label">WARD &amp; BED NUMBER (LOCATION)</span>
                  <div className="daily-strip-val with-icon">
                    <span className="strip-val-icon">🛏️</span>
                    {pt.care_unit || 'Intensive Care Unit'}
                  </div>
                  <div className="daily-strip-sub">Room: {pt.room_no || 'ICU-12'} &nbsp; | &nbsp; Bed: {pt.bed_no || 'ICU-B03'}</div>
                </div>

                <div className="daily-strip-col">
                  <span className="daily-strip-label">ALLERGIES</span>
                  <div className="daily-strip-val allergy-val">
                    <span className="strip-val-icon">⚠️</span>
                    {pt.allergy_status || 'Unknown'}
                  </div>
                  <div className="daily-strip-sub">City: {pt.city || 'Pune'}</div>
                </div>

                <div className="daily-strip-col">
                  <span className="daily-strip-label">TRIAGE LEVEL</span>
                  <div className="daily-strip-val triage-val">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    {pt.monitoring_level || 'Continuous'}
                  </div>
                  <div className="daily-strip-sub">ML Predicted: {pt.monitoring_level || 'Continuous'}</div>
                </div>
              </div>

              {/* Dual Summary KPI Cards */}
              <div className="daily-kpi-row">
                {/* Left Card: Parameter Tracker Overview */}
                <div className="daily-kpi-card left-overview-card">
                  <div className="kpi-card-header">
                    <div className="kpi-header-icon blue">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                      </svg>
                    </div>
                    <span className="kpi-header-title">Parameter Tracker Overview</span>
                  </div>

                  <div className="overview-pill-trio">
                    <div className="overview-pill green">
                      <span className="pill-dot">🟢</span>
                      <strong className="pill-count">3</strong>
                      <span className="pill-lbl">Normal</span>
                    </div>
                    <div className="overview-pill amber">
                      <span className="pill-dot">⚠️</span>
                      <strong className="pill-count">4</strong>
                      <span className="pill-lbl">Moderate Changes</span>
                    </div>
                    <div className="overview-pill red">
                      <span className="pill-dot">⚠️</span>
                      <strong className="pill-count">4</strong>
                      <span className="pill-lbl">Critical</span>
                    </div>
                  </div>

                  <div className="overview-bottom-status">
                    <span className="overview-status-label">Clinical Status:</span>
                    {isCritical ? (
                      <span className="status-critical-pill">
                        <span className="status-crit-icon">⚠️</span> CRITICAL ALERT
                      </span>
                    ) : (
                      <span className="status-stable-pill">
                        🟢 CLINICALLY STABLE
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Card: Clinical Risk Score Meter */}
                <div className="daily-kpi-card right-score-card">
                  <div className="kpi-card-header">
                    <div className="kpi-header-icon red">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="6" />
                        <circle cx="12" cy="12" r="2" />
                      </svg>
                    </div>
                    <span className="kpi-header-title">Clinical Risk Score</span>
                  </div>

                  <div className="score-meter-wrap">
                    <div className="score-gauge-svg-box">
                      <svg className="score-gauge-svg" width="86" height="86" viewBox="0 0 86 86">
                        <circle
                          cx="43"
                          cy="43"
                          r="35"
                          fill="none"
                          stroke="#fee2e2"
                          strokeWidth="8"
                        />
                        <circle
                          cx="43"
                          cy="43"
                          r="35"
                          fill="none"
                          stroke={isCritical ? '#ef4444' : '#10b981'}
                          strokeWidth="8"
                          strokeDasharray="220"
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          transform="rotate(-90 43 43)"
                        />
                      </svg>
                      <div className="score-gauge-center">
                        <span className="score-big-num" style={{ color: isCritical ? '#dc2626' : '#059669' }}>{riskScore}</span>
                        <span className="score-denom">/ 100</span>
                      </div>
                    </div>
                    <div className="score-badge-box">
                      <span className={`score-risk-tag ${isCritical ? 'high-risk' : 'low-risk'}`}>
                        {isCritical ? 'High Risk' : 'Low Risk'}
                      </span>
                    </div>
                  </div>
                  {/* Soft decorative bottom-right wave */}
                  <div className="score-card-wave" />
                </div>
              </div>

              {/* Section 1: Daily Physiological Vitals Tracker */}
              <div className="daily-section-card">
                <div className="daily-section-header">
                  <div className="section-title-icon blue">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <h3 className="daily-section-title">Daily Physiological Vitals Tracker</h3>
                </div>

                <div className="vitals-tracker-table-wrap">
                  <table className="vitals-tracker-table">
                    <thead>
                      <tr>
                        <th>PARAMETER</th>
                        <th>OBSERVED VALUE</th>
                        <th>REFERENCE RANGE</th>
                        <th>STATUS</th>
                        <th>DESCRIPTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 1. Heart Rate */}
                      <tr>
                        <td className="param-cell">
                          <span className="param-icon">❤️</span> Heart Rate
                        </td>
                        <td className="val-cell">
                          <strong>{hr}</strong> <small>bpm</small>
                        </td>
                        <td className="ref-cell">60.0 - 100.0 bpm</td>
                        <td className="status-cell">
                          <span className="vstatus-pill normal">🟢 Normal</span>
                        </td>
                        <td className="desc-cell">Within normal range</td>
                      </tr>

                      {/* 2. Systolic BP */}
                      <tr>
                        <td className="param-cell">
                          <span className="param-icon">🩺</span> Systolic BP
                        </td>
                        <td className="val-cell crit-low">
                          <strong>{sbp}</strong> <small>mmHg</small>
                        </td>
                        <td className="ref-cell">90.0 - 120.0 mmHg</td>
                        <td className="status-cell">
                          <span className="vstatus-pill crit-low">⬇ Critical Low</span>
                        </td>
                        <td className="desc-cell">Below normal range</td>
                      </tr>

                      {/* 3. Diastolic BP */}
                      <tr>
                        <td className="param-cell">
                          <span className="param-icon">🩺</span> Diastolic BP
                        </td>
                        <td className="val-cell crit-low">
                          <strong>{dbp}</strong> <small>mmHg</small>
                        </td>
                        <td className="ref-cell">60.0 - 80.0 mmHg</td>
                        <td className="status-cell">
                          <span className="vstatus-pill crit-low">⬇ Critical Low</span>
                        </td>
                        <td className="desc-cell">Below normal range</td>
                      </tr>

                      {/* 4. Respiratory Rate */}
                      <tr>
                        <td className="param-cell">
                          <span className="param-icon">🫁</span> Respiratory Rate
                        </td>
                        <td className="val-cell high">
                          <strong>{rr}</strong> <small>/min</small>
                        </td>
                        <td className="ref-cell">12.0 - 20.0 /min</td>
                        <td className="status-cell">
                          <span className="vstatus-pill high">⬆ High</span>
                        </td>
                        <td className="desc-cell">Above normal range</td>
                      </tr>

                      {/* 5. SpO2 */}
                      <tr>
                        <td className="param-cell">
                          <span className="param-icon">🩸</span> SpO₂
                        </td>
                        <td className="val-cell low">
                          <strong>{spo2}</strong> <small>%</small>
                        </td>
                        <td className="ref-cell">95.0 - 100.0 %</td>
                        <td className="status-cell">
                          <span className="vstatus-pill low">⬇ Low</span>
                        </td>
                        <td className="desc-cell">Below normal range</td>
                      </tr>

                      {/* 6. Body Temperature */}
                      <tr>
                        <td className="param-cell">
                          <span className="param-icon">🌡️</span> Body Temperature
                        </td>
                        <td className="val-cell">
                          <strong>{temp}</strong> <small>°C</small>
                        </td>
                        <td className="ref-cell">36.5 - 37.5 °C</td>
                        <td className="status-cell">
                          <span className="vstatus-pill normal">🟢 Normal</span>
                        </td>
                        <td className="desc-cell">Within normal range</td>
                      </tr>

                      {/* 7. Blood Glucose */}
                      <tr>
                        <td className="param-cell">
                          <span className="param-icon">🩸</span> Blood Glucose
                        </td>
                        <td className="val-cell elevated">
                          <strong>{glucose}.0</strong> <small>mg/dL</small>
                        </td>
                        <td className="ref-cell">70.0 - 140.0 mg/dL</td>
                        <td className="status-cell">
                          <span className="vstatus-pill elevated">⚠️ Elevated</span>
                        </td>
                        <td className="desc-cell">Above normal range</td>
                      </tr>

                      {/* 8. GCS Score */}
                      <tr>
                        <td className="param-cell">
                          <span className="param-icon">🧠</span> GCS Score
                        </td>
                        <td className="val-cell critical">
                          <strong>{gcs}</strong> <small>/15</small>
                        </td>
                        <td className="ref-cell">14 - 15 /15</td>
                        <td className="status-cell">
                          <span className="vstatus-pill critical">⚠️ Critical</span>
                        </td>
                        <td className="desc-cell">Requires urgent clinical assessment</td>
                      </tr>

                      {/* 9. Pain Score */}
                      <tr>
                        <td className="param-cell">
                          <span className="param-icon">⚡</span> Pain Score
                        </td>
                        <td className="val-cell mod-pain">
                          <strong>{pain}</strong> <small>/10</small>
                        </td>
                        <td className="ref-cell">0 - 3 /10</td>
                        <td className="status-cell">
                          <span className="vstatus-pill mod-pain">⬆ Moderate Pain</span>
                        </td>
                        <td className="desc-cell">Patient-reported pain</td>
                      </tr>

                      {/* 10. Urine Output */}
                      <tr>
                        <td className="param-cell">
                          <span className="param-icon">💧</span> Urine Output
                        </td>
                        <td className="val-cell low">
                          <strong>{urine}</strong> <small>mL/hr</small>
                        </td>
                        <td className="ref-cell">30.0 - 80.0 mL/hr</td>
                        <td className="status-cell">
                          <span className="vstatus-pill low">⬇ Low</span>
                        </td>
                        <td className="desc-cell">Below normal range</td>
                      </tr>

                      {/* 11. ECG Rhythm */}
                      <tr>
                        <td className="param-cell">
                          <span className="param-icon">📈</span> ECG Rhythm
                        </td>
                        <td className="val-cell rhythm">
                          <strong>{rhythm}</strong> <small>rhythm</small>
                        </td>
                        <td className="ref-cell">Sinus Rhythm</td>
                        <td className="status-cell">
                          <span className="vstatus-pill abnormal-rhythm">⚠️ Abnormal Rhythm</span>
                        </td>
                        <td className="desc-cell">Irregular rhythm recorded</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: Specific Disease & Diagnosis Identification */}
              <div className="daily-section-card">
                <div className="daily-section-header">
                  <div className="section-title-icon blue">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2">
                      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                      <circle cx="20" cy="10" r="2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="daily-section-title">Specific Disease &amp; Diagnosis Identification</h3>
                    <p className="daily-section-sub">
                      The following potential diseases and risks have been identified as per the clinical threshold of the above parameters:
                    </p>
                  </div>
                </div>

                <div className="daily-diagnosis-list">
                  {/* Card 1: Hypotension & Circulatory Shock Risk */}
                  <div className="diagnosis-item-card border-red">
                    <div className="diag-header-row">
                      <div className="diag-title-group">
                        <span className="diag-icon red">🩺</span>
                        <strong className="diag-name">Hypotension &amp; Circulatory Shock Risk</strong>
                      </div>
                      <div className="diag-badge-chevron">
                        <span className="diag-pill-badge critical">CRITICAL</span>
                        <span className="diag-chevron">›</span>
                      </div>
                    </div>
                    <div className="diag-meta-line">
                      Triggered by: <span className="trigger-highlight">SBP: {sbp} mmHg, Heart Rate: {hr} bpm, Urine: {urine} mL/hr</span>
                    </div>
                    <div className="diag-meta-line">
                      <strong>Medical Rationale:</strong> Inadequate systemic perfusion pressure. Risk of hemodynamic collapse, cerebral hypoperfusion, and renal ischemia.
                    </div>
                    <div className="diag-action-plan-box">
                      <span className="action-plan-icon">💡</span>
                      <div>
                        <strong>Recommended Action Plan:</strong> Immediate IV fluid resuscitation (Normal Saline 500mL stat), withhold antihypertensives, evaluate for sepsis/hemorrhage.
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Impaired Glycemic Control */}
                  <div className="diagnosis-item-card border-yellow">
                    <div className="diag-header-row">
                      <div className="diag-title-group">
                        <span className="diag-icon yellow">💧</span>
                        <strong className="diag-name">Impaired Glycemic Control (Increased Sugar)</strong>
                      </div>
                      <div className="diag-badge-chevron">
                        <span className="diag-pill-badge moderate">MODERATE</span>
                        <span className="diag-chevron">›</span>
                      </div>
                    </div>
                    <div className="diag-meta-line">
                      Triggered by: <span className="trigger-highlight">Blood Glucose: {glucose} mg/dL</span>
                    </div>
                    <div className="diag-meta-line">
                      <strong>Medical Rationale:</strong> Mild to moderate postprandial/random hyperglycemia.
                    </div>
                    <div className="diag-action-plan-box">
                      <span className="action-plan-icon">💡</span>
                      <div>
                        <strong>Recommended Action Plan:</strong> Diabetic diet adherence, oral hypoglycemic adjustment (Metformin/Glimepiride).
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Acute Hypoxemic Respiratory Distress */}
                  <div className="diagnosis-item-card border-red">
                    <div className="diag-header-row">
                      <div className="diag-title-group">
                        <span className="diag-icon red">🫁</span>
                        <strong className="diag-name">Acute Hypoxemic Respiratory Distress (difficulty in breathing/lack of oxygen)</strong>
                      </div>
                      <div className="diag-badge-chevron">
                        <span className="diag-pill-badge critical">CRITICAL</span>
                        <span className="diag-chevron">›</span>
                      </div>
                    </div>
                    <div className="diag-meta-line">
                      Triggered by: <span className="trigger-highlight">SpO2: {spo2}% (&lt; 92%), Resp Rate: {rr} bpm</span>
                    </div>
                    <div className="diag-meta-line">
                      <strong>Medical Rationale:</strong> Impaired pulmonary alveolar gas exchange. Cellular hypoxia risk.
                    </div>
                    <div className="diag-action-plan-box">
                      <span className="action-plan-icon">💡</span>
                      <div>
                        <strong>Recommended Action Plan:</strong> High-flow Supplemental O2 via Venturi/Nasal Cannula (4-6 L/min), bronchodilator nebulization, ABG analysis.
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Atrial Fibrillation */}
                  <div className="diagnosis-item-card border-red">
                    <div className="diag-header-row">
                      <div className="diag-title-group">
                        <span className="diag-icon red">❤️</span>
                        <strong className="diag-name">Atrial Fibrillation (irregular heartbeat)</strong>
                      </div>
                      <div className="diag-badge-chevron">
                        <span className="diag-pill-badge critical">CRITICAL</span>
                        <span className="diag-chevron">›</span>
                      </div>
                    </div>
                    <div className="diag-meta-line">
                      Triggered by: <span className="trigger-highlight">ECG: {rhythm}, Heart Rate: {hr} bpm</span>
                    </div>
                    <div className="diag-meta-line">
                      <strong>Medical Rationale:</strong> Chaotic atrial electrical activation. High thromboembolic stroke risk and hemodynamic compromise.
                    </div>
                    <div className="diag-action-plan-box">
                      <span className="action-plan-icon">💡</span>
                      <div>
                        <strong>Recommended Action Plan:</strong> Rate/rhythm control (Beta-blocker/Digoxin), anticoagulation evaluation (DOAC/Warfarin), 12-lead ECG.
                      </div>
                    </div>
                  </div>

                  {/* Card 5: Borderline Low Urine Output */}
                  <div className="diagnosis-item-card border-yellow">
                    <div className="diag-header-row">
                      <div className="diag-title-group">
                        <span className="diag-icon yellow">💧</span>
                        <strong className="diag-name">Borderline Low Urine Output</strong>
                      </div>
                      <div className="diag-badge-chevron">
                        <span className="diag-pill-badge moderate">MODERATE</span>
                        <span className="diag-chevron">›</span>
                      </div>
                    </div>
                    <div className="diag-meta-line">
                      Triggered by: <span className="trigger-highlight">Urine Output: {urine} mL/hr</span>
                    </div>
                    <div className="diag-meta-line">
                      <strong>Medical Rationale:</strong> Mild dehydration or early renal hypoperfusion.
                    </div>
                    <div className="diag-action-plan-box">
                      <span className="action-plan-icon">💡</span>
                      <div>
                        <strong>Recommended Action Plan:</strong> Fluid intake monitoring, repeat measurement in 2 hours.
                      </div>
                    </div>
                  </div>

                  {/* Card 6: Altered Sensorium */}
                  <div className="diagnosis-item-card border-red">
                    <div className="diag-header-row">
                      <div className="diag-title-group">
                        <span className="diag-icon red">🧠</span>
                        <strong className="diag-name">Altered Sensorium / Neurological Depression</strong>
                      </div>
                      <div className="diag-badge-chevron">
                        <span className="diag-pill-badge critical">CRITICAL</span>
                        <span className="diag-chevron">›</span>
                      </div>
                    </div>
                    <div className="diag-meta-line">
                      Triggered by: <span className="trigger-highlight">GCS Score: {gcs}/15</span>
                    </div>
                    <div className="diag-meta-line">
                      <strong>Medical Rationale:</strong> Depressed central nervous system arousal. High risk of aspiration and airway compromise.
                    </div>
                    <div className="diag-action-plan-box">
                      <span className="action-plan-icon">💡</span>
                      <div>
                        <strong>Recommended Action Plan:</strong> Airway protection, urgent non-contrast CT brain if sudden onset, check glucose and electrolytes.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Medication Reconciliation Tracker */}
              <div className="daily-section-card">
                <div className="daily-section-header">
                  <div className="section-title-icon blue">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2">
                      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
                      <path d="m8.5 8.5 7 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="daily-section-title">Medication Reconciliation Tracker</h3>
                    <p className="daily-section-sub">
                      The drugs have been adjusted as per the changed parameters of the patient as follows:
                    </p>
                  </div>
                </div>

                <div className="daily-meds-two-col-grid">
                  {/* Left Column: Ongoing Active & Reduced/Discontinued */}
                  <div className="meds-col left-meds-col">
                    {/* 1. Ongoing Medications (Active) */}
                    <div className="meds-group">
                      <div className="meds-group-header">
                        <h4 className="meds-group-title">1. Ongoing Medications (Active)</h4>
                        <span className="meds-count-badge blue">2</span>
                      </div>

                      <div className="med-box-card">
                        <div className="med-box-top">
                          <div className="med-box-name-wrap">
                            <span className="med-circle-icon blue">💊</span>
                            <strong>Tab. Pantoprazole</strong>
                          </div>
                          <span className="med-tag-pill blue">GI Protection</span>
                        </div>
                        <div className="med-box-body">
                          <div><strong>Dosage/Frequency:</strong> 40 mg Oral — Before Breakfast (OD)</div>
                          <div className="med-box-sub">Gastric mucosal protection.</div>
                        </div>
                      </div>

                      <div className="med-box-card">
                        <div className="med-box-top">
                          <div className="med-box-name-wrap">
                            <span className="med-circle-icon blue">💊</span>
                            <strong>Tab. Multivitamin &amp; Zinc</strong>
                          </div>
                          <span className="med-tag-pill blue">Nutritional Support</span>
                        </div>
                        <div className="med-box-body">
                          <div><strong>Dosage/Frequency:</strong> 1 Capsule — Once Daily (OD)</div>
                          <div className="med-box-sub">Nutritional and immunity maintenance.</div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Reduced / Discontinued Drugs */}
                    <div className="meds-group reduced-group">
                      <div className="meds-group-header">
                        <h4 className="meds-group-title red">3. Reduced / Discontinued Drugs</h4>
                        <span className="meds-count-badge red">2</span>
                      </div>

                      <div className="med-box-card border-light-red">
                        <div className="med-box-top">
                          <div className="med-box-name-wrap">
                            <span className="med-circle-icon red">⛔</span>
                            <strong>Antihypertensive Medication</strong>
                          </div>
                          <span className="med-tag-pill red">WITHHELD / TEMPORARILY STOPPED</span>
                        </div>
                        <div className="med-box-body">
                          <div><strong>Reason:</strong> Low Systolic BP ({sbp} mmHg &lt; 95 mmHg), Withheld to prevent hypotensive shock.</div>
                        </div>
                      </div>

                      <div className="med-box-card border-light-red">
                        <div className="med-box-top">
                          <div className="med-box-name-wrap">
                            <span className="med-circle-icon red">⛔</span>
                            <strong>Sedatives &amp; Opioids (e.g. Diazepam / Tramadol / Sedatives)</strong>
                          </div>
                          <span className="med-tag-pill red">REDUCED BY 50% OR STOPPED</span>
                        </div>
                        <div className="med-box-body">
                          <div><strong>Reason:</strong> Depressed consciousness (GCS {gcs}/15). Reduced to prevent respiratory suppression and coma.</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Newly Introduced Medicines (Added) */}
                  <div className="meds-col right-meds-col">
                    <div className="meds-group">
                      <div className="meds-group-header">
                        <h4 className="meds-group-title green">2. Newly Introduced Medicines (Added)</h4>
                        <span className="meds-count-badge green">6</span>
                      </div>

                      {/* 1. Tab Metformin */}
                      <div className="med-box-card border-light-green">
                        <div className="med-box-top">
                          <div className="med-box-name-wrap">
                            <span className="med-circle-icon green">➕</span>
                            <strong>Tab. Metformin</strong>
                          </div>
                          <span className="med-tag-pill green">NEW / ADDED</span>
                        </div>
                        <div className="med-box-body">
                          <div><strong>Dosage:</strong> 500 mg Oral (Twice Daily with Meals (BD)) | <strong>Trigger:</strong> Elevated Glucose ({glucose} mg/dL)</div>
                          <div className="med-box-sub"><strong>Causes:</strong> Started to control elevated fasting/postprandial glucose.</div>
                        </div>
                      </div>

                      {/* 2. Medical Oxygen Therapy */}
                      <div className="med-box-card border-light-green">
                        <div className="med-box-top">
                          <div className="med-box-name-wrap">
                            <span className="med-circle-icon green">➕</span>
                            <strong>Medical Oxygen Therapy</strong>
                          </div>
                          <span className="med-tag-pill green">NEW / ADDED</span>
                        </div>
                        <div className="med-box-body">
                          <div><strong>Dosage:</strong> 4 - 6 Litres/min (Continuous via Venturi Mask / Cannula) | <strong>Trigger:</strong> Low SpO2 ({spo2}%)</div>
                          <div className="med-box-sub"><strong>Causes:</strong> Started urgently to maintain target peripheral SpO2 &gt;= 95%.</div>
                        </div>
                      </div>

                      {/* 3. Duolin + Budecort Nebulization */}
                      <div className="med-box-card border-light-green">
                        <div className="med-box-top">
                          <div className="med-box-name-wrap">
                            <span className="med-circle-icon green">➕</span>
                            <strong>Duolin + Budecort Nebulization</strong>
                          </div>
                          <span className="med-tag-pill green">NEW / ADDED</span>
                        </div>
                        <div className="med-box-body">
                          <div><strong>Dosage:</strong> 1 respule each (Every 8 hours (TDS)) | <strong>Trigger:</strong> Hypoxemia / Tachypnea</div>
                          <div className="med-box-sub"><strong>Causes:</strong> Bronchodilator therapy to relieve bronchospasm and airway resistance.</div>
                        </div>
                      </div>

                      {/* 4. Tab Metoprolol Tartrate */}
                      <div className="med-box-card border-light-green">
                        <div className="med-box-top">
                          <div className="med-box-name-wrap">
                            <span className="med-circle-icon green">➕</span>
                            <strong>Tab. Metoprolol Tartrate</strong>
                          </div>
                          <span className="med-tag-pill green">NEW / ADDED</span>
                        </div>
                        <div className="med-box-body">
                          <div><strong>Dosage:</strong> 25 mg Oral (Twice Daily (BD)) | <strong>Trigger:</strong> Atrial Fibrillation on ECG</div>
                          <div className="med-box-sub"><strong>Causes:</strong> Ventricular rate control in atrial fibrillation, rate management.</div>
                        </div>
                      </div>

                      {/* 5. Inj. Enoxaparin */}
                      <div className="med-box-card border-light-green">
                        <div className="med-box-top">
                          <div className="med-box-name-wrap">
                            <span className="med-circle-icon green">➕</span>
                            <strong>Inj. Enoxaparin (Low Molecular Weight Heparin)</strong>
                          </div>
                          <span className="med-tag-pill green">NEW / ADDED</span>
                        </div>
                        <div className="med-box-body">
                          <div><strong>Dosage:</strong> 40 mg Subcutaneous (Once Daily (OD)) | <strong>Trigger:</strong> Afib / Thromboembolism Prophylaxis</div>
                          <div className="med-box-sub"><strong>Causes:</strong> Anticoagulant initiated to prevent left atrial thrombus and stroke.</div>
                        </div>
                      </div>

                      {/* 6. Tab Paracetamol */}
                      <div className="med-box-card border-light-green">
                        <div className="med-box-top">
                          <div className="med-box-name-wrap">
                            <span className="med-circle-icon blue">💊</span>
                            <strong>Tab. Paracetamol painkiller</strong>
                          </div>
                          <span className="med-tag-pill green">NEW / ADDED</span>
                        </div>
                        <div className="med-box-body">
                          <div><strong>Dosage:</strong> 650 mg Oral (Every 8 hours SOS) | <strong>Trigger:</strong> Pain Score ({pain}/10)</div>
                          <div className="med-box-sub"><strong>Causes:</strong> Pain relief for moderate surgical/body ache.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Care Directives & Digital Validation Footer Card */}
              <div className="daily-directives-footer">
                <div className="directives-left">
                  <div className="directives-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="directives-title">Clinical Care Directives:</h4>
                    <ul className="directives-list">
                      <li>• Further monitoring: Continuous/5-minute trend is mandatory.</li>
                      <li>• Immediately inform the Duty Medical Officer in case of sudden slip in the vitals.</li>
                    </ul>
                  </div>
                </div>

                <div className="directives-right">
                  <div className="doctor-avatar-circle">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#3b82f6">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div className="doctor-info-box">
                    <span className="auth-officer-lbl">Authorised Medical Officer</span>
                    <strong className="officer-name">IHMS Clinical Intelligence Board</strong>
                    <span className="digitally-verified-tag">Digitally Verified &amp; Validated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* 5. TAB 1 SYSTEM REPORT DETAILS MODAL                                      */}
      {/* ========================================================================= */}
      {selectedReport && (
        <div className="ihms-modal-backdrop" onClick={() => setSelectedReport(null)}>
          <div className="ihms-modal-card report-modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-profile report-modal-top">
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedReport(null)}
                title="Close"
              >
                ✕
              </button>
              <div
                className="report-modal-badge-icon"
                style={{ background: selectedReport.iconBg }}
              >
                {renderRowIcon(selectedReport.iconType, selectedReport.iconColor)}
              </div>
              <div className="modal-user-meta">
                <div className="modal-user-title-row">
                  <h3 className="modal-patient-name">{selectedReport.name}</h3>
                  <span className="report-type-badge">{selectedReport.type}</span>
                </div>
                <div className="modal-patient-sub">
                  Department: {selectedReport.dept} | Generated: {selectedReport.generatedOn}
                </div>
              </div>
            </div>

            <div className="modal-subnav-tabs">
              <button
                type="button"
                className={`modal-tab-btn ${modalTab === 'overview' ? 'active' : ''}`}
                onClick={() => setModalTab('overview')}
              >
                Overview
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${modalTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setModalTab('analytics')}
              >
                Metrics & Breakdown
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${modalTab === 'audit' ? 'active' : ''}`}
                onClick={() => setModalTab('audit')}
              >
                Audit Log
              </button>
            </div>

            <div className="modal-scroll-body">
              {modalTab === 'overview' && (
                <div className="modal-info-list">
                  <div className="modal-info-item">
                    <div className="info-icon">📄</div>
                    <div className="info-text">
                      <span className="info-label">Executive Summary</span>
                      <span className="info-val">{selectedReport.summary}</span>
                    </div>
                  </div>

                  <div className="modal-info-item">
                    <div className="info-icon">👨‍⚕️</div>
                    <div className="info-text">
                      <span className="info-label">Author / Generator</span>
                      <span className="info-val bold">{selectedReport.author}</span>
                    </div>
                  </div>

                  <div className="modal-info-item">
                    <div className="info-icon">📅</div>
                    <div className="info-text">
                      <span className="info-label">Audit Period</span>
                      <span className="info-val">{selectedReport.dateRange}</span>
                    </div>
                  </div>

                  <div className="report-kpi-summary-strip">
                    {selectedReport.stats.map((s, idx) => (
                      <div key={idx} className="report-kpi-item-box">
                        <span className="rk-val">{s.value}</span>
                        <span className="rk-lbl">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {modalTab === 'analytics' && (
                <div className="modal-reports-container">
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                    Granular Performance Metrics
                  </div>
                  <table className="modal-report-mini-table">
                    <thead>
                      <tr>
                        <th>Metric Dimension</th>
                        <th>Observed Value</th>
                        <th>Target Threshold</th>
                        <th>Variance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Operational Throughput</td>
                        <td style={{ fontWeight: 700, color: '#0066ff' }}>94.8%</td>
                        <td>90.0%</td>
                        <td><span className="ihms-status-pill status-dispensed">+4.8% Optimal</span></td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Clinical Response Latency</td>
                        <td style={{ fontWeight: 700, color: '#0066ff' }}>12.4 min</td>
                        <td>15.0 min</td>
                        <td><span className="ihms-status-pill status-dispensed">-2.6 min Fast</span></td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600 }}>Documentation Accuracy</td>
                        <td style={{ fontWeight: 700, color: '#0066ff' }}>99.2%</td>
                        <td>98.0%</td>
                        <td><span className="ihms-status-pill status-dispensed">+1.2% High</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {modalTab === 'audit' && (
                <div className="modal-timeline-flow">
                  <div className="timeline-flow-item">
                    <div className="timeline-flow-dot"></div>
                    <div className="timeline-flow-content">
                      <div className="timeline-flow-title">Report query generated by System Automation</div>
                      <div className="timeline-flow-time">{selectedReport.generatedOn}</div>
                    </div>
                  </div>
                  <div className="timeline-flow-item">
                    <div className="timeline-flow-dot"></div>
                    <div className="timeline-flow-content">
                      <div className="timeline-flow-title">Validated against hospital EHR database records</div>
                      <div className="timeline-flow-time">{selectedReport.generatedOn}</div>
                    </div>
                  </div>
                  <div className="timeline-flow-item">
                    <div className="timeline-flow-dot"></div>
                    <div className="timeline-flow-content">
                      <div className="timeline-flow-title">Digital signature stamped for compliance</div>
                      <div className="timeline-flow-time">{selectedReport.generatedOn}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer-actions">
              <button
                type="button"
                className="modal-btn-outline"
                onClick={() => window.print()}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print Report
              </button>
              <button
                type="button"
                className="modal-btn-solid"
                onClick={() => {
                  if (onOpenPdfModal) onOpenPdfModal();
                  else alert(`Downloading official PDF for ${selectedReport.name}`);
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DOCTOR GENERATE PATIENT CLINICAL MONITORING REPORT MODAL FORM          */}
      {/* ========================================================================= */}
      {isGenerateReportModalOpen && (
        <div className="ihms-modal-backdrop" onClick={() => setIsGenerateReportModalOpen(false)}>
          <div
            className="ihms-modal-card generate-report-form-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="generate-modal-header">
              <div className="generate-header-left">
                <div className="generate-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0066ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div>
                  <h3 className="generate-modal-title">Generate Patient Clinical Report</h3>
                  <p className="generate-modal-subtitle">
                    Doctor Entry Portal • Add clinical monitoring vitals and deterioration risk evaluation
                  </p>
                </div>
              </div>

              <div className="generate-header-actions">
                <button
                  type="button"
                  className="btn-fill-sample-data"
                  onClick={handleFillSampleReportData}
                  title="Auto-fill realistic clinical vitals for fast testing"
                >
                  ⚡ Fill Sample Vitals
                </button>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsGenerateReportModalOpen(false)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleGenerateReportSubmit} className="generate-report-form">
              {/* Section 1: Patient Demographics & Location */}
              <div className="form-section-card">
                <div className="form-section-title-row">
                  <span className="section-title-icon">👤</span>
                  <h4 className="form-section-title">Patient Demographics & Hospital Location</h4>
                </div>

                <div className="form-grid-3">
                  <div className="form-field-group">
                    <label className="form-field-label">Patient ID</label>
                    <input
                      type="text"
                      className="form-input-control"
                      value={reportFormData.patient_id}
                      onChange={(e) => setReportFormData({ ...reportFormData, patient_id: e.target.value })}
                      placeholder="e.g. PAT-002501"
                      required
                    />
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">First Name *</label>
                    <input
                      type="text"
                      className="form-input-control"
                      value={reportFormData.first_name}
                      onChange={(e) => setReportFormData({ ...reportFormData, first_name: e.target.value })}
                      placeholder="e.g. Ramesh"
                      required
                    />
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Last Name *</label>
                    <input
                      type="text"
                      className="form-input-control"
                      value={reportFormData.last_name}
                      onChange={(e) => setReportFormData({ ...reportFormData, last_name: e.target.value })}
                      placeholder="e.g. Kadam"
                      required
                    />
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Age (Years) *</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      className="form-input-control"
                      value={reportFormData.age}
                      onChange={(e) => setReportFormData({ ...reportFormData, age: e.target.value })}
                      placeholder="e.g. 45"
                      required
                    />
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Gender</label>
                    <select
                      className="form-select-control"
                      value={reportFormData.gender}
                      onChange={(e) => setReportFormData({ ...reportFormData, gender: e.target.value })}
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Care Location / Unit</label>
                    <select
                      className="form-select-control"
                      value={reportFormData.care_unit}
                      onChange={(e) => setReportFormData({ ...reportFormData, care_unit: e.target.value })}
                    >
                      <option value="General Ward">General Ward</option>
                      <option value="Private Inpatient Unit">Private Inpatient Unit</option>
                      <option value="ICU">ICU</option>
                      <option value="ICU / Critical Care">ICU / Critical Care</option>
                      <option value="Emergency Department">Emergency Department</option>
                      <option value="Step Down Unit">Step Down Unit</option>
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Bed Number *</label>
                    <input
                      type="text"
                      className="form-input-control"
                      value={reportFormData.bed_no}
                      onChange={(e) => setReportFormData({ ...reportFormData, bed_no: e.target.value })}
                      placeholder="e.g. GW 505 or ICU-04"
                      required
                    />
                  </div>

                  <div className="form-field-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-field-label">Attending Doctor / Physician</label>
                    <input
                      type="text"
                      className="form-input-control"
                      value={reportFormData.doctor_name}
                      onChange={(e) => setReportFormData({ ...reportFormData, doctor_name: e.target.value })}
                      placeholder="e.g. Dr. Amit Deshmukh"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Physiological Monitoring Vitals */}
              <div className="form-section-card">
                <div className="form-section-title-row">
                  <span className="section-title-icon">🩺</span>
                  <h4 className="form-section-title">Physiological Monitoring Parameters (Patient Vitals)</h4>
                </div>

                <div className="form-grid-4">
                  <div className="form-field-group">
                    <label className="form-field-label">Systolic BP (mmHg) *</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        className="form-input-control"
                        value={reportFormData.systolic_bp_mmhg}
                        onChange={(e) => setReportFormData({ ...reportFormData, systolic_bp_mmhg: e.target.value })}
                        placeholder="120"
                        required
                      />
                      <span className="input-unit-tag">mmHg</span>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Diastolic BP (mmHg) *</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        className="form-input-control"
                        value={reportFormData.diastolic_bp_mmhg}
                        onChange={(e) => setReportFormData({ ...reportFormData, diastolic_bp_mmhg: e.target.value })}
                        placeholder="80"
                        required
                      />
                      <span className="input-unit-tag">mmHg</span>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Oxygen Saturation (SpO₂) *</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        step="0.1"
                        className="form-input-control"
                        value={reportFormData.spo2_percent}
                        onChange={(e) => setReportFormData({ ...reportFormData, spo2_percent: e.target.value })}
                        placeholder="98.5"
                        required
                      />
                      <span className="input-unit-tag">%</span>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Blood Glucose *</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        className="form-input-control"
                        value={reportFormData.blood_glucose_mg_dl}
                        onChange={(e) => setReportFormData({ ...reportFormData, blood_glucose_mg_dl: e.target.value })}
                        placeholder="100"
                        required
                      />
                      <span className="input-unit-tag">mg/dL</span>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Heart Rate (HR) *</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        className="form-input-control"
                        value={reportFormData.heart_rate_bpm}
                        onChange={(e) => setReportFormData({ ...reportFormData, heart_rate_bpm: e.target.value })}
                        placeholder="76"
                        required
                      />
                      <span className="input-unit-tag">bpm</span>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Respiratory Rate (RR)</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        className="form-input-control"
                        value={reportFormData.respiratory_rate_bpm}
                        onChange={(e) => setReportFormData({ ...reportFormData, respiratory_rate_bpm: e.target.value })}
                        placeholder="18"
                      />
                      <span className="input-unit-tag">bpm</span>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Body Temperature</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        step="0.1"
                        className="form-input-control"
                        value={reportFormData.temperature_c}
                        onChange={(e) => setReportFormData({ ...reportFormData, temperature_c: e.target.value })}
                        placeholder="37.0"
                      />
                      <span className="input-unit-tag">°C</span>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Urine Output</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        step="0.1"
                        className="form-input-control"
                        value={reportFormData.urine_output_ml_hr}
                        onChange={(e) => setReportFormData({ ...reportFormData, urine_output_ml_hr: e.target.value })}
                        placeholder="50.0"
                      />
                      <span className="input-unit-tag">mL/hr</span>
                    </div>
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">GCS Score (3 - 15)</label>
                    <input
                      type="number"
                      min="3"
                      max="15"
                      className="form-input-control"
                      value={reportFormData.gcs_score}
                      onChange={(e) => setReportFormData({ ...reportFormData, gcs_score: e.target.value })}
                      placeholder="15"
                    />
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Pain Score (0 - 10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      className="form-input-control"
                      value={reportFormData.pain_score}
                      onChange={(e) => setReportFormData({ ...reportFormData, pain_score: e.target.value })}
                      placeholder="2"
                    />
                  </div>

                  <div className="form-field-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-field-label">ECG Rhythm</label>
                    <select
                      className="form-select-control"
                      value={reportFormData.ecg_rhythm}
                      onChange={(e) => setReportFormData({ ...reportFormData, ecg_rhythm: e.target.value })}
                    >
                      <option value="Sinus Rhythm">Normal Sinus Rhythm</option>
                      <option value="Sinus Tachycardia">Sinus Tachycardia</option>
                      <option value="Sinus Bradycardia">Sinus Bradycardia</option>
                      <option value="Atrial Fibrillation">Atrial Fibrillation</option>
                      <option value="ST-T Changes">ST-T Segment Changes</option>
                      <option value="Not Ordered">Not Ordered</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Monitoring Level & Clinical Evaluation */}
              <div className="form-section-card">
                <div className="form-section-title-row">
                  <span className="section-title-icon">🛡️</span>
                  <h4 className="form-section-title">Monitoring Level & Clinical Deterioration Assessment</h4>
                </div>

                <div className="form-grid-2">
                  <div className="form-field-group">
                    <label className="form-field-label">Monitoring Level</label>
                    <select
                      className="form-select-control"
                      value={reportFormData.monitoring_level}
                      onChange={(e) => setReportFormData({ ...reportFormData, monitoring_level: e.target.value })}
                    >
                      <option value="Routine">Routine (Standard Ward Monitoring)</option>
                      <option value="High Risk">High Risk (Requires Urgent Monitoring)</option>
                      <option value="Enhanced">Enhanced (Frequent Observation)</option>
                      <option value="Critical">Critical (Intensive ICU Care)</option>
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Deterioration Risk Evaluation</label>
                    <select
                      className="form-select-control"
                      value={reportFormData.deterioration_risk}
                      onChange={(e) => setReportFormData({ ...reportFormData, deterioration_risk: e.target.value })}
                    >
                      <option value="Low">Low Risk (Hemodynamically Stable)</option>
                      <option value="Moderate">Moderate Risk (Mild Signs)</option>
                      <option value="High">High Risk (Active Alert)</option>
                    </select>
                  </div>

                  <div className="form-field-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-field-label">Doctor's Clinical Notes / Plan of Care</label>
                    <textarea
                      className="form-textarea-control"
                      rows="3"
                      value={reportFormData.clinical_notes}
                      onChange={(e) => setReportFormData({ ...reportFormData, clinical_notes: e.target.value })}
                      placeholder="Doctor's clinical findings, medication adjustments, and follow-up plan..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Form Actions Footer */}
              <div className="generate-modal-footer">
                <button
                  type="button"
                  className="modal-btn-outline"
                  onClick={() => setIsGenerateReportModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-btn-solid generate-save-btn"
                  disabled={isSubmittingReport}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  {isSubmittingReport ? 'Saving Report...' : 'Generate & Save Patient Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
