import React, { useState, useEffect } from 'react';

export default function ServiceCoordination({ requests = [] }) {
  const safeRequests = Array.isArray(requests)
    ? requests
    : (requests?.results || []);
  const [serviceRequests, setServiceRequests] = useState(safeRequests);
  const [actionAlert, setActionAlert] = useState(null);

  useEffect(() => {
    if (Array.isArray(requests)) {
      setServiceRequests(requests);
    } else if (requests && Array.isArray(requests.results)) {
      setServiceRequests(requests.results);
    }
  }, [requests]);

  const handleTransition = (reqId, nextStatus, nextLabel) => {
    setServiceRequests((prev) =>
      prev.map((r) =>
        r.request_id === reqId
          ? { ...r, status: nextStatus, status_display: nextLabel }
          : r
      )
    );
    setActionAlert(`Service Request ${reqId} transitioned to "${nextLabel}". Department notified.`);
    setTimeout(() => setActionAlert(null), 3500);
  };

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
            Multi-Department Service Coordination Center
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            Synchronizes clinical care paths across Outpatient Consultations, Diagnostic Laboratory, Pharmacy Dispensing, and Follow-up / Discharge.
          </p>
        </div>
        <span className="badge-stable" style={{ fontSize: '0.8rem' }}>
          Realtime Inter-Department Flow
        </span>
      </div>

      {actionAlert && (
        <div
          style={{
            background: '#e0f2fe',
            border: '1px solid #bae6fd',
            borderRadius: 8,
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            color: '#0369a1',
            fontSize: '0.86rem',
            fontWeight: 600,
          }}
        >
          ✓ {actionAlert}
        </div>
      )}

      {/* 5-Stage Stepper */}
      <div className="service-stepper">
        <div className="stepper-step active">
          <div className="step-number">1</div>
          <div className="step-title">General Medicine</div>
          <div className="step-desc">Doctor Examination & Assessment</div>
        </div>

        <div className="stepper-step active">
          <div className="step-number">2</div>
          <div className="step-title">Laboratory</div>
          <div className="step-desc">Sample Intake & Automated Run</div>
        </div>

        <div className="stepper-step">
          <div className="step-number" style={{ background: '#4338ca' }}>3</div>
          <div className="step-title">Results & Doctor Review</div>
          <div className="step-desc">Verified EMR Integration</div>
        </div>

        <div className="stepper-step">
          <div className="step-number" style={{ background: '#64748b' }}>4</div>
          <div className="step-title">Pharmacy</div>
          <div className="step-desc">Authorized Dispensing</div>
        </div>

        <div className="stepper-step">
          <div className="step-number" style={{ background: '#64748b' }}>5</div>
          <div className="step-title">Follow-up / Discharge</div>
          <div className="step-desc">Care Plan & Discharge Summary</div>
        </div>
      </div>

      {/* Active Service Requests */}
      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
        Active Inter-Departmental Service Orders
      </h4>
      <div className="data-table-container">
        <table className="clinical-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Patient</th>
              <th>Destination Department</th>
              <th>Service Details</th>
              <th>Ordering Doctor</th>
              <th>Current Stage</th>
              <th>Transition Action</th>
            </tr>
          </thead>
          <tbody>
            {serviceRequests.map((req) => (
              <tr key={req.request_id}>
                <td>
                  <b style={{ color: '#0284c7' }}>{req.request_id}</b>
                </td>
                <td>
                  <b>{req.patient_name}</b>
                </td>
                <td>
                  <span
                    style={{
                      background: req.department === 'Laboratory' ? '#e0f2fe' : '#ede9fe',
                      color: req.department === 'Laboratory' ? '#0369a1' : '#6d28d9',
                      padding: '0.2rem 0.55rem',
                      borderRadius: 4,
                      fontSize: '0.76rem',
                      fontWeight: 700,
                    }}
                  >
                    {req.department}
                  </span>
                </td>
                <td>{req.details}</td>
                <td>{req.ordering_doctor_name}</td>
                <td>
                  <span
                    className={
                      req.status === 'completed'
                        ? 'badge-stable'
                        : req.status === 'in_progress'
                        ? 'badge-stable'
                        : 'badge-urgent'
                    }
                  >
                    {req.status_display}
                  </span>
                </td>
                <td>
                  {req.department === 'Laboratory' && req.status !== 'completed' && (
                    <button
                      type="button"
                      className="btn-clinical btn-primary"
                      style={{ padding: '0.25rem 0.65rem', fontSize: '0.74rem' }}
                      onClick={() =>
                        handleTransition(req.request_id, 'completed', 'Results Published to Doctor')
                      }
                    >
                      Publish Results →
                    </button>
                  )}

                  {req.department === 'Pharmacy' && req.status !== 'completed' && (
                    <button
                      type="button"
                      className="btn-clinical btn-indigo"
                      style={{ padding: '0.25rem 0.65rem', fontSize: '0.74rem' }}
                      onClick={() =>
                        handleTransition(req.request_id, 'completed', 'Dispensed to Patient')
                      }
                    >
                      Dispense Meds →
                    </button>
                  )}

                  {req.status === 'completed' && (
                    <span style={{ fontSize: '0.76rem', color: '#0369a1', fontWeight: 600 }}>
                      ✓ Completed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
