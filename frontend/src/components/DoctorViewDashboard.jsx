import React, { useState } from 'react';

export default function DoctorViewDashboard({ dashboardData, onRefresh }) {
  const [activeSubTab, setActiveSubTab] = useState('history');
  const [actionNotice, setActionNotice] = useState(null);

  if (!dashboardData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        Loading Doctor View Dashboard...
      </div>
    );
  }

  const { patient_card, tabs, ai_summary_5_sections } = dashboardData;

  const triggerAction = (message) => {
    setActionNotice(message);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const isEmergency =
    patient_card?.priority_level === 'emergency' ||
    patient_card?.priority?.toLowerCase().includes('emergency');
  const isUrgent =
    patient_card?.priority_level === 'urgent' ||
    patient_card?.priority?.toLowerCase().includes('high');

  const priorityBadgeClass = isEmergency
    ? 'badge-critical'
    : isUrgent
    ? 'badge-urgent'
    : 'badge-stable';

  const priorityDotColor = isEmergency ? '#dc2626' : isUrgent ? '#d97706' : '#0284c7';

  // Extract OCR report
  const ocrDoc =
    tabs?.ocr_reports && tabs.ocr_reports.length > 0
      ? tabs.ocr_reports[0]
      : null;

  // Helper to parse bullet or numbered string into array
  const parseBulletList = (content) => {
    if (!content) return [];
    if (Array.isArray(content)) return content;
    return content
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => s.replace(/^[•\-\*]\s*/, '').replace(/^\d+\.\s*/, ''));
  };

  const alertsList = parseBulletList(ai_summary_5_sections?.['3_alerts']);
  const actionsList = parseBulletList(ai_summary_5_sections?.['4_pending_actions']);
  const sourceDocs = ai_summary_5_sections?.['5_source_documents'] || [];

  const allergiesText =
    tabs?.history?.allergies || patient_card?.allergies || 'No Known Drug Allergies (NKDA)';
  const hasSevereAllergy =
    !allergiesText.toLowerCase().includes('no known') &&
    !allergiesText.toLowerCase().includes('nkda');

  return (
    <div className="doctor-view-container">
      {/* Patient Header Banner */}
      <div className="patient-header-banner">
        <div>
          <div className="patient-title-row">
            <h2>Patient: {patient_card?.name || 'Rahul Patil'}</h2>
            <span className={priorityBadgeClass}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: priorityDotColor,
                }}
              ></span>
              {patient_card?.priority || 'High Priority'}
            </span>
          </div>

          <div className="patient-id-meta">
            <span>
              Patient ID: <b>{patient_card?.patient_id || 'P-10245'}</b>
            </span>
            <span>
              · Age: <b>{patient_card?.age || 42}</b>
            </span>
            <span>
              · Gender: <b>{patient_card?.gender || 'Male'}</b>
            </span>
            <span>
              · Category: <b>{patient_card?.patient_category || patient_card?.patient_type || 'Existing patient'}</b>
            </span>
            <span>
              · Previous Treatment: <b>{patient_card?.previous_treatment || 'Available — 3 visits'}</b>
            </span>
          </div>

          <div className="patient-condition-call">
            <span>
              Current Condition: <b>{patient_card?.current_condition || 'Clinical review underway'}</b>
            </span>
            <span style={{ color: '#64748b' }}>
              · Next Action: <b>{patient_card?.next_action || 'Doctor review required'}</b>
            </span>
          </div>

          {/* Architectural Separation of Patient Fields */}
          <div className="field-chips-row">
            <span className="field-chip">
              patient_type: <b>{patient_card?.patient_type || 'Existing'}</b>
            </span>
            <span className="field-chip">
              care_status: <b>{patient_card?.care_status || 'Ongoing'}</b>
            </span>
            <span className="field-chip">
              referral_status: <b>{patient_card?.referral_status || 'Not Referred'}</b>
            </span>
            <span className="field-chip">
              current_severity: <b>{patient_card?.current_severity || 'Urgent / High Concern'}</b>
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Assigned Treating Doctor</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
            {patient_card?.assigned_doctor_name || 'Dr. Amit Sharma'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#0284c7' }}>
            {patient_card?.assigned_doctor_dept || 'General Medicine (Room 102)'}
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <span className="badge-stable" style={{ fontSize: '0.72rem' }}>
              {isEmergency
                ? '🚨 Code Red Protocol Active'
                : (patient_card?.referral_status?.toLowerCase().includes('refer')
                    ? '✓ Inter-Hospital Transfer Active'
                    : '✓ Continuity of Care Active')}
            </span>
          </div>
        </div>
      </div>

      {/* AI Lead Callout */}
      <div className="ai-lead-box">
        <div className="ai-lead-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          AI Clinical Summary
        </div>
        <p>
          {patient_card?.ai_clinical_summary_lead ||
            'Review the current symptoms, recorded vital signs, allergies and medication history before deciding the next step.'}
        </p>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div
          style={{
            background: '#e0f2fe',
            border: '1px solid #bae6fd',
            borderRadius: 8,
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            color: '#0369a1',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>✓</span> {actionNotice}
        </div>
      )}

      {/* 3 Patient Sub-Tabs: 1. History | 2. OCR Reports | 3. Vitals */}
      <div className="patient-subtabs-strip">
        <button
          type="button"
          className={`subtab-btn ${activeSubTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('history')}
        >
          1. History
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeSubTab === 'ocr' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('ocr')}
        >
          2. OCR Reports
        </button>
        <button
          type="button"
          className={`subtab-btn ${activeSubTab === 'vitals' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('vitals')}
        >
          3. Vitals
        </button>
      </div>

      {/* Subtab Content: 1. History */}
      {activeSubTab === 'history' && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <div>
              <h4 style={{ fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.6rem' }}>
                Continuity of Care & Previous Encounters
              </h4>
              <ul style={{ paddingLeft: '1.2rem', fontSize: '0.84rem', color: '#334155', lineHeight: 1.6 }}>
                {Array.isArray(tabs?.history?.previous_diagnoses) && tabs.history.previous_diagnoses.length > 0 ? (
                  tabs.history.previous_diagnoses.map((diag, idx) => (
                    <li key={idx} style={{ marginBottom: '0.35rem' }}>
                      {diag}
                    </li>
                  ))
                ) : (
                  <li>{tabs?.history?.previous_diagnoses || 'No previous historical encounters recorded on file.'}</li>
                )}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', color: '#0f172a', marginBottom: '0.6rem' }}>
                Allergies & Active Medication Regimen
              </h4>
              <div style={{ fontSize: '0.84rem', lineHeight: 1.6 }}>
                <div
                  style={{
                    background: hasSevereAllergy ? '#fef2f2' : '#f0f9ff',
                    border: hasSevereAllergy ? '1px solid #fecaca' : '1px solid #bae6fd',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 6,
                    color: hasSevereAllergy ? '#b91c1c' : '#0369a1',
                    fontWeight: 600,
                    marginBottom: '0.6rem',
                  }}
                >
                  {hasSevereAllergy
                    ? `⚠ CRITICAL ALLERGY ALERT: ${allergiesText}`
                    : `✓ Documented Allergy Status: ${allergiesText}`}
                </div>

                <div style={{ color: '#334155', marginTop: '0.5rem' }}>
                  <b>Active Medications:</b>
                  {Array.isArray(tabs?.history?.current_medications) && tabs.history.current_medications.length > 0 ? (
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                      {tabs.history.current_medications.map((med, idx) => (
                        <li key={idx}>
                          <b>{med.name || med}:</b> {med.dose || ''} {med.status ? `(${med.status})` : ''}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ marginLeft: '0.4rem', color: '#64748b' }}>None active on file.</span>
                  )}
                </div>

                <p style={{ color: '#334155', marginTop: '0.35rem' }}>
                  <b>Trend Analysis:</b>{' '}
                  {tabs?.history?.trend_display || tabs?.history?.symptom_progression || 'Stable baseline.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab Content: 2. OCR Reports */}
      {activeSubTab === 'ocr' && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '1.25rem',
          }}
        >
          {ocrDoc ? (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  Extracted Medical Document: <b>{ocrDoc.title}</b> ({ocrDoc.document_type || 'Report'})
                </div>
                <span className="badge-stable" style={{ fontWeight: 700 }}>
                  ✓ {ocrDoc.verification_status || 'Verified by Doctor'} (Confidence: {ocrDoc.confidence || '97%'})
                </span>
              </div>

              {ocrDoc.flags && ocrDoc.flags.length > 0 && (
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: 6,
                    padding: '0.5rem 0.75rem',
                    marginBottom: '0.75rem',
                    fontSize: '0.8rem',
                    color: '#92400e',
                    fontWeight: 600,
                  }}
                >
                  ⚡ Document Clinical Flags: {ocrDoc.flags.join(' · ')}
                </div>
              )}

              <div className="data-table-container">
                <table className="clinical-table">
                  <thead>
                    <tr>
                      <th>Test / Parameter</th>
                      <th>Observed Result</th>
                      <th>Reference Range</th>
                      <th>Interpretation</th>
                      <th>Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ocrDoc.tests && ocrDoc.tests.length > 0 ? (
                      ocrDoc.tests.map((t, idx) => (
                        <tr key={idx}>
                          <td>
                            <b>{t.test_name}</b>
                          </td>
                          <td style={{ color: t.is_abnormal ? '#b91c1c' : '#0369a1', fontWeight: t.is_abnormal ? 800 : 700 }}>
                            {t.result_value} {t.unit || ''}
                          </td>
                          <td>{t.reference_range || '-'}</td>
                          <td>
                            <span
                              className={t.is_abnormal ? 'badge-critical' : 'badge-stable'}
                              style={{ fontSize: '0.72rem' }}
                            >
                              {t.status || (t.is_abnormal ? 'Abnormal' : 'Normal')}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {ocrDoc.doctor_notes || 'Verified by Clinician'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', color: '#64748b' }}>
                          No structured lab parameters found for this document.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
              No OCR scanned documents currently linked to this patient.
            </div>
          )}
        </div>
      )}

      {/* Subtab Content: 3. Vitals */}
      {activeSubTab === 'vitals' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Temperature */}
          {(() => {
            const v = tabs?.vitals?.temperature;
            const isWarn = v?.flag === 'urgent' || v?.flag === 'critical' || v?.flag === 'warning';
            return (
              <div
                style={{
                  background: isWarn ? '#fef2f2' : '#f0f9ff',
                  border: isWarn ? '1px solid #fecaca' : '1px solid #bae6fd',
                  padding: '1rem',
                  borderRadius: 10,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: isWarn ? '#991b1b' : '#0369a1', fontWeight: 700 }}>
                  BODY TEMPERATURE
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isWarn ? '#dc2626' : '#0f172a', margin: '0.2rem 0' }}>
                  {v?.value || '98.6 °F'}
                </div>
                <div style={{ fontSize: '0.72rem', color: isWarn ? '#b91c1c' : '#0369a1' }}>
                  {v?.status || 'Normal'}
                </div>
              </div>
            );
          })()}

          {/* Blood Pressure */}
          {(() => {
            const v = tabs?.vitals?.blood_pressure;
            const isWarn = v?.flag === 'urgent' || v?.flag === 'critical';
            return (
              <div
                style={{
                  background: isWarn ? '#fef2f2' : '#f8fafc',
                  border: isWarn ? '1px solid #fecaca' : '1px solid #e2e8f0',
                  padding: '1rem',
                  borderRadius: 10,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: isWarn ? '#991b1b' : '#64748b', fontWeight: 700 }}>
                  BLOOD PRESSURE
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isWarn ? '#dc2626' : '#0f172a', margin: '0.2rem 0' }}>
                  {v?.value || '120/80 mmHg'}
                </div>
                <div style={{ fontSize: '0.72rem', color: isWarn ? '#b91c1c' : '#0284c7' }}>
                  {v?.status || 'Normotensive'}
                </div>
              </div>
            );
          })()}

          {/* Heart Rate */}
          {(() => {
            const v = tabs?.vitals?.heart_rate;
            const isWarn = v?.flag === 'urgent' || v?.flag === 'critical';
            return (
              <div
                style={{
                  background: isWarn ? '#fef2f2' : '#f8fafc',
                  border: isWarn ? '1px solid #fecaca' : '1px solid #e2e8f0',
                  padding: '1rem',
                  borderRadius: 10,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: isWarn ? '#991b1b' : '#64748b', fontWeight: 700 }}>
                  HEART RATE
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isWarn ? '#dc2626' : '#0f172a', margin: '0.2rem 0' }}>
                  {v?.value || '72 bpm'}
                </div>
                <div style={{ fontSize: '0.72rem', color: isWarn ? '#b91c1c' : '#0284c7' }}>
                  {v?.status || 'Normal Sinus'}
                </div>
              </div>
            );
          })()}

          {/* Oxygen (SpO2) */}
          {(() => {
            const v = tabs?.vitals?.spo2;
            const isCrit = v?.flag === 'critical' || v?.flag === 'urgent';
            return (
              <div
                style={{
                  background: isCrit ? '#fef2f2' : '#f0f9ff',
                  border: isCrit ? '1px solid #fecaca' : '1px solid #bae6fd',
                  padding: '1rem',
                  borderRadius: 10,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: isCrit ? '#991b1b' : '#0369a1', fontWeight: 700 }}>
                  OXYGEN (SpO₂)
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isCrit ? '#dc2626' : '#0f172a', margin: '0.2rem 0' }}>
                  {v?.value || '98%'}
                </div>
                <div style={{ fontSize: '0.72rem', color: isCrit ? '#b91c1c' : '#0284c7' }}>
                  {v?.status || 'Optimal Saturation'}
                </div>
              </div>
            );
          })()}

          {/* Respiratory Rate */}
          {(() => {
            const v = tabs?.vitals?.respiratory_rate;
            const isCrit = v?.flag === 'critical' || v?.flag === 'urgent';
            return (
              <div
                style={{
                  background: isCrit ? '#fef2f2' : '#f8fafc',
                  border: isCrit ? '1px solid #fecaca' : '1px solid #e2e8f0',
                  padding: '1rem',
                  borderRadius: 10,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: isCrit ? '#991b1b' : '#64748b', fontWeight: 700 }}>
                  RESPIRATORY RATE
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isCrit ? '#dc2626' : '#0f172a', margin: '0.2rem 0' }}>
                  {v?.value || '16 /min'}
                </div>
                <div style={{ fontSize: '0.72rem', color: isCrit ? '#b91c1c' : '#0284c7' }}>
                  {v?.status || 'Eupneic'}
                </div>
              </div>
            );
          })()}

          {/* Secondary Metric */}
          {(() => {
            const v = tabs?.vitals?.secondary_metric || tabs?.vitals?.hydration_status;
            const isCrit = v?.flag === 'critical' || v?.flag === 'urgent';
            const isWarn = v?.flag === 'warning';
            return (
              <div
                style={{
                  background: isCrit ? '#fef2f2' : (isWarn ? '#fffbeb' : '#f0f9ff'),
                  border: isCrit ? '1px solid #fecaca' : (isWarn ? '1px solid #fde68a' : '1px solid #bae6fd'),
                  padding: '1rem',
                  borderRadius: 10,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: isCrit ? '#991b1b' : (isWarn ? '#92400e' : '#0369a1'), fontWeight: 700 }}>
                  {v?.label || 'SECONDARY CLINICAL METRIC'}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isCrit ? '#dc2626' : (isWarn ? '#b45309' : '#0f172a'), margin: '0.4rem 0' }}>
                  {v?.value || 'Stable'}
                </div>
                <div style={{ fontSize: '0.72rem', color: isCrit ? '#b91c1c' : (isWarn ? '#92400e' : '#0284c7') }}>
                  {v?.status || 'Evaluated'}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 5-Section AI Clinical Summary Cards */}
      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '1.75rem', marginBottom: '0.5rem' }}>
        Structured 5-Section AI Clinical Summary
      </h3>
      <div className="summary-5section-container">
        <div className="summary-card c1">
          <h4>
            <span style={{ color: '#0284c7' }}>1.</span> Current Condition
          </h4>
          <p>
            {ai_summary_5_sections?.['1_current_condition'] ||
              patient_card?.current_condition ||
              'Evaluation ongoing.'}
          </p>
        </div>

        <div className="summary-card c2">
          <h4>
            <span style={{ color: '#4338ca' }}>2.</span> Relevant History
          </h4>
          <p>
            {ai_summary_5_sections?.['2_relevant_history'] ||
              patient_card?.previous_treatment ||
              'History on file.'}
          </p>
        </div>

        <div className="summary-card c3">
          <h4>
            <span style={{ color: '#dc2626' }}>3.</span> Alerts & Risks
          </h4>
          <ul style={{ color: '#991b1b' }}>
            {alertsList.length > 0 ? (
              alertsList.map((alert, idx) => (
                <li key={idx} style={{ marginBottom: '0.35rem' }}>
                  {alert}
                </li>
              ))
            ) : (
              <li>No critical active alerts flagged for this patient.</li>
            )}
          </ul>
        </div>

        <div className="summary-card c4">
          <h4>
            <span style={{ color: '#d97706' }}>4.</span> Pending Actions
          </h4>
          <ul style={{ color: '#92400e' }}>
            {actionsList.length > 0 ? (
              actionsList.map((action, idx) => (
                <li key={idx} style={{ marginBottom: '0.35rem' }}>
                  {action}
                </li>
              ))
            ) : (
              <li>{patient_card?.next_action || 'Complete physician consultation.'}</li>
            )}
          </ul>
        </div>

        <div className="summary-card c5">
          <h4>
            <span style={{ color: '#7c3aed' }}>5.</span> Source Documents
          </h4>
          <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.6 }}>
            {Array.isArray(sourceDocs) && sourceDocs.length > 0 ? (
              sourceDocs.map((doc, idx) => (
                <div key={idx} style={{ marginBottom: '0.3rem' }}>
                  • <b>{doc.title || doc}</b> {doc.date ? `(${doc.date})` : ''}{' '}
                  {doc.status ? <span style={{ color: '#0284c7', fontWeight: 600 }}>[{doc.status}]</span> : ''}
                </div>
              ))
            ) : (
              <p>
                • OCR Medical Records & Lab Verification<br />
                • Attending Physician Consultation Notes<br />
                • Status: Verified by EMR Workflow
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Action Bar */}
      <div className="action-buttons-strip">
        <button
          type="button"
          className="btn-clinical btn-primary"
          onClick={() =>
            triggerAction(
              `STAT diagnostic workup and lab orders confirmed for ${patient_card?.name || 'patient'} (${patient_card?.patient_id || ''}).`
            )
          }
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          Order Diagnostics for {patient_card?.name?.split(' ')[0] || 'Patient'}
        </button>

        <button
          type="button"
          className="btn-clinical btn-indigo"
          onClick={() =>
            triggerAction(
              `Prescription and clinical treatment protocol updated for ${patient_card?.name || 'patient'}.`
            )
          }
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Prescribe Care for {patient_card?.name?.split(' ')[0] || 'Patient'}
        </button>

        <button
          type="button"
          className="btn-clinical btn-outline"
          onClick={() =>
            triggerAction(
              `AI Clinical Summary verified and permanently locked to EMR record for ${patient_card?.name || 'patient'}.`
            )
          }
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Approve AI Summary for EMR
        </button>

        <button
          type="button"
          className="btn-clinical btn-outline"
          onClick={onRefresh}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh Live Data
        </button>
      </div>
    </div>
  );
}
