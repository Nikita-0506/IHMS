import React, { useState } from 'react';

export default function PriorityQueue({ queueData, onSelectPatient }) {
  const [alertNotice, setAlertNotice] = useState(null);

  const emergencyPatients = queueData?.emergency_critical || [];
  const urgentPatients = queueData?.urgent_high_concern || [];
  const routinePatients = queueData?.routine_stable || [];

  const triggerErAlert = (patientName) => {
    setAlertNotice(`EMERGENCY BYPASS ACTIVE: Resuscitation Team alerted for ${patientName}. ER Bay 1 dispatched immediately.`);
    setTimeout(() => setAlertNotice(null), 5000);
  };

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {/* Emergency Bypass Banner */}
      <div className="emergency-bypass-banner">
        <div>
          <h4>CRITICAL EMERGENCY BYPASS POLICY ACTIVE</h4>
          <p>
            Emergency & Critical cases (serious accidents, difficulty breathing, unconsciousness, severe shock) alert the emergency resuscitation team immediately and bypass standard appointment queues <i>without waiting for background AI summaries</i>.
          </p>
        </div>
        <button
          type="button"
          className="btn-clinical btn-critical"
          onClick={() => triggerErAlert('Vikram Singh (P-10248)')}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Alert Resuscitation Team
        </button>
      </div>

      {alertNotice && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 8,
            padding: '0.85rem 1rem',
            marginBottom: '1rem',
            color: '#b91c1c',
            fontSize: '0.86rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span>🚨</span> {alertNotice}
        </div>
      )}

      {/* Triage Priority Queue Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
            Clinical Priority & Triage Queue
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            Severity-graded clinical triage. Order is determined strictly by physiological risk and clinical necessity, not by booking timestamp or patient category.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span className="badge-critical">{emergencyPatients.length} Emergency</span>
          <span className="badge-urgent">{urgentPatients.length} Urgent</span>
          <span className="badge-stable">{routinePatients.length} Routine</span>
        </div>
      </div>

      <div className="data-table-container">
        <table className="clinical-table">
          <thead>
            <tr>
              <th>Priority Level</th>
              <th>Patient ID & Name</th>
              <th>Clinical Condition</th>
              <th>Patient Category</th>
              <th>Assigned Doctor / Dept</th>
              <th>Workflow Action</th>
            </tr>
          </thead>
          <tbody>
            {/* 1. Emergency / Critical */}
            {emergencyPatients.map((p, idx) => (
              <tr key={`em-${idx}`} style={{ background: '#fef2f2' }}>
                <td>
                  <span className="badge-critical" style={{ fontWeight: 800 }}>
                    1. Emergency / Critical
                  </span>
                </td>
                <td>
                  <b>{p.patient_id} · {p.name}</b>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Age: {p.age} · {p.gender}</div>
                </td>
                <td style={{ color: '#b91c1c', fontWeight: 700 }}>{p.current_condition}</td>
                <td>{p.patient_type}</td>
                <td>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{p.assigned_doctor}</span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-clinical btn-critical"
                    style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                    onClick={() => triggerErAlert(p.name)}
                  >
                    Immediate Resuscitation
                  </button>
                </td>
              </tr>
            ))}

            {/* 2. Urgent / High Concern */}
            {urgentPatients.map((p, idx) => (
              <tr key={`urg-${idx}`} style={{ background: '#fffbeb' }}>
                <td>
                  <span className="badge-urgent" style={{ fontWeight: 800 }}>
                    2. Urgent / High Concern
                  </span>
                </td>
                <td>
                  <b>{p.patient_id} · {p.name}</b>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Age: {p.age} · {p.gender}</div>
                </td>
                <td style={{ color: '#b45309', fontWeight: 700 }}>{p.current_condition}</td>
                <td>{p.patient_type}</td>
                <td>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{p.assigned_doctor}</span>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-clinical btn-indigo"
                    style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                    onClick={() => onSelectPatient && onSelectPatient(p.patient_id)}
                  >
                    Prompt Review →
                  </button>
                </td>
              </tr>
            ))}

            {/* 3. Routine / Stable */}
            {routinePatients.map((p, idx) => (
              <tr key={`rt-${idx}`}>
                <td>
                  <span className="badge-stable">3. Routine / Stable</span>
                </td>
                <td>
                  <b>{p.patient_id} · {p.name}</b>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Age: {p.age} · {p.gender}</div>
                </td>
                <td>{p.current_condition}</td>
                <td>{p.patient_type}</td>
                <td>{p.assigned_doctor}</td>
                <td>
                  <button
                    type="button"
                    className="btn-clinical btn-outline"
                    style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    Scheduled Queue
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
